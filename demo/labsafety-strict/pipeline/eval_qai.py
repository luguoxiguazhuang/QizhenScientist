"""QA_I evaluation (R013/R014/R017 pattern).

Greedy decoding (do_sample=False, temperature=0.0, max_new_tokens=256) on the
133 QA_I items with images; then blinded judging with the verbatim
llm_judge_prompts.md prompt (qwen3.8-max, temperature 0). Payload = question +
options + model answer ONLY (no arm/seed identity).

arm=ctrlA   : base student (no fine-tune), seed-independent
arm=treated / ctrlb : base student + per-seed adapter
"""
import argparse
import io
import json
import os
import sys
import time

import pandas as pd
import torch

sys.path.insert(0, os.path.dirname(__file__))
from common import (ADAPTER_DIR, DATA, EVAL_KWARGS, JUDGE_PROMPT_TEMPLATE,
                    MODEL_PATH, N_QAI, RUNS, parse_judge_label, parse_letter,
                    refusal_flag, set_global_seed, write_json)
from judge_client import JudgeClient


def shard_list(n, nshards, shard):
    return [i for i in range(n) if i % nshards == shard]


def generate_stage(args, outdir):
    from PIL import Image
    from transformers import AutoModelForImageTextToText, AutoProcessor
    set_global_seed(args.seed)
    proc = AutoProcessor.from_pretrained(MODEL_PATH, trust_remote_code=True)
    model = AutoModelForImageTextToText.from_pretrained(MODEL_PATH, dtype=torch.bfloat16,
                                                        trust_remote_code=True)
    if args.arm != "ctrlA":
        from peft import PeftModel
        ad = os.path.join(ADAPTER_DIR, f"student_{args.arm}_s{args.seed}")
        model = PeftModel.from_pretrained(model, ad)
        print(f"[eval] adapter loaded: {ad}", flush=True)
    model.to("cuda").eval()

    df = pd.read_parquet(os.path.join(DATA, "QA_I-00000-of-00001.parquet"))
    my_items = shard_list(N_QAI, args.nshards, args.shard)
    out_path = os.path.join(outdir, f"gen_shard_{args.shard}.jsonl")
    done = {}
    if os.path.exists(out_path):
        with open(out_path, encoding="utf-8") as f:
            for ln in f:
                try:
                    r = json.loads(ln)
                    done[r["item"]] = r
                except (json.JSONDecodeError, KeyError):
                    pass
    todo = [i for i in my_items if i not in done]
    print(f"[eval {args.arm} s{args.seed} shard {args.shard}] items: total={len(my_items)} "
          f"done={len(done)} todo={len(todo)}", flush=True)
    fout = open(out_path, "a", encoding="utf-8")
    t0 = time.time()
    for k, i in enumerate(todo):
        img = Image.open(io.BytesIO(df.iloc[i]["Decoded Image"]["bytes"])).convert("RGB")
        q = df.iloc[i]["Question"]
        gold = str(df.iloc[i]["Correct Answer"]).strip().upper()
        messages = [{"role": "user", "content": [{"type": "image", "image": img},
                                                  {"type": "text", "text": q}]}]
        inputs = proc.apply_chat_template(messages, add_generation_prompt=True,
                                          enable_thinking=False, tokenize=True,
                                          return_dict=True, return_tensors="pt")
        inputs = {kk: (v.to("cuda") if torch.is_tensor(v) else v) for kk, v in inputs.items()}
        with torch.no_grad():
            out = model.generate(**inputs, **EVAL_KWARGS)
        ans = proc.decode(out[0][inputs["input_ids"].shape[1]:], skip_special_tokens=True)
        rec = {"item": i, "gold": gold, "model_answer": ans, "n_chars": len(ans)}
        fout.write(json.dumps(rec, ensure_ascii=False) + "\n")
        fout.flush()
        if (k + 1) % 10 == 0:
            el = time.time() - t0
            print(f"[eval shard {args.shard}] {k + 1}/{len(todo)} {(k + 1) / el:.2f} items/s", flush=True)
    fout.close()
    print(f"[eval {args.arm} s{args.seed} shard {args.shard}] GEN DONE {(time.time() - t0) / 60:.1f}min",
          flush=True)


def judge_stage(args, outdir, df):
    gens = {}
    for fn in os.listdir(outdir):
        if fn.startswith("gen_shard_") and fn.endswith(".jsonl"):
            with open(os.path.join(outdir, fn), encoding="utf-8") as f:
                for ln in f:
                    try:
                        r = json.loads(ln)
                        gens[r["item"]] = r
                    except (json.JSONDecodeError, KeyError):
                        continue
    assert len(gens) == N_QAI, f"expected {N_QAI} generations, found {len(gens)}"
    client = JudgeClient(os.path.join(outdir, "judge_ckpt.jsonl"), concurrency=24,
                         temperature=0.0, max_tokens=1024)
    items = []
    for i in range(N_QAI):
        q = df.iloc[i]["Question"]
        gold = str(df.iloc[i]["Correct Answer"]).strip().upper()
        items.append({"id": f"p1_{args.arm}_s{args.seed}_i{i}",
                      "messages": [{"role": "user", "content":
                                    JUDGE_PROMPT_TEMPLATE.format(gold_letter=gold, question=q,
                                                                 model_answer=gens[i]["model_answer"])}]})
    done = client.run(items, tag=f"judge-{args.arm}-s{args.seed}")
    records = []
    for i in range(N_QAI):
        content = done.get(items[i]["id"], {}).get("content", "")
        label = parse_judge_label(content)
        if label == "PARSE_FAIL":  # pre-registered: re-call once, else OTHER
            rec2 = client._one_call({"id": items[i]["id"] + "_rc", "messages": items[i]["messages"]})
            label = parse_judge_label(rec2.get("content", ""))
            content = rec2.get("content", "")
            if label == "PARSE_FAIL":
                label = "OTHER"
        ans = gens[i]["model_answer"]
        letter = parse_letter(ans)
        records.append({"item": i, "arm": args.arm, "seed": args.seed,
                        "gold": str(df.iloc[i]["Correct Answer"]).strip().upper(),
                        "model_answer": ans, "parsed_letter": letter,
                        "format_valid": letter is not None, "refusal": refusal_flag(ans),
                        "judge_label": label, "judge_raw": content, "judge_pass": 1})
    acc = sum(1 for r in records if r["judge_label"] == "CORRECT") / N_QAI
    write_json(os.path.join(outdir, "eval_records.json"),
               {"arm": args.arm, "seed": args.seed, "n": N_QAI, "accuracy": acc,
                "n_correct": sum(1 for r in records if r["judge_label"] == "CORRECT"),
                "n_incorrect": sum(1 for r in records if r["judge_label"] == "INCORRECT"),
                "n_other": sum(1 for r in records if r["judge_label"] == "OTHER"),
                "records": records})
    print(f"[eval {args.arm} s{args.seed}] ACC={acc:.4f} "
          f"(CORRECT={sum(1 for r in records if r['judge_label'] == 'CORRECT')}, "
          f"INCORRECT={sum(1 for r in records if r['judge_label'] == 'INCORRECT')}, "
          f"OTHER={sum(1 for r in records if r['judge_label'] == 'OTHER')})")
    return acc


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--arm", choices=["ctrlA", "treated", "ctrlb"], required=True)
    ap.add_argument("--seed", type=int, default=0)
    ap.add_argument("--nshards", type=int, default=4)
    ap.add_argument("--shard", type=int, default=-1, help="-1 = master (judge stage only)")
    ap.add_argument("--outdir", type=str, default=None)
    args = ap.parse_args()
    if args.arm == "ctrlA":
        assert args.seed == 0, "Ctrl-A is the seed-independent base-student reference; run with --seed 0"
    outdir = args.outdir or os.path.join(RUNS, f"eval_s{args.seed}" if args.arm != "ctrlA"
                                         else "eval_ctrlA", args.arm if args.arm != "ctrlA" else "ctrlA")
    os.makedirs(outdir, exist_ok=True)
    df = pd.read_parquet(os.path.join(DATA, "QA_I-00000-of-00001.parquet"))
    if args.shard >= 0:
        generate_stage(args, outdir)
    else:
        judge_stage(args, outdir, df)


if __name__ == "__main__":
    main()
