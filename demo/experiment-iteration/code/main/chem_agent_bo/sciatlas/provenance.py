"""Provenance validation for frozen SciAtlas evidence bundles."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any

from chem_agent_bo.lab.evidence import EvidenceCard


def validate_sciatlas_evidence_bundle(
    *,
    evidence_path: str | Path,
    manifest_path: str | Path | None,
    task_alias: str,
    cards: list[EvidenceCard],
    allow_unreviewed: bool,
) -> dict[str, Any]:
    """Validate origin, review state, safety declaration, and checksum."""

    evidence_file = Path(evidence_path).resolve()
    if not evidence_file.exists():
        raise FileNotFoundError(
            f"A frozen literature prior requires its evidence card file: {evidence_file}. "
            f"Run `python code/scripts/prepare_sciatlas_evidence.py {task_alias}` first."
        )
    if not cards:
        raise RuntimeError("No applicable SciAtlas evidence cards remained after scope filtering.")
    invalid_sources = [
        card.card_id
        for card in cards
        if str(card.source_type or "").strip().lower() != "sciatlas_literature"
    ]
    if invalid_sources:
        raise ValueError(
            "A frozen literature bundle accepts only `sciatlas_literature` cards; invalid cards: "
            + ", ".join(invalid_sources)
        )
    unsafe_cards = [
        card.card_id
        for card in cards
        if str(card.leakage_risk or "").strip().lower() != "clean_literature_prior"
    ]
    if unsafe_cards:
        raise ValueError("SciAtlas evidence failed leakage policy: " + ", ".join(unsafe_cards))

    manifest_file = (
        Path(manifest_path).resolve()
        if manifest_path
        else evidence_file.with_name("manifest.json")
    )
    if not manifest_file.exists():
        raise FileNotFoundError(f"SciAtlas evidence manifest not found: {manifest_file}")
    manifest = json.loads(manifest_file.read_text(encoding="utf-8"))
    if not isinstance(manifest, dict):
        raise TypeError("SciAtlas manifest must be a JSON object.")
    if str(manifest.get("task") or "") != task_alias:
        raise ValueError(
            f"SciAtlas manifest task mismatch: expected `{task_alias}`, "
            f"found `{manifest.get('task')}`."
        )
    if manifest.get("uses_benchmark_test_labels") is not False:
        raise ValueError("SciAtlas manifest must explicitly declare uses_benchmark_test_labels=false.")
    review_status = str(manifest.get("review_status") or "").strip().lower()
    if review_status != "approved" and not allow_unreviewed:
        raise RuntimeError(
            "SciAtlas evidence is not approved for a formal run. Review evidence_cards.jsonl, "
            "then set manifest.json review_status to `approved`. For smoke tests only, pass "
            "--allow-unreviewed-sciatlas-evidence."
        )
    expected_hash = str(
        (((manifest.get("artifacts") or {}).get("evidence_cards") or {}).get("sha256")) or ""
    ).strip()
    actual_hash = hashlib.sha256(evidence_file.read_bytes()).hexdigest()
    if not expected_hash or expected_hash != actual_hash:
        raise ValueError(
            "SciAtlas evidence checksum does not match its manifest. Regenerate the frozen bundle "
            "or update the manifest only after reviewing the changed cards."
        )
    return {
        "source": "sciatlas_frozen_literature",
        "evidence_path": str(evidence_file),
        "evidence_sha256": actual_hash,
        "manifest_path": str(manifest_file),
        "manifest_sha256": hashlib.sha256(manifest_file.read_bytes()).hexdigest(),
        "review_status": review_status,
        "card_count": len(cards),
        "online_retrieval_during_optimization": False,
        "uses_benchmark_test_labels": False,
    }
