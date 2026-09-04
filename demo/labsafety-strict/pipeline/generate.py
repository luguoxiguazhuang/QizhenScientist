"""Per-seed teacher generation (R008/R009 pattern).

arm=treated : base model + teacher anchor adapter (tuned teacher)
arm=ctrlb   : base model (un-tuned teacher), IDENTICAL generation protocol

Protocol (task.md, verbatim): chat template, system=None, enable_thinking=False,
do_sample=True, temperature=1.0, top_p=1.0, top_k=0, max_new_tokens=256,
prompts = QUERIES_v3_all.txt (12,000, minus any dedup exclusions).

Sharding: each process owns one GPU (CUDA_VISIBLE_DEVICES set by the launcher)
and a contiguous slice of the prompt list. Sampling RNG seeded with the
pipeline seed s in every shard (protocol: seed drives teacher sampling).
Resumable: completed prompt indices are read from the output JSONL.
"""
import argparse
import json
import os
import sys
import time

import torch

sys.path.insert(0, os.path.dirname(__file__))
from common import (GEN_KWARGS, MODEL_PATH, RESULTS, RUNS, TEACHER_ADAPTER,
                    load_queries, set_global_seed)

BATCH_SIZE = 16


def load_done(path):
    done = {}
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            for ln in f:
                ln = ln.strip()
                if not ln:
                    continue
                try:
                    r = json.loads(ln)
                    done[r["idx"]] = r
                except (json.JSONDecodeError, KeyError):
                    continue
    return done


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--arm", choices=["treated", "ctrlb"], required=True)
    ap.add_argument("--seed", type=int, required=True)
    ap.add_argument("--nshards", type=int, default=4)
    ap.add_argument("--shard", type=int, default=0)
    ap.add_argument("--outdir", type=str, default=None)
    ap.add_argument("--batch_size", type=int, default=BATCH_SIZE)
    ap.add_argument("--limit", type=int, default=None, help="SANITY ONLY: cap prompts for this shard")
    args = ap.parse_args()

    outdir = args.outdir or os.path.join(RUNS, f"gen_s{args.seed}", args.arm)
    os.makedirs(outdir, exist_ok=True)
    out_path = os.path.join(outdir, f"shard_{args.shard}.jsonl")

    excl = set()
    excl_path = os.path.join(RESULTS, "dedup_exclusions.json")
    if os.path.exists(excl_path):
        excl = set(json.load(open(excl_path))["excluded_query_indices"])
    queries = load_queries()
    my_idx = [i for i in range(len(queries)) if i not in excl and i % args.nshards == args.shard]
    assert len(my_idx) == len(set(my_idx)), "duplicate indices in shard assignment"
    assert 0 <= args.shard < args.nshards, f"invalid shard config {args.shard}/{args.nshards}"
    print(f"[gen {args.arm} s{args.seed} shard {args.shard}/{args.nshards}] prompts={len(my_idx)} "
          f"(dedup-excluded total={len(excl)}) gpu={os.environ.get('CUDA_VISIBLE_DEVICES')}", flush=True)

    set_global_seed(args.seed)  # protocol: seed drives teacher sampling
    from transformers import AutoModelForCausalLM, AutoTokenizer
    tok = AutoTokenizer.from_pretrained(MODEL_PATH, trust_remote_code=True)
    model = AutoModelForCausalLM.from_pretrained(MODEL_PATH, dtype=torch.bfloat16, trust_remote_code=True)
    if args.arm == "treated":
        from peft import PeftModel
        model = PeftModel.from_pretrained(model, TEACHER_ADAPTER)
        print(f"[gen] teacher adapter loaded from {TEACHER_ADAPTER}", flush=True)
    model.to("cuda").eval()
    if tok.pad_token_id is None:
        tok.pad_token = tok.eos_token
    tok.padding_side = "left"

    done = load_done(out_path)
    todo = [i for i in my_idx if i not in done]
    if args.limit:
        todo = todo[:args.limit]
        print(f"[gen shard {args.shard}] SANITY: limited to {len(todo)} prompts")
    print(f"[gen shard {args.shard}] resume: done={len(done)} todo={len(todo)}", flush=True)

    gen_kw = dict(GEN_KWARGS)
    if gen_kw.get("top_k", 0) == 0:
        # top_k=0 in the protocol = top-k filtering disabled; identical sampling
        # distribution. Some transformers versions reject top_k<=0 -> drop the
        # filter (mathematically identical to keeping all tokens).
        gen_kw.pop("top_k", None)

    t0, written, fout = time.time(), 0, open(out_path, "a", encoding="utf-8")
    for b0 in range(0, len(todo), args.batch_size):
        batch_idx = todo[b0:b0 + args.batch_size]
        prompts = [queries[i] for i in batch_idx]
        templated = tok.apply_chat_template([[{"role": "user", "content": p}] for p in prompts],
                                            add_generation_prompt=True, enable_thinking=False,
                                            tokenize=True, return_dict=True, return_tensors="pt",
                                            padding=True)
        ids = templated["input_ids"].to("cuda")
        attn = templated["attention_mask"].to("cuda")
        with torch.no_grad():
            out = model.generate(ids, attention_mask=attn, pad_token_id=tok.pad_token_id, **gen_kw)
        texts = tok.batch_decode(out[:, ids.shape[1]:], skip_special_tokens=True)
        for i, t in zip(batch_idx, texts):
            fout.write(json.dumps({"idx": i, "prompt": queries[i], "text": t,
                                   "n_chars": len(t)}, ensure_ascii=False) + "\n")
        fout.flush()
        written += len(batch_idx)
        if written % (args.batch_size * 10) == 0:
            el = time.time() - t0
            print(f"[gen {args.arm} s{args.seed} shard {args.shard}] {written}/{len(todo)} "
                  f"{written / el:.1f} prompts/s elapsed {el / 60:.1f}min", flush=True)
    fout.close()
    print(f"[gen {args.arm} s{args.seed} shard {args.shard}] DONE wrote {written} in "
          f"{(time.time() - t0) / 60:.1f}min", flush=True)


if __name__ == "__main__":
    main()
