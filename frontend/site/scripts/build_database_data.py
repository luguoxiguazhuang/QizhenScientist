"""Build static database assets consumed by the frontend Database page.

Reads from the local interp Neo4j (bolt 7689) and writes into
`site/data/database/`:

  manifest.json                — high-level stats + tree summary
  trees/mechanism_skills.json  — big nodes + paper leaves for Technique
  trees/interpretability_objects.json — for Component
  trees/application_scenarios.json    — for TaskScenario
  history/<canonical>__<node_id>.md   — development-history markdown per big node
  papers/<short_paper_id>.json        — per-paper detail (lazy-loaded by UI)

Big node = predefined helper (`is_predefined=true`) plus, for TaskScenario, the
handful of dynamic ids that show up materially. Only predefined big nodes are
surfaced in the tree — dynamic ids remain queryable in cypher but are noisy.

Paper cap: if a big node has <=60 papers we keep them all; otherwise we take
top-60 by cited_by_count (breaking ties by publication_date DESC).

The dev-history markdown mirrors the shape of the old generate_gragh atlas
timeline (3-month buckets, top-3 by citations, brief per-paper block).

Run from repo root:
    python3 site/scripts/build_database_data.py
"""
from __future__ import annotations

import json
import os
import re
from collections import defaultdict
from datetime import date
from pathlib import Path

from neo4j import GraphDatabase


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "database"
TREES_DIR = OUT / "trees"
HISTORY_DIR = OUT / "history"
PAPERS_DIR = OUT / "papers"

NEO4J_URI = os.environ.get("INTERP_NEO4J_URI", "neo4j://127.0.0.1:7689")
NEO4J_USER = os.environ.get("INTERP_NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.environ.get("INTERP_NEO4J_PASSWORD", "cuizhixiang")

# Three canonical categories the DB page exposes.
CATEGORIES = [
    {
        "id": "mechanism_skills",
        "label": "Mechanism Methods",
        "helper_label": "Technique",
        "edge": "USES_TECHNIQUE",
        "description": (
            "Analysis techniques used across the mechanistic-interpretability "
            "literature. Every big node is a predefined technique family."
        ),
        # Predefined ids listed in canonicalize / normalize order.
        "big_nodes": [
            ("vocabulary_projection", "Vocabulary Projection"),
            ("magnitude_analysis", "Magnitude Analysis"),
            (
                "representation_and_parameter_analysis",
                "Representation & Parameter Analysis",
            ),
            ("probing", "Probing"),
            ("feature_dictionary_learning", "Feature Dictionary Learning"),
            ("gradient_detection", "Gradient Detection"),
            ("causal_attribution", "Causal Attribution"),
            ("circuit_discovery", "Circuit Discovery"),
            ("shap", "SHAP"),
            ("neural_feature_learning", "Neural Feature Learning"),
        ],
    },
    {
        "id": "interpretability_objects",
        "label": "Interpretability Objects",
        "helper_label": "Component",
        "edge": "ANALYZES_COMPONENT",
        "description": (
            "Model components that interpretability research zooms in on."
        ),
        "big_nodes": [
            ("mlp_ffn", "MLP / FFN"),
            ("attention", "Attention"),
            ("layer_normalization", "Layer Normalization"),
            ("neuron", "Neuron"),
            ("circuit", "Circuit"),
            ("sparse_moe_expert", "Sparse MoE Expert"),
            ("word_embedding", "Word Embedding"),
            ("residual_stream", "Residual Stream"),
        ],
    },
    {
        "id": "application_scenarios",
        "label": "Application / Scenarios",
        "helper_label": "TaskScenario",
        "edge": "APPLIED_TO",
        "description": (
            "Downstream tasks and use cases where the interpretability work is "
            "grounded."
        ),
        "big_nodes": [
            ("fact_knowledge", "Fact Knowledge"),
            ("math", "Math"),
            ("code", "Code"),
            ("science", "Science"),
            ("persona", "Persona"),
            ("safety", "Safety"),
            ("bias", "Bias"),
            ("sycophancy", "Sycophancy"),
            ("social_computation_and_communication", "Social Computation & Communication"),
        ],
    },
]

PAPER_CAP = 100  # target total leaves *per tree* (not per big node)
PAPER_CAP_TOLERANCE = 8  # allow slightly overshoot when rounding up small buckets


# ---------------------------------------------------------------------------
# Utilities
# ---------------------------------------------------------------------------

def short_paper_id(openalex_id: str | None) -> str:
    """`https://openalex.org/W123` → `W123`; blog URLs → sha1-ish slug."""
    if not openalex_id:
        return "unknown"
    if openalex_id.startswith("https://openalex.org/"):
        return openalex_id.rsplit("/", 1)[-1]
    slug = re.sub(r"[^A-Za-z0-9]+", "-", openalex_id).strip("-").lower()
    return f"url-{slug[:60]}" or "unknown"


def clean_authors(auth_records: list[dict]) -> list[str]:
    names = []
    for a in auth_records or []:
        for key in ("raw_name", "display_name"):
            v = a.get(key)
            if isinstance(v, str) and v.strip():
                names.append(v.strip())
                break
    # Dedupe while preserving order
    seen = set()
    out = []
    for n in names:
        if n in seen:
            continue
        seen.add(n)
        out.append(n)
    return out


def quarter_of(d: date) -> tuple[str, str, str]:
    q = (d.month - 1) // 3 + 1
    start_month = (q - 1) * 3 + 1
    end_month = start_month + 2
    if end_month in (1, 3, 5, 7, 8, 10, 12):
        end_day = 31
    elif end_month == 2:
        leap = (d.year % 4 == 0 and d.year % 100 != 0) or d.year % 400 == 0
        end_day = 29 if leap else 28
    else:
        end_day = 30
    return (
        f"{d.year} Q{q}",
        date(d.year, start_month, 1).isoformat(),
        date(d.year, end_month, end_day).isoformat(),
    )


def neo4j_date_to_py(value) -> date | None:
    if value is None:
        return None
    if hasattr(value, "iso_format"):
        s = value.iso_format()
    else:
        s = str(value)
    try:
        parts = s.split("-")
        return date(int(parts[0]), int(parts[1]), int(parts[2][:2]))
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Query
# ---------------------------------------------------------------------------

PAPER_FIELDS_CY = """
       p.openalex_id AS openalex_id,
       p.title AS title,
       p.publication_date AS pub_date,
       p.publication_year AS year,
       p.type AS ptype,
       p.cited_by_count AS cited,
       p.abstract AS abstract,
       p.research_question AS research_question,
       p.core_contribution AS core_contribution,
       p.conclusion AS conclusion,
       p.key_findings AS key_findings,
       p.limitation AS limitation,
       p.future_direction AS future_direction,
       p.target_model AS target_model,
       p.modality AS modality,
       p.doi AS doi,
       p.affiliation_name AS affiliation_name,
       p.source_url AS source_url,
       collect(DISTINCT {raw_name: a.raw_name, display_name: au.display_name})[..8] AS authors
"""


def fetch_big_node_papers(session, helper_label: str, edge: str, node_id: str):
    q = f"""
    MATCH (n:`{helper_label}` {{id: $id}})<-[:{edge}]-(p:InterpPaper)
    OPTIONAL MATCH (au:Author)-[a:AUTHORED]->(p)
    OPTIONAL MATCH (p)-[:PUBLISHED_IN]->(v:Venue)
    WITH p, v,
{PAPER_FIELDS_CY}
    RETURN openalex_id, title, pub_date, year, ptype, cited, abstract,
           research_question, core_contribution, conclusion,
           key_findings, limitation, future_direction, target_model,
           modality, doi, affiliation_name, source_url, authors,
           v.canonical_name AS venue_name, v.type AS venue_type, v.id AS venue_id
    """
    rows = list(session.run(q, id=node_id))
    papers = []
    for r in rows:
        d = dict(r)
        d["_pub_date"] = neo4j_date_to_py(d["pub_date"])
        d.pop("pub_date", None)
        d["authors"] = clean_authors(d.get("authors"))
        d["short_id"] = short_paper_id(d["openalex_id"])
        papers.append(d)
    return papers


def rank_papers(papers: list[dict]) -> list[dict]:
    """Rank in-place by (citations desc, publication date desc)."""
    papers.sort(
        key=lambda p: (
            -(p.get("cited") or 0),
            -(p["_pub_date"].toordinal() if p.get("_pub_date") else 0),
        ),
    )
    return papers


def compute_quotas(big_node_totals: list[int], cap: int) -> list[int]:
    """Distribute `cap` paper slots across big nodes proportionally to each
    node's total InterpPaper count in the DB, then round each up so nodes with
    any papers get at least one slot. May overshoot `cap` by a few — the tree
    is fine with 60±5."""
    total = sum(big_node_totals)
    if total == 0:
        return [0] * len(big_node_totals)
    shares = []
    for count in big_node_totals:
        if count <= 0:
            shares.append(0)
            continue
        raw = cap * count / total
        # Every non-empty node gets at least 1.
        shares.append(max(1, int(round(raw))))
    # If summing overshoots badly, trim from the biggest shares first, keeping
    # the small-count nodes intact (they'd otherwise disappear entirely).
    while sum(shares) > cap + PAPER_CAP_TOLERANCE:
        # index of the largest share whose big-node total is also largest.
        i = max(range(len(shares)),
                key=lambda k: (shares[k], big_node_totals[k]))
        if shares[i] <= 1:
            break
        shares[i] -= 1
    return shares


def paper_to_tree_leaf(p: dict) -> dict:
    return {
        "id": p["short_id"],
        "openalex_id": p["openalex_id"],
        "title": p["title"],
        "year": p.get("year"),
        "cited": p.get("cited") or 0,
        "type": p.get("ptype"),
        "venue": p.get("venue_name"),
        "venue_type": p.get("venue_type"),
    }


def fetch_paper_edges(session, openalex_urls: list[str]) -> list[dict]:
    """Query CITES + RELATED_TO edges among the given set of papers."""
    if not openalex_urls:
        return []
    edges: list[dict] = []
    # CITES is directed (a cites b).
    for row in session.run(
        """
        MATCH (a:InterpPaper)-[r:CITES]->(b:InterpPaper)
        WHERE a.openalex_id IN $urls AND b.openalex_id IN $urls
        RETURN a.openalex_id AS src, b.openalex_id AS dst
        """,
        urls=openalex_urls,
    ):
        edges.append({
            "src": short_paper_id(row["src"]),
            "dst": short_paper_id(row["dst"]),
            "type": "CITES",
        })
    # RELATED_TO is stored undirected — Neo4j records it once, but semantically
    # the edge is symmetric; emit one entry per unordered pair.
    seen_pairs: set[tuple[str, str]] = set()
    for row in session.run(
        """
        MATCH (a:InterpPaper)-[r:RELATED_TO]-(b:InterpPaper)
        WHERE a.openalex_id IN $urls AND b.openalex_id IN $urls
              AND elementId(a) < elementId(b)
        RETURN a.openalex_id AS src, b.openalex_id AS dst
        """,
        urls=openalex_urls,
    ):
        src = short_paper_id(row["src"])
        dst = short_paper_id(row["dst"])
        key = tuple(sorted((src, dst)))
        if key in seen_pairs:
            continue
        seen_pairs.add(key)
        edges.append({"src": src, "dst": dst, "type": "RELATED_TO"})
    return edges


def paper_to_detail(p: dict) -> dict:
    """Fuller record persisted under papers/ for the detail card."""
    return {
        "id": p["short_id"],
        "openalex_id": p["openalex_id"],
        "title": p["title"],
        "authors": p["authors"],
        "year": p.get("year"),
        "date": p["_pub_date"].isoformat() if p.get("_pub_date") else None,
        "cited": p.get("cited") or 0,
        "type": p.get("ptype"),
        "venue": p.get("venue_name"),
        "venue_type": p.get("venue_type"),
        "abstract": p.get("abstract"),
        "research_question": p.get("research_question"),
        "core_contribution": p.get("core_contribution"),
        "conclusion": p.get("conclusion"),
        "key_findings": p.get("key_findings") or [],
        "limitation": p.get("limitation") or [],
        "future_direction": p.get("future_direction") or [],
        "target_model": p.get("target_model") or [],
        "modality": p.get("modality") or [],
        "doi": p.get("doi"),
        "affiliation_name": p.get("affiliation_name"),
        "source_url": p.get("source_url"),
    }


# ---------------------------------------------------------------------------
# Development-history markdown
# ---------------------------------------------------------------------------

HISTORY_INTROS = {
    "vocabulary_projection": (
        "Vocabulary Projection interprets a model's hidden states by projecting "
        "them back into the tokenizer vocabulary, revealing which words the "
        "network is 'reading its own mind' about at each layer."
    ),
    "magnitude_analysis": (
        "Magnitude Analysis studies activations and weights at the level of "
        "raw numerical size — norms, sparsity, extreme values — as a bare-bones "
        "way to spot mechanistic structure."
    ),
    "representation_and_parameter_analysis": (
        "Representation and Parameter Analysis studies the geometry of hidden "
        "states and weight matrices — subspaces, singular values, alignment — "
        "to characterize how information is encoded."
    ),
    "probing": (
        "Probing trains lightweight classifiers on top of frozen model layers "
        "to detect whether a property (syntax, sentiment, factuality) is "
        "linearly recoverable from internal representations."
    ),
    "feature_dictionary_learning": (
        "Feature Dictionary Learning decomposes activations into interpretable "
        "components via sparse dictionaries (SAEs, crosscoders), enabling "
        "monosemantic feature analysis at scale."
    ),
    "gradient_detection": (
        "Gradient Detection interprets predictions by tracing derivatives "
        "backwards — saliency maps, Integrated Gradients, Influence Functions."
    ),
    "causal_attribution": (
        "Causal Attribution uses interventions — activation patching, ablation, "
        "steering — to establish causal links between internal components and "
        "downstream behavior."
    ),
    "circuit_discovery": (
        "Circuit Discovery searches for the sub-graph of components that "
        "implements a particular behavior, exposing algorithms inside the model."
    ),
    "shap": (
        "SHAP attributes model outputs to input features via Shapley values, "
        "providing consistent local explanations."
    ),
    "neural_feature_learning": (
        "Neural Feature Learning examines how the model develops and represents "
        "novel features during training."
    ),
    # Component
    "mlp_ffn": (
        "The MLP / FFN blocks are studied as key-value memory stores — the "
        "primary locus of factual knowledge and computation in transformers."
    ),
    "attention": (
        "Attention heads route information between token positions; their "
        "roles, biases, and interactions have driven much of mech-interp."
    ),
    "layer_normalization": (
        "Layer Normalization shapes the geometry of the residual stream and "
        "has surprising interpretive consequences."
    ),
    "neuron": (
        "Individual neurons are the smallest analyzable unit; work here spans "
        "polysemanticity, automated labeling, and neuron editing."
    ),
    "circuit": (
        "Circuits are named sub-graphs that jointly implement a target task."
    ),
    "sparse_moe_expert": (
        "Sparse Mixture-of-Experts routing exposes new interpretive surface: "
        "which expert handles what, and why."
    ),
    "word_embedding": (
        "The token embedding table anchors semantic geometry at the input layer."
    ),
    "residual_stream": (
        "The residual stream is the shared bus between transformer blocks — "
        "an additive, decomposable channel that carries information end-to-end."
    ),
    # Scenario
    "fact_knowledge": (
        "Fact Knowledge covers how models store, retrieve, and edit factual "
        "associations — the ROME/MEMIT lineage among others."
    ),
    "math": (
        "Math scenarios study arithmetic, algebra, and multi-step reasoning "
        "inside language models."
    ),
    "code": (
        "Code scenarios cover program synthesis, understanding, and editing "
        "internal mechanisms."
    ),
    "science": (
        "Science scenarios ground interpretability in scientific problem "
        "solving — reasoning, retrieval, verification."
    ),
    "persona": (
        "Persona scenarios examine how role-playing shapes internal state and "
        "output distributions."
    ),
    "safety": (
        "Safety scenarios include refusal behavior, jailbreak vectors, "
        "harmful-direction identification, and unlearning."
    ),
    "bias": (
        "Bias scenarios study how demographic and social biases are represented "
        "and mitigated inside models."
    ),
    "sycophancy": (
        "Sycophancy scenarios examine how models adapt to user preferences at "
        "the cost of truthfulness."
    ),
    "social_computation_and_communication": (
        "Social Computation & Communication scenarios cover theory of mind, "
        "dialogue, cooperation, and social reasoning."
    ),
}


def render_history_markdown(category: dict, node_id: str, node_label: str,
                              papers: list[dict], total_paper_count: int) -> str:
    """3-month buckets, top-3 per bucket, MD document."""
    if not papers:
        return f"# {node_label}\n\n_No papers available for this node yet._"

    # Bucket by quarter of publication_date; fall back to mid-year if no date
    buckets: dict[tuple[str, str, str], list[dict]] = defaultdict(list)
    for p in papers:
        d = p.get("_pub_date")
        if d is None and p.get("year"):
            d = date(int(p["year"]), 6, 30)
        if d is None:
            continue
        buckets[quarter_of(d)].append(p)

    intro = HISTORY_INTROS.get(node_id, "")
    years = [p.get("year") for p in papers if p.get("year")]
    year_range = f"{min(years)} — {max(years)}" if years else "n/a"
    top = max(papers, key=lambda p: (p.get("cited") or 0))

    lines = [
        f"# {node_label}",
        "",
        f"_A development timeline within **{category['label']}** — auto-generated_",
        "",
        "## Background",
        "",
        intro if intro else "_No description available._",
        "",
        "## At a glance",
        "",
        f"- **Papers connected to this node in the DB:** {total_paper_count}",
        f"- **Highlighted below (top by citation):** {len(papers)}",
        f"- **Year span:** {year_range}",
    ]
    if top.get("cited"):
        lines.append(
            f"- **Most-cited paper:** {top['title']} — {top['cited']} citations"
        )
    lines.append("")
    lines.append("## Timeline")
    lines.append("")

    for (qk, start, end), items in sorted(buckets.items(), key=lambda kv: kv[0][1]):
        items = sorted(items, key=lambda p: -(p.get("cited") or 0))[:3]
        lines.append(f"### {qk}  ·  {start} → {end}")
        lines.append("")
        for i, p in enumerate(items, 1):
            cited = p.get("cited") or 0
            date_str = p["_pub_date"].isoformat() if p.get("_pub_date") else str(p.get("year", "?"))
            lines.append(f"#### {i}. {p['title']}")
            lines.append("")
            lines.append(
                f"`{date_str}` · **{cited}** citations"
                + (f" · _venue:_ {p['venue_name']}" if p.get("venue_name") else "")
            )
            lines.append("")
            if p.get("research_question"):
                lines.append(f"> **Research question.** {p['research_question']}")
                lines.append("")
            if p.get("core_contribution"):
                lines.append(f"**Core contribution.** {p['core_contribution']}")
                lines.append("")
            if p.get("key_findings"):
                lines.append("**Key findings.**")
                for kf in list(p["key_findings"])[:4]:
                    lines.append(f"- {kf}")
                lines.append("")
            if p.get("target_model"):
                models = ", ".join(list(p["target_model"])[:6])
                lines.append(f"_Target models:_ {models}")
                lines.append("")
            lines.append("---")
            lines.append("")
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    TREES_DIR.mkdir(parents=True, exist_ok=True)
    HISTORY_DIR.mkdir(parents=True, exist_ok=True)
    PAPERS_DIR.mkdir(parents=True, exist_ok=True)

    drv = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    manifest = {
        "generated_by": "site/scripts/build_database_data.py",
        "paper_cap_per_big_node": PAPER_CAP,
        "categories": [],
        "totals": {},
    }
    all_paper_details: dict[str, dict] = {}

    try:
        with drv.session() as s:
            # Global stats
            stats = {}
            stats["interp_papers"] = s.run(
                "MATCH (p:InterpPaper) RETURN count(*) AS c"
            ).single()["c"]
            stats["venues"] = s.run(
                "MATCH (v:Venue) RETURN count(*) AS c"
            ).single()["c"]
            stats["authors"] = s.run(
                "MATCH (a:Author) RETURN count(*) AS c"
            ).single()["c"]
            stats["published_in_edges"] = s.run(
                "MATCH ()-[r:PUBLISHED_IN]->() RETURN count(*) AS c"
            ).single()["c"]
            manifest["totals"] = stats
            print(
                f"DB stats: {stats['interp_papers']} InterpPaper, "
                f"{stats['authors']} Authors, {stats['venues']} Venues"
            )

            for cat in CATEGORIES:
                print(f"\n== {cat['label']} ==")
                # Two-pass: first fetch every big node so we know true totals,
                # then allocate a per-node paper quota proportional to that total.
                node_papers = []  # list of (node_id, node_label, ranked_papers)
                for node_id, node_label in cat["big_nodes"]:
                    all_papers = rank_papers(
                        fetch_big_node_papers(s, cat["helper_label"], cat["edge"], node_id)
                    )
                    node_papers.append((node_id, node_label, all_papers))
                totals = [len(pp) for _, _, pp in node_papers]
                quotas = compute_quotas(totals, PAPER_CAP)
                planned_total = sum(quotas)
                print(
                    f"  quota plan: {planned_total} paper leaves distributed "
                    f"across {sum(1 for q in quotas if q > 0)} big nodes"
                )

                cat_out = {
                    "id": cat["id"],
                    "label": cat["label"],
                    "helper_label": cat["helper_label"],
                    "description": cat["description"],
                    "paper_cap_target": PAPER_CAP,
                    "big_nodes": [],
                }
                # Dedupe papers WITHIN this tree — a paper connected to multiple
                # big nodes is emitted once, with a `belongs_to` list of the big
                # nodes it touches. The frontend renders one leaf node with edges
                # to each big node it belongs to.
                unique_papers: dict[str, dict] = {}   # short_id → paper record
                belongs_to: dict[str, list[str]] = defaultdict(list)

                for (node_id, node_label, all_papers), total, quota in zip(
                    node_papers, totals, quotas
                ):
                    kept = all_papers[:quota]
                    # Write history markdown — timeline uses the SAME kept set
                    # (so users see the same papers whether in graph or in history).
                    md_body = render_history_markdown(
                        cat, node_id, node_label, kept, total
                    )
                    (HISTORY_DIR / f"{cat['id']}__{node_id}.md").write_text(
                        md_body, encoding="utf-8"
                    )
                    paper_ids_here: list[str] = []
                    for p in kept:
                        pid = p["short_id"]
                        if pid not in all_paper_details:
                            all_paper_details[pid] = paper_to_detail(p)
                        if pid not in unique_papers:
                            unique_papers[pid] = paper_to_tree_leaf(p)
                        if node_id not in belongs_to[pid]:
                            belongs_to[pid].append(node_id)
                            paper_ids_here.append(pid)
                        elif pid not in paper_ids_here:
                            paper_ids_here.append(pid)
                    cat_out["big_nodes"].append({
                        "id": node_id,
                        "label": node_label,
                        "total_papers_in_db": total,
                        "leaf_paper_count": len(paper_ids_here),
                        # paper_ids: references into tree-level `papers` — used
                        # by the graph (which deduplicates and joins via edges).
                        # papers: full leaf records — used by the timeline
                        # history view, which needs title / cited / venue without
                        # cross-referencing the tree-level table.
                        "paper_ids": paper_ids_here,
                        "papers": [paper_to_tree_leaf(p) for p in kept],
                    })
                    print(
                        f"  {node_id:<38}  total={total:>4}  quota={quota:>3}  kept={len(kept):>3}"
                    )

                # Flatten the unique-paper table with belongs_to attached.
                cat_out["papers"] = []
                for pid, rec in unique_papers.items():
                    rec = dict(rec)
                    rec["belongs_to"] = list(belongs_to[pid])
                    cat_out["papers"].append(rec)

                # Fetch paper-paper edges (CITES + RELATED_TO) among these papers.
                urls = [rec["openalex_id"] for rec in cat_out["papers"] if rec.get("openalex_id")]
                paper_edges = fetch_paper_edges(s, urls)
                cat_out["paper_edges"] = paper_edges
                cites_n  = sum(1 for e in paper_edges if e["type"] == "CITES")
                rel_n    = sum(1 for e in paper_edges if e["type"] == "RELATED_TO")
                print(
                    f"  paper-paper edges: {cites_n} CITES + {rel_n} RELATED_TO "
                    f"among {len(cat_out['papers'])} unique papers"
                )

                cat_out["big_node_count"] = len(cat_out["big_nodes"])
                cat_out["total_leaf_papers"] = len(cat_out["papers"])
                cat_out["paper_edge_counts"] = {"CITES": cites_n, "RELATED_TO": rel_n}
                (TREES_DIR / f"{cat['id']}.json").write_text(
                    json.dumps(cat_out, ensure_ascii=False, indent=2),
                    encoding="utf-8",
                )
                manifest["categories"].append({
                    "id": cat["id"],
                    "label": cat["label"],
                    "description": cat["description"],
                    "big_node_count": cat_out["big_node_count"],
                    "total_leaf_papers": cat_out["total_leaf_papers"],
                    "paper_edge_counts": cat_out["paper_edge_counts"],
                    "tree_path": f"trees/{cat['id']}.json",
                })
    finally:
        drv.close()

    # Persist per-paper details (dedupe: many papers appear in multiple trees)
    for pid, detail in all_paper_details.items():
        (PAPERS_DIR / f"{pid}.json").write_text(
            json.dumps(detail, ensure_ascii=False),
            encoding="utf-8",
        )
    manifest["distinct_papers_written"] = len(all_paper_details)
    (OUT / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"\nWrote manifest.json ({len(all_paper_details)} distinct paper details)")


if __name__ == "__main__":
    main()
