"""R018: full re-judge stability pass — second, independent judge pass over all
133 items of every arm (fresh checkpoint), then merge for the reliability panel.
"""
import json
import os
import sys

import pandas as pd

sys.path.insert(0, os.path.dirname(__file__))
from common import DATA, JUDGE_PROMPT_TEMPLATE, RUNS, parse_judge_label, write_json
from judge_client import JudgeClient

EVAL_DIRS = []  # filled in main by scanning runs/


def find_eval_dirs():
    dirs = []
    for d in sorted(os.listdir(RUNS)):
        full = os.path.join(RUNS, d)
        if not os.path.isdir(full):
            continue
        # eval outputs: eval_records.json lives one level deeper per arm, or directly
        cand = []
        if os.path.exists(os.path.join(full, "eval_records.json")):
            cand.append(full)
        for sub in os.listdir(full):
            if os.path.exists(os.path.join(full, sub, "eval_records.json")):
                cand.append(os.path.join(full, sub))
        for c in cand:
            if c.endswith("ctrlA") or "eval" in os.path.basename(os.path.dirname(c)) or "eval" in os.path.basename(c):
                dirs.append(c)
    # de-dup, keep canonical: any dir containing eval_records.json under runs/**
    uniq = []
    for root, _, files in os.walk(RUNS):
        if "eval_records.json" in files:
            uniq.append(root)
    return sorted(set(uniq))


def main():
    df = pd.read_parquet(os.path.join(DATA, "QA_I-00000-of-00001.parquet"))
    eval_dirs = find_eval_dirs()
    print("eval dirs found:", eval_dirs)
    client = JudgeClient(os.path.join(RUNS, "R018_rejudge_stability", "rejudge_ckpt.jsonl"),
                         concurrency=32, temperature=0.0, max_tokens=1024)
    os.makedirs(os.path.join(RUNS, "R018_rejudge_stability"), exist_ok=True)
    items, index = [], []
    for d in eval_dirs:
        recs = json.load(open(os.path.join(d, "eval_records.json"), encoding="utf-8"))
        arm, seed = recs["arm"], recs["seed"]
        for r in recs["records"]:
            i = r["item"]
            q = df.iloc[i]["Question"]
            gold = str(df.iloc[i]["Correct Answer"]).strip().upper()
            iid = f"p2_{arm}_s{seed}_i{i}"
            items.append({"id": iid, "messages": [{"role": "user", "content":
                          JUDGE_PROMPT_TEMPLATE.format(gold_letter=gold, question=q,
                                                       model_answer=r["model_answer"])}]})
            index.append({"id": iid, "dir": d, "item": i, "arm": arm, "seed": seed,
                          "pass1_label": r["judge_label"]})
    done = client.run(items, tag="rejudge")
    rows = []
    for meta in index:
        content = done.get(meta["id"], {}).get("content", "")
        label = parse_judge_label(content)
        if label == "PARSE_FAIL":
            rec2 = client._one_call({"id": meta["id"] + "_rc",
                                     "messages": [it for it in items if it["id"] == meta["id"]][0]["messages"]})
            label = parse_judge_label(rec2.get("content", ""))
            if label == "PARSE_FAIL":
                label = "OTHER"
        rows.append({**meta, "pass2_label": label, "pass2_raw": content,
                     "flip": label != meta["pass1_label"]})
    write_json(os.path.join(RUNS, "R018_rejudge_stability", "rejudge_rows.json"), rows)
    n_flip = sum(1 for r in rows if r["flip"])
    print(f"re-judge complete: rows={len(rows)} flips={n_flip} agreement={1 - n_flip / len(rows):.4f}")
    print("REJUDGE DONE")


if __name__ == "__main__":
    main()
