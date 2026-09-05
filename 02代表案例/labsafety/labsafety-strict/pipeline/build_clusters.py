"""Topic-cluster assignment for QUERIES (stratified equalization strata).
Embeds all 12,000 QUERIES via the endpoint embedding model, k-means k=50
(fixed seed). Output: results/clusters.json  {query_idx: cluster_id}.
"""
import json
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
from common import RESULTS, RUNS, load_queries, write_json
from judge_client import EmbedClient

OUT = os.path.join(RUNS, "R001_dedup_scan")  # reuse the MP embedding checkpoint dir


def main():
    from sklearn.cluster import KMeans
    queries = load_queries()
    emb = EmbedClient(os.path.join(OUT, "embed_ckpt.jsonl"), batch_size=10, concurrency=8)
    items = [(f"quer_{i}", queries[i]) for i in range(len(queries))]
    vecs = emb.run(items, tag="embed-queries")
    M = np.array([vecs[f"quer_{i}"] for i in range(len(queries))], dtype=np.float32)
    M = M / np.maximum(np.linalg.norm(M, axis=1, keepdims=True), 1e-9)
    km = KMeans(n_clusters=50, random_state=0, n_init=10).fit(M)
    clusters = {str(i): int(c) for i, c in enumerate(km.labels_)}
    sizes = np.bincount(km.labels_, minlength=50)
    write_json(os.path.join(RESULTS, "clusters.json"),
               {"clusters": clusters, "n_clusters": 50,
                "cluster_sizes": [int(x) for x in sizes], "seed": 0})
    print("clusters.json written; sizes min/max:", int(sizes.min()), int(sizes.max()))


if __name__ == "__main__":
    main()
