"""Conservative sanitization for literature used in public-oracle benchmarks."""

from __future__ import annotations

from dataclasses import dataclass
import re
from typing import Any


PERCENT_VALUE = re.compile(r"(?<!\w)\d{1,3}(?:\.\d+)?\s*%")
ORACLE_TERMS = (
    "candidate_lookup",
    "candidate-level lookup",
    "benchmark oracle",
    "test.csv",
    "test_features.csv",
    "global optimum",
    "global best condition",
)


@dataclass(frozen=True)
class EvidenceSafetyReport:
    accepted: bool
    reasons: tuple[str, ...]
    redactions: int = 0


def sanitize_paper(
    paper: dict[str, Any],
    *,
    blocked_title_patterns: tuple[str, ...] = (),
) -> tuple[dict[str, Any], EvidenceSafetyReport]:
    """Keep bibliographic evidence while excluding likely benchmark answers.

    Percentage values are removed from prose because exact yields are not
    needed for a transferable prior.  A title explicitly blocked by the task
    config, or text naming an oracle/candidate lookup, rejects the whole paper.
    """

    title = _text(paper, "title", "paper_title", "work_title", "display_name", "name")
    abstract = _text(
        paper,
        "abstract",
        "abstract_text",
        "summary",
        "description",
        "snippet",
    )
    combined = f"{title}\n{abstract}".lower()
    reasons: list[str] = []
    if any(pattern and pattern in title.lower() for pattern in blocked_title_patterns):
        reasons.append("blocked_title_pattern")
    if any(term in combined for term in ORACLE_TERMS):
        reasons.append("oracle_or_candidate_lookup_language")
    if not abstract:
        reasons.append("missing_evidence_text")
    if reasons:
        return {}, EvidenceSafetyReport(False, tuple(reasons))

    sanitized_abstract, redactions = PERCENT_VALUE.subn("[numeric yield redacted]", abstract)
    normalized = {
        "paper_id": _text(paper, "paper_id", "id", "work_id", "openalex_id"),
        "title": title,
        "abstract": sanitized_abstract,
        "doi": _normalize_doi(_text(paper, "doi", "DOI")),
        "url": _text(paper, "url", "paper_url", "landing_page_url"),
        "venue": _text(paper, "venue", "journal", "source", "publication_venue"),
        "year": _text(paper, "year", "publication_year", "published_year"),
        "score": _number(
            paper,
            "score",
            "relevance_score",
            "rank_score",
            "kg_score",
            "similarity",
            "similarity_score",
            "final_score",
        ),
    }
    if not normalized["title"]:
        return {}, EvidenceSafetyReport(False, ("missing_title",), redactions)
    return normalized, EvidenceSafetyReport(True, (), redactions)


def _text(payload: dict[str, Any], *keys: str) -> str:
    for key in keys:
        value = payload.get(key)
        if value is not None and str(value).strip():
            return " ".join(str(value).split())
    return ""


def _number(payload: dict[str, Any], *keys: str) -> float | None:
    for key in keys:
        try:
            value = payload.get(key)
            if value is not None:
                return float(value)
        except (TypeError, ValueError):
            continue
    return None


def _normalize_doi(value: str) -> str:
    normalized = value.strip()
    for prefix in ("https://doi.org/", "http://doi.org/", "doi:"):
        if normalized.lower().startswith(prefix):
            normalized = normalized[len(prefix):]
            break
    return normalized.strip()
