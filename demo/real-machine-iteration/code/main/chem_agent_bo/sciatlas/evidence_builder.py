"""Convert frozen SciAtlas results into TRACE EvidenceCard objects."""

from __future__ import annotations

import hashlib
from typing import Any

from chem_agent_bo.lab.evidence import EvidenceCard

from .leakage_guard import sanitize_paper
from .schema import SciAtlasTaskProfile


def extract_ranked_papers(response: dict[str, Any]) -> list[dict[str, Any]]:
    """Accept current and legacy SciAtlas response envelopes."""

    paths = (
        ("data", "result", "ranking", "papers"),
        ("data", "papers"),
        ("result", "ranking", "papers"),
        ("result", "papers"),
        ("papers",),
    )
    for path in paths:
        value: Any = response
        for key in path:
            if not isinstance(value, dict):
                value = None
                break
            value = value.get(key)
        if isinstance(value, list):
            return [item for item in value if isinstance(item, dict)]
    return []


def build_evidence_cards(
    response: dict[str, Any],
    profile: SciAtlasTaskProfile,
) -> tuple[list[EvidenceCard], dict[str, Any]]:
    papers = extract_ranked_papers(response)
    cards: list[EvidenceCard] = []
    rejected: list[dict[str, Any]] = []
    redaction_count = 0
    seen: set[str] = set()
    for rank, paper in enumerate(papers, start=1):
        normalized, safety = sanitize_paper(
            paper,
            blocked_title_patterns=profile.blocked_title_patterns,
        )
        redaction_count += safety.redactions
        if not safety.accepted:
            rejected.append({
                "rank": rank,
                "title": str(paper.get("title") or ""),
                "reasons": list(safety.reasons),
            })
            continue
        identity = normalized["doi"] or normalized["paper_id"] or normalized["title"].lower()
        if identity in seen:
            continue
        seen.add(identity)
        abstract = str(normalized["abstract"] or "").strip()
        source_parts = [normalized["title"]]
        if normalized["venue"]:
            source_parts.append(normalized["venue"])
        if normalized["year"]:
            source_parts.append(str(normalized["year"]))
        digest = hashlib.sha256(str(identity).encode("utf-8")).hexdigest()[:12]
        cards.append(
            EvidenceCard(
                card_id=f"sciatlas_{profile.task}_{digest}",
                source="; ".join(source_parts),
                summary=abstract[:1600],
                reaction_scope=profile.reaction_scope,
                variable_scope=list(profile.variables),
                target_nodes=list(profile.target_nodes),
                mapping_status="same_reaction_family",
                confidence=_confidence(normalized.get("score")),
                allowed_use="advisory",
                source_type="sciatlas_literature",
                source_path=str(normalized["url"] or ""),
                doi=str(normalized["doi"] or ""),
                transferability_note=(
                    "Literature prior retrieved by SciAtlas; use only to compare candidates "
                    "already proposed by the optimizer. It is not candidate-level oracle evidence."
                ),
                leakage_risk="clean_literature_prior",
                notes=f"SciAtlas retrieval rank {rank}; frozen before optimization.",
            )
        )
    audit = {
        "retrieved_paper_count": len(papers),
        "accepted_card_count": len(cards),
        "rejected_paper_count": len(rejected),
        "numeric_yield_redaction_count": redaction_count,
        "rejected_papers": rejected,
    }
    return cards, audit


def _confidence(score: Any) -> str:
    try:
        numeric = float(score)
    except (TypeError, ValueError):
        return "medium"
    if numeric >= 0.8:
        return "high"
    if numeric < 0.3:
        return "low"
    return "medium"
