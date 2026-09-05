"""Per-seed student LoRA-SFT (R011/R012 pattern).

Protocol (task.md, verbatim): AutoModelForImageTextToText on Qwen3.5-9B; LoRA
ONLY on the language tower (regex ^model\\.language_model\\..* — excludes the
vision tower and projector); r=16/alpha=32/dropout=0.05/bias=none/CAUSAL_LM;
lr=1e-3; 1 epoch; per-device batch 2 x grad-accum 8 (effective 16 -> single
GPU); max_seq_len=1024; cosine; warmup_ratio=0.05; weight_decay=0.0; bf16;
adapter saved separately. Seed s drives shuffle/init.
"""
import argparse
import json
import math
import os
import sys
import time

import torch
from torch.utils.data import DataLoader

sys.path.insert(0, os.path.dirname(__file__))
from common import (GRAD_ACCUM, MAX_SEQ_LEN, MODEL_PATH, PER_DEVICE_BATCH,
                    RUNS, STUDENT_LR, STUDENT_TARGET_RE, TEACHER_LORA,
                    TRAIN_EPOCHS, WARMUP_RATIO, WEIGHT_DECAY, set_global_seed,
                    write_json)

# reuse dataset/collate from teacher script
sys.path.insert(0, os.path.dirname(__file__))
from teacher_sft import PairDataset, collate  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--arm", choices=["treated", "ctrlb"], required=True)
    ap.add_argument("--seed", type=int, required=True)
    ap.add_argument("--data", type=str, required=True, help="equalized {prompt,output} JSON")
    ap.add_argument("--adapter_out", type=str, required=True)
    ap.add_argument("--micro_batches", type=int, default=None, help="SANITY ONLY")
    ap.add_argument("--boundary_fallback", action="store_true",
                    help="pass-2 fix: allow conservative longest-common-prefix masking for the "
                         "rare BPE boundary re-merging pairs instead of aborting")
    args = ap.parse_args()
    OUT = os.path.join(RUNS, f"student_sft_s{args.seed}", args.arm)
    os.makedirs(OUT, exist_ok=True)
    set_global_seed(args.seed)

    from peft import LoraConfig, get_peft_model
    from transformers import (AutoModelForImageTextToText, AutoTokenizer,
                              get_cosine_schedule_with_warmup)

    tok = AutoTokenizer.from_pretrained(MODEL_PATH, trust_remote_code=True)
    pairs = json.load(open(args.data, encoding="utf-8"))
    print(f"[student-sft {args.arm} s{args.seed}] pairs={len(pairs)}")
    ds = PairDataset(pairs, tok, MAX_SEQ_LEN, boundary_fallback=args.boundary_fallback)
    print(f"[student-sft] tokenized={len(ds)} mask_fail={ds.n_mask_fail} "
          f"boundary_mask={ds.n_boundary_mask}")
    pad = tok.pad_token_id if tok.pad_token_id is not None else tok.eos_token_id
    g = torch.Generator().manual_seed(args.seed)
    dl = DataLoader(ds, batch_size=PER_DEVICE_BATCH, shuffle=True,
                    collate_fn=lambda b: collate(b, pad), generator=g, drop_last=False, num_workers=0)

    model = AutoModelForImageTextToText.from_pretrained(MODEL_PATH, dtype=torch.bfloat16,
                                                        trust_remote_code=True)
    model.to("cuda")
    cfg = LoraConfig(target_modules=STUDENT_TARGET_RE, **TEACHER_LORA)
    model = get_peft_model(model, cfg)
    # verify LoRA landed on the language tower only
    lora_modules = [n for n, m in model.named_modules() if "lora_A" in n]
    bad = [n for n in lora_modules if not n.startswith("base_model.model.model.language_model.")]
    print(f"[student-sft] lora modules={len(lora_modules)} off-language-tower={len(bad)}")
    if bad:
        print("OFFENDING:", bad[:10])
        raise RuntimeError("LoRA attached outside the language tower — aborting")
    model.gradient_checkpointing_enable()
    model.enable_input_require_grads()
    model.print_trainable_parameters()

    total_steps = math.ceil(len(ds) / (PER_DEVICE_BATCH * GRAD_ACCUM)) * TRAIN_EPOCHS
    warmup = math.ceil(WARMUP_RATIO * total_steps)
    opt = torch.optim.AdamW([p for p in model.parameters() if p.requires_grad],
                            lr=STUDENT_LR, weight_decay=WEIGHT_DECAY)
    sched = get_cosine_schedule_with_warmup(opt, warmup, total_steps)

    step, loss_acc, n_micro_acc, log_rows = 0, 0.0, 0, []
    t0 = time.time()
    model.train()
    n_micro_total = len(dl)
    for epoch in range(TRAIN_EPOCHS):
        for bi, batch in enumerate(dl):
            batch = {k: v.to("cuda") for k, v in batch.items()}
            out = model(**batch)
            # divide by the ACTUAL size of this accumulation window (handles a
            # final partial window under drop_last=False without mis-weighting)
            remaining = n_micro_total - bi
            window_size = min(GRAD_ACCUM, remaining)
            loss = out.loss / window_size
            loss.backward()
            loss_acc += loss.item()
            n_micro_acc += 1
            if (bi + 1) % GRAD_ACCUM == 0 or bi == n_micro_total - 1:
                torch.nn.utils.clip_grad_norm_([p for p in model.parameters() if p.requires_grad], 1.0)
                opt.step(); sched.step(); opt.zero_grad(set_to_none=True)
                step += 1
                if step % 20 == 0 or step == 1:
                    mean_loss = loss_acc / max(n_micro_acc, 1)
                    print(f"[student-sft {args.arm} s{args.seed}] step {step}/{total_steps} "
                          f"loss {mean_loss:.4f} lr {sched.get_last_lr()[0]:.2e} "
                          f"{time.time() - t0:.0f}s", flush=True)
                    log_rows.append({"step": step, "loss": mean_loss, "lr": sched.get_last_lr()[0]})
                    loss_acc, n_micro_acc = 0.0, 0
                if args.micro_batches and step >= args.micro_batches:
                    print("[student-sft] SANITY: reached --micro_batches cap")
                    break
        if args.micro_batches and step >= args.micro_batches:
            break

    os.makedirs(args.adapter_out, exist_ok=True)
    model.save_pretrained(args.adapter_out)
    write_json(os.path.join(OUT, "train_log.json"),
               {"arm": args.arm, "seed": args.seed, "adapter_out": args.adapter_out,
                "n_pairs": len(ds), "steps": step, "total_steps_planned": total_steps,
                "warmup_steps": warmup, "lr": STUDENT_LR, "epoch": TRAIN_EPOCHS,
                "wall_seconds": round(time.time() - t0, 1), "log": log_rows})
    print(f"STUDENT SFT DONE {args.arm} s{args.seed} ->", args.adapter_out)


if __name__ == "__main__":
    main()
