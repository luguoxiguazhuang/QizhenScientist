"""MP-P1 (R001): contamination dedup scan.
QUERIES vs QA_I stems; teacher-anchor prompts/outputs vs QA_I stems.
Thresholds (pre-registered, FINAL_PROPOSAL): char-5-gram Jaccard >= 0.5 OR
embedding cosine >= 0.92 -> flag/exclude + log. QA_I is never touched;
flagged QUERIES are excluded from the generation pool, flagged anchor pairs
from teacher SFT (exact counts reported).
"""
import json
import os
import re
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
from common import (DATA, RUNS, RESULTS, EMBED_DIM, jaccard_char_ngram,
                    load_anchor, load_queries, write_json)
from judge_client import EmbedClient

import pandas as pd

OUT = os.path.join(RUNS, "R001_dedup_scan")
CKPT = os.path.join(OUT, "embed_ckpt.jsonl")
JACC_T = 0.5
COS_T = 0.92

OPTION_SPLIT_RE = re.compile(r"\s+A:\s")


def qai_stem(q: str) -> str:
    m = OPTION_SPLIT_RE.search(q)
    return q[:m.start()].strip() if m else q.strip()


def main():
    os.makedirs(OUT, exist_ok=True)
    df = pd.read_parquet(os.path.join(DATA, "QA_I-00000-of-00001.parquet"))
    stems = [qai_stem(q) for q in df["Question"].tolist()]
    assert len(stems) == 133
    queries = load_queries()
    anchor = load_anchor()
    anchor_prompts = [a["prompt"] for a in anchor]
    anchor_outputs = [a["output"] for a in anchor]

    # ---- embeddings ----
    emb = EmbedClient(CKPT, batch_size=10, concurrency=8)
    items = []
    empty_ids = []  # empty texts: zero-vector sentinel, never sent to the endpoint
    def add_items(prefix, texts):
        for i, t in enumerate(texts):
            iid = f"{prefix}_{i}"
            if not t.strip():
                empty_ids.append(iid)
            else:
                items.append((iid, t))
    add_items("qai", stems)
    add_items("quer", queries)
    add_items("ancp", anchor_prompts)
    add_items("anco", anchor_outputs)
    vecs = emb.run(items, tag="embed-dedup")
    for iid in empty_ids:
        vecs[iid] = [0.0] * EMBED_DIM  # cosine 0 -> can never exceed the 0.92 threshold
    assert len(vecs) >= len(items), f"missing embeddings: {len(vecs)}/{len(items)}"

    def mat(prefix, n):
        M = np.array([vecs[f"{prefix}_{i}"] for i in range(n)], dtype=np.float32)
        return M / np.maximum(np.linalg.norm(M, axis=1, keepdims=True), 1e-9)

    QI, QU, AP, AO = mat("qai", 133), mat("quer", len(queries)), mat("ancp", len(anchor_prompts)), mat("anco", len(anchor_outputs))
    cos_qu = QI @ QU.T
    cos_ap = QI @ AP.T
    cos_ao = QI @ AO.T

    # ---- char-5gram jaccard (precompute gram sets for pool) ----
    def grams(s):
        s = " ".join(s.lower().split())
        n = 5
        if len(s) < n:
            return frozenset({s})
        return frozenset(s[i:i + n] for i in range(len(s) - n + 1))

    print("precomputing gram sets...", flush=True)
    qgrams = [grams(x) for x in queries]
    apgrams = [grams(x) for x in anchor_prompts]
    aograms = [grams(x) for x in anchor_outputs]

    def jac_rows(pool_grams, cos_mat):
        rows = []
        for i in range(133):
            gs = grams(stems[i])
            best_j, best = -1, 0.0
            for j, pg in enumerate(pool_grams):
                if not gs or not pg:
                    continue
                inter = len(gs & pg)
                if inter == 0:
                    continue
                jv = inter / len(gs | pg)
                if jv > best:
                    best, best_j = jv, j
            rows.append({"qai_item": i, "max_jaccard": best, "jaccard_pool_idx": best_j,
                         "max_cosine": float(cos_mat[i].max()), "cosine_pool_idx": int(cos_mat[i].argmax())})
        return rows

    print("jaccard scan: queries", flush=True)
    rq = jac_rows(qgrams, cos_qu)
    print("jaccard scan: anchor prompts", flush=True)
    rap = jac_rows(apgrams, cos_ap)
    print("jaccard scan: anchor outputs", flush=True)
    rao = jac_rows(aograms, cos_ao)

    flagged_queries, flagged_anchor = set(), set()
    hits = []
    for rows, pool in ((rq, "QUERIES"), (rap, "ANCHOR_PROMPT"), (rao, "ANCHOR_OUTPUT")):
        for r in rows:
            reason = []
            if r["max_jaccard"] >= JACC_T:
                reason.append(f"jaccard={r['max_jaccard']:.3f}")
            if r["max_cosine"] >= COS_T:
                reason.append(f"cosine={r['max_cosine']:.4f}")
            if reason:
                idx = r["jaccard_pool_idx"] if r["max_jaccard"] >= JACC_T else r["cosine_pool_idx"]
                if pool == "QUERIES":
                    flagged_queries.add(idx)
                else:
                    flagged_anchor.add(idx)
                hits.append({"pool": pool, "pool_idx": idx, "qai_item": r["qai_item"],
                             "reason": "; ".join(reason),
                             "pool_text_head": (queries[idx] if pool == "QUERIES" else
                                                (anchor_prompts[idx] if pool == "ANCHOR_PROMPT" else anchor_outputs[idx]))[:200],
                             "qai_stem_head": stems[r["qai_item"]][:200]})

    maxj_qu = max(r["max_jaccard"] for r in rq)
    maxj_ap = max(r["max_jaccard"] for r in rap)
    maxj_ao = max(r["max_jaccard"] for r in rao)
    maxc_qu = float(cos_qu.max()); maxc_ap = float(cos_ap.max()); maxc_ao = float(cos_ao.max())

    report = {
        "thresholds": {"jaccard": JACC_T, "cosine": COS_T},
        "max_overlap": {
            "QUERIES_vs_QA_I": {"max_jaccard": maxj_qu, "max_cosine": maxc_qu},
            "ANCHOR_PROMPT_vs_QA_I": {"max_jaccard": maxj_ap, "max_cosine": maxc_ap},
            "ANCHOR_OUTPUT_vs_QA_I": {"max_jaccard": maxj_ao, "max_cosine": maxc_ao},
        },
        "n_flagged_queries": len(flagged_queries),
        "n_flagged_anchor_pairs": len(flagged_anchor),
        "flagged_query_indices": sorted(flagged_queries),
        "flagged_anchor_indices": sorted(flagged_anchor),
        "hits": hits,
        "clean": len(hits) == 0,
    }
    write_json(os.path.join(OUT, "dedup_report.json"), report)
    # exclusion lists consumed downstream (may be empty)
    write_json(os.path.join(RESULTS, "dedup_exclusions.json"),
               {"excluded_query_indices": sorted(flagged_queries),
                "excluded_anchor_indices": sorted(flagged_anchor),
                "source": "runs/R001_dedup_scan/dedup_report.json"})
    print(json.dumps(report["max_overlap"], indent=2))
    print(f"flagged queries={len(flagged_queries)} anchor_pairs={len(flagged_anchor)} clean={report['clean']}")
    print("P1 DEDUP DONE")


if __name__ == "__main__":
    main()
