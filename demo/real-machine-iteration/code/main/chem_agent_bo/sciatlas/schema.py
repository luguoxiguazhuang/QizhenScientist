"""Configuration schema for reproducible SciAtlas evidence preparation."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import yaml


@dataclass(frozen=True)
class SciAtlasTaskProfile:
    task: str
    reaction_scope: str
    query: str
    variables: tuple[str, ...]
    keywords: tuple[str, ...]
    target_nodes: tuple[str, ...]
    blocked_title_patterns: tuple[str, ...] = ()
    top_k: int = 12
    retrieval_mode: str = "hybrid"

    def request_payload(self, *, top_k: int | None = None) -> dict[str, Any]:
        return {
            "plan": {
                "query_text": self.query,
                "source_type": "idea_text",
                "source_title": None,
                "keywords": [
                    {"text": keyword, "score": 10 if index == 0 else 8}
                    for index, keyword in enumerate(self.keywords)
                ],
                "titles": [],
                "reference_titles": [],
            },
            "options": {
                "top_k": int(top_k or self.top_k),
                "retrieval_mode": self.retrieval_mode,
            },
        }


def load_sciatlas_config(path: str | Path, task: str) -> SciAtlasTaskProfile:
    with Path(path).open("r", encoding="utf-8") as handle:
        payload = yaml.safe_load(handle) or {}
    if not isinstance(payload, dict):
        raise TypeError("SciAtlas config must be a mapping.")
    tasks = payload.get("tasks") or {}
    raw = tasks.get(task)
    if not isinstance(raw, dict):
        raise KeyError(f"SciAtlas config does not define task `{task}`.")
    required = ("reaction_scope", "query", "variables")
    missing = [key for key in required if not raw.get(key)]
    if missing:
        raise ValueError(f"SciAtlas task `{task}` is missing: {', '.join(missing)}")
    keywords = tuple(str(item).strip() for item in raw.get("keywords") or [] if str(item).strip())
    if not keywords:
        keywords = (str(raw["reaction_scope"]),)
    target_nodes = tuple(
        str(item).strip() for item in raw.get("target_nodes") or [] if str(item).strip()
    )
    return SciAtlasTaskProfile(
        task=task,
        reaction_scope=str(raw["reaction_scope"]).strip(),
        query=str(raw["query"]).strip(),
        variables=tuple(str(item).strip() for item in raw["variables"] if str(item).strip()),
        keywords=keywords,
        target_nodes=target_nodes,
        blocked_title_patterns=tuple(
            str(item).strip().lower()
            for item in raw.get("blocked_title_patterns") or []
            if str(item).strip()
        ),
        top_k=max(1, int(raw.get("top_k") or 12)),
        retrieval_mode=str(raw.get("retrieval_mode") or "hybrid").strip(),
    )
