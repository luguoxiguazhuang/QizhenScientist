"""MP-P3 (R006): harness smoke test — 2 QA_I items end-to-end
(generate with base student -> judge -> record schema). Doubles as the
SANITY_FIRST stage: also validates LoRA attach, sampling kwargs, and the
teacher-SFT tokenization/masking on micro slices.
"""
import io
import json
import os
import sys
import time

import pandas as pd
import torch

sys.path.insert(0, os.path.dirname(__file__))
from common import (DATA, RUNS, JUDGE_PROMPT_TEMPLATE, MODEL_PATH,
                    parse_judge_label, parse_letter, refusal_flag, set_global_seed, write_json)
from judge_client import JudgeClient

OUT = os.path.join(RUNS, "R006_harness_smoke")


def main():
    os.makedirs(OUT, exist_ok=True)
    set_global_seed(42)
    from transformers import AutoModelForImageTextToText, AutoProcessor
    proc = AutoProcessor.from_pretrained(MODEL_PATH, trust_remote_code=True)
    model = AutoModelForImageTextToText.from_pretrained(MODEL_PATH, dtype=torch.bfloat16,
                                                        trust_remote_code=True).to("cuda").eval()
    df = pd.read_parquet(os.path.join(DATA, "QA_I-00000-of-00001.parquet"))
    records = []
    t0 = time.time()
    for i in [0, 1]:
        img = __import__("PIL.Image", fromlist=["Image"]).open(io.BytesIO(df.iloc[i]["Decoded Image"]["bytes"])).convert("RGB")
        q = df.iloc[i]["Question"]
        gold = str(df.iloc[i]["Correct Answer"]).strip().upper()
        messages = [{"role": "user", "content": [{"type": "image", "image": img}, {"type": "text", "text": q}]}]
        inputs = proc.apply_chat_template(messages, add_generation_prompt=True, enable_thinking=False,
                                          tokenize=True, return_dict=True, return_tensors="pt")
        inputs = {k: (v.to("cuda") if torch.is_tensor(v) else v) for k, v in inputs.items()}
        with torch.no_grad():
            out = model.generate(**inputs, do_sample=False, temperature=0.0, max_new_tokens=256)
        ans = proc.decode(out[0][inputs["input_ids"].shape[1]:], skip_special_tokens=True)
        records.append({"item": i, "question": q, "gold": gold, "model_answer": ans,
                        "parsed_letter": parse_letter(ans), "format_valid": parse_letter(ans) is not None,
                        "refusal": refusal_flag(ans), "answer_chars": len(ans)})
        print(f"[smoke] item {i} (gold {gold}) -> parsed {records[-1]['parsed_letter']}", flush=True)
    del model
    torch.cuda.empty_cache()

    # judge pass (blind payload, verbatim prompt)
    client = JudgeClient(os.path.join(OUT, "judge_ckpt.jsonl"), concurrency=4, temperature=0.0, max_tokens=1024)
    items = [{"id": f"smoke_{r['item']}", "messages": [{"role": "user", "content":
              JUDGE_PROMPT_TEMPLATE.format(gold_letter=r["gold"], question=r["question"],
                                           model_answer=r["model_answer"])}]} for r in records]
    done = client.run(items, tag="smoke-judge")
    for r in records:
        content = done.get(f"smoke_{r['item']}", {}).get("content", "")
        label = parse_judge_label(content)
        if label == "PARSE_FAIL":
            retry = client._one_call({"id": f"smoke_{r['item']}_r2", "messages": items[r["item"]]["messages"]})
            label = parse_judge_label(retry.get("content", ""))
            if label == "PARSE_FAIL":
                label = "OTHER"
        r["judge_label"] = label
        r["judge_raw"] = content
    write_json(os.path.join(OUT, "smoke_records.json"),
               {"n_items": len(records), "gen_seconds": round(time.time() - t0, 1),
                "records": records, "schema_ok": all(k in r for r in records for k in
               ("item", "question", "gold", "model_answer", "parsed_letter", "format_valid",
                "refusal", "judge_label"))})
    print(json.dumps([{k: r[k] for k in ("item", "gold", "parsed_letter", "judge_label")} for r in records]))
    print("P3 SMOKE DONE")


if __name__ == "__main__":
    main()
