"""R041 (pass 2): full re-judge stability panel over the FINAL pass-2 arms.

Identical protocol to R018 (verbatim llm_judge_prompts.md prompt, qwen3.8-max,
temperature 0, second independent pass over all 133 items of every arm), with a
fresh checkpoint and p3_ id prefix so no pass-1 verdict is reused; archive
directories (_archive*) are excluded from the eval-dir scan.
"""
import json
import os
import sys

import pandas as pd

sys.path.insert(0, os.path.dirname(__file__))
from common import DATA, JUDGE_PROMPT_TEMPLATE, RUNS, parse_judge_label, write_json
from judge_client import JudgeClient

OUT = os.path.join(RUNS, "R041_rejudge_p2")


def find_eval_dirs():
    uniq = []
    for root, dirs, files in os.walk(RUNS):
        dirs[:] = [d for d in dirs if "_archive" not in d]
        if "eval_records.json" in files:
            uniq.append(root)
    return sorted(set(uniq))


def main():
    df = pd.read_parquet(os.path.join(DATA, "QA_I-00000-of-00001.parquet"))
    eval_dirs = find_eval_dirs()
    print("eval dirs found:", eval_dirs)
    os.makedirs(OUT, exist_ok=True)
    client = JudgeClient(os.path.join(OUT, "rejudge_ckpt.jsonl"),
                         concurrency=32, temperature=0.0, max_tokens=1024)
    items, index = [], []
    for d in eval_dirs:
        recs = json.load(open(os.path.join(d, "eval_records.json"), encoding="utf-8"))
        arm, seed = recs["arm"], recs["seed"]
        for r in recs["records"]:
            i = r["item"]
            q = df.iloc[i]["Question"]
            gold = str(df.iloc[i]["Correct Answer"]).strip().upper()
            iid = f"p3_{arm}_s{seed}_i{i}"
            items.append({"id": iid, "messages": [{"role": "user", "content":
                          JUDGE_PROMPT_TEMPLATE.format(gold_letter=gold, question=q,
                                                       model_answer=r["model_answer"])}]})
            index.append({"id": iid, "dir": d, "item": i, "arm": arm, "seed": seed,
                          "pass1_label": r["judge_label"]})
    done = client.run(items, tag="rejudge2")
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
    write_json(os.path.join(OUT, "rejudge_rows.json"), rows)
    n_flip = sum(1 for r in rows if r["flip"])
    print(f"re-judge complete: rows={len(rows)} flips={n_flip} agreement={1 - n_flip / len(rows):.4f}")
    print("REJUDGE2 DONE")


if __name__ == "__main__":
    main()
