"""R007: teacher anchor LoRA-SFT (fixed recipe, runs once, adapter cached).

Protocol (task.md, verbatim): AutoModelForCausalLM on Qwen3.5-9B; LoRA r=16,
alpha=32, dropout=0.05, bias=none, task_type=CAUSAL_LM, target_modules regex
over the text tower; lr=2e-4; 1 epoch; per-device batch 2 x grad-accum 8
(effective 16 -> single GPU); max_seq_len=1024; cosine, warmup_ratio=0.05,
weight_decay=0.0; bf16; adapter saved separately (NOT merged);
enable_thinking=False for the chat formatting.
"""
import argparse
import json
import math
import os
import sys
import time

import torch
from torch.utils.data import DataLoader, Dataset

sys.path.insert(0, os.path.dirname(__file__))
from common import (GRAD_ACCUM, MAX_SEQ_LEN, MODEL_PATH, PER_DEVICE_BATCH,
                    RESULTS, TEACHER_ADAPTER, TEACHER_LR, TEACHER_LORA,
                    TEACHER_TARGET_RE, TRAIN_EPOCHS, WARMUP_RATIO, WEIGHT_DECAY,
                    load_anchor, set_global_seed, write_json)

OUT = os.path.join(os.environ.get("RUN_OUT", "runs/R007_teacher_sft"))


class PairDataset(Dataset):
    def __init__(self, pairs, tok, maxlen, boundary_fallback=False):
        self.tok = tok
        self.maxlen = maxlen
        self.samples = []
        n_mask_fail = 0
        self.n_boundary_mask = 0
        for p in pairs:
            msgs_prefix = [{"role": "user", "content": p["prompt"]}]
            msgs_full = msgs_prefix + [{"role": "assistant", "content": p["output"]}]
            ids_full = tok.apply_chat_template(msgs_full, add_generation_prompt=False,
                                               enable_thinking=False, tokenize=True, return_dict=False)
            ids_prefix = tok.apply_chat_template(msgs_prefix, add_generation_prompt=True,
                                                 enable_thinking=False, tokenize=True, return_dict=False)
            if len(ids_full) <= len(ids_prefix) or ids_full[:len(ids_prefix)] != ids_prefix:
                # Rare BPE boundary re-merging: the generation-prompt tail re-merges
                # with the first content tokens, so the separately-tokenized prefix is
                # not an exact id-prefix of the full sequence. Mask from the longest
                # common id-prefix L instead: tokens before L are pure prompt; the
                # merged boundary tokens and everything after are treated as content.
                # Conservative — content can never leak into the prompt-masked region.
                L = 0
                while L < min(len(ids_full), len(ids_prefix)) and ids_full[L] == ids_prefix[L]:
                    L += 1
                if not boundary_fallback or L < len(ids_prefix) - 4 or len(ids_full) <= L:
                    n_mask_fail += 1
                    raise RuntimeError(
                        f"chat-template prefix mismatch on pair (prompt head: {p['prompt'][:80]!r}); "
                        f"refusing to train with misaligned assistant masking "
                        f"(boundary_fallback={boundary_fallback}, common_prefix={L}/{len(ids_prefix)})")
                self.n_boundary_mask += 1
                ids = ids_full[:maxlen]
                labels = [-100] * L + ids[L:]
                self.samples.append((ids, labels))
                continue
            ids = ids_full[:maxlen]
            labels = [-100] * min(len(ids_prefix), len(ids)) + ids[min(len(ids_prefix), len(ids)):]
            self.samples.append((ids, labels))
        self.n_mask_fail = n_mask_fail

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, i):
        return self.samples[i]


def collate(batch, pad_id):
    ids, labs = zip(*batch)
    L = max(len(x) for x in ids)
    input_ids = torch.full((len(ids), L), pad_id, dtype=torch.long)
    labels = torch.full((len(labs), L), -100, dtype=torch.long)
    attn = torch.zeros((len(ids), L), dtype=torch.long)
    for i, (a, b) in enumerate(zip(ids, labs)):
        input_ids[i, :len(a)] = torch.tensor(a, dtype=torch.long)
        labels[i, :len(b)] = torch.tensor(b, dtype=torch.long)
        attn[i, :len(a)] = 1
    return {"input_ids": input_ids, "labels": labels, "attention_mask": attn}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--micro_batches", type=int, default=None,
                    help="SANITY ONLY: cap number of optimizer steps")
    ap.add_argument("--max_pairs", type=int, default=None, help="SANITY ONLY: subset pairs")
    ap.add_argument("--adapter_out", type=str, default=TEACHER_ADAPTER)
    args = ap.parse_args()
    os.makedirs(OUT, exist_ok=True)
    set_global_seed(args.seed)

    from peft import LoraConfig, get_peft_model
    from transformers import AutoModelForCausalLM, AutoTokenizer, get_cosine_schedule_with_warmup

    tok = AutoTokenizer.from_pretrained(MODEL_PATH, trust_remote_code=True)
    pairs = load_anchor()
    excl_path = os.path.join(RESULTS, "dedup_exclusions.json")
    if os.path.exists(excl_path):
        excl = set(json.load(open(excl_path))["excluded_anchor_indices"])
        if excl:
            pairs = [p for i, p in enumerate(pairs) if i not in excl]
            print(f"[teacher-sft] excluded {len(excl)} dedup-flagged anchor pairs; using {len(pairs)}")
    if args.max_pairs:
        pairs = pairs[:args.max_pairs]
        print(f"[teacher-sft] SANITY: using {len(pairs)} pairs")

    ds = PairDataset(pairs, tok, MAX_SEQ_LEN)
    print(f"[teacher-sft] pairs={len(ds)} mask_fail={ds.n_mask_fail}")
    pad = tok.pad_token_id if tok.pad_token_id is not None else tok.eos_token_id
    g = torch.Generator().manual_seed(args.seed)
    dl = DataLoader(ds, batch_size=PER_DEVICE_BATCH, shuffle=True,
                    collate_fn=lambda b: collate(b, pad), generator=g, drop_last=False, num_workers=0)

    model = AutoModelForCausalLM.from_pretrained(MODEL_PATH, dtype=torch.bfloat16, trust_remote_code=True)
    model.to("cuda")
    cfg = LoraConfig(target_modules=TEACHER_TARGET_RE, **TEACHER_LORA)
    model = get_peft_model(model, cfg)
    model.gradient_checkpointing_enable()
    model.enable_input_require_grads()
    model.print_trainable_parameters()

    total_steps = math.ceil(len(ds) / (PER_DEVICE_BATCH * GRAD_ACCUM)) * TRAIN_EPOCHS
    warmup = math.ceil(WARMUP_RATIO * total_steps)
    opt = torch.optim.AdamW([p for p in model.parameters() if p.requires_grad],
                            lr=TEACHER_LR, weight_decay=WEIGHT_DECAY)
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
                    print(f"[teacher-sft] step {step}/{total_steps} loss {mean_loss:.4f} "
                          f"lr {sched.get_last_lr()[0]:.2e} {time.time() - t0:.0f}s", flush=True)
                    log_rows.append({"step": step, "loss": mean_loss, "lr": sched.get_last_lr()[0]})
                    loss_acc, n_micro_acc = 0.0, 0
                if args.micro_batches and step >= args.micro_batches:
                    print("[teacher-sft] SANITY: reached --micro_batches cap, stopping")
                    break
        if args.micro_batches and step >= args.micro_batches:
            break

    os.makedirs(args.adapter_out, exist_ok=True)
    model.save_pretrained(args.adapter_out)
    tok.save_pretrained(args.adapter_out)
    write_json(os.path.join(OUT, "train_log.json"),
               {"adapter_out": args.adapter_out, "n_pairs": len(ds), "steps": step,
                "total_steps_planned": total_steps, "warmup_steps": warmup,
                "lr": TEACHER_LR, "epoch": TRAIN_EPOCHS, "seed": args.seed,
                "wall_seconds": round(time.time() - t0, 1), "log": log_rows})
    print("TEACHER SFT DONE ->", args.adapter_out)


if __name__ == "__main__":
    main()
