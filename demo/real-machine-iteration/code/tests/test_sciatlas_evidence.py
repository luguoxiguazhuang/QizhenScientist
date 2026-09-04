from __future__ import annotations

import hashlib
import json
from pathlib import Path
import subprocess
import sys

import pytest

from chem_agent_bo.lab.evidence import EvidenceStore
from chem_agent_bo.sciatlas.client import SciAtlasClient, SciAtlasClientConfig
from chem_agent_bo.sciatlas.evidence_builder import build_evidence_cards, extract_ranked_papers
from chem_agent_bo.sciatlas.provenance import validate_sciatlas_evidence_bundle
from chem_agent_bo.sciatlas.schema import SciAtlasTaskProfile


def _profile() -> SciAtlasTaskProfile:
    return SciAtlasTaskProfile(
        task="suzuki",
        reaction_scope="suzuki-miyaura cross-coupling",
        query="Suzuki ligand effects",
        variables=("Ligand", "Base"),
        keywords=("Suzuki ligand",),
        target_nodes=("shortlist_rerank",),
        blocked_title_patterns=("benchmark result table",),
    )


def test_build_cards_extracts_current_response_and_sanitizes_exact_yields():
    response = {
        "ok": True,
        "data": {
            "result": {
                "ranking": {
                    "papers": [
                        {
                            "paper_id": "P1",
                            "title": "Ligand effects in Suzuki coupling",
                            "abstract": "The optimized reaction gave 87.5% yield across the scope.",
                            "doi": "https://doi.org/10.1000/example",
                            "score": 0.91,
                        },
                        {
                            "paper_id": "P2",
                            "title": "Benchmark result table for Suzuki",
                            "abstract": "Candidate-level results.",
                        },
                    ]
                }
            }
        },
    }

    assert len(extract_ranked_papers(response)) == 2
    cards, audit = build_evidence_cards(response, _profile())

    assert len(cards) == 1
    assert cards[0].source_type == "sciatlas_literature"
    assert cards[0].doi == "10.1000/example"
    assert "87.5%" not in cards[0].summary
    assert "[numeric yield redacted]" in cards[0].summary
    assert audit["rejected_paper_count"] == 1
    assert audit["numeric_yield_redaction_count"] == 1


def test_frozen_bundle_requires_review_and_matching_checksum(tmp_path):
    response = {
        "papers": [{"paper_id": "P1", "title": "Suzuki ligand study", "abstract": "A prior."}]
    }
    cards, _audit = build_evidence_cards(response, _profile())
    evidence_path = tmp_path / "evidence_cards.jsonl"
    EvidenceStore(cards).write_jsonl(evidence_path)
    digest = hashlib.sha256(evidence_path.read_bytes()).hexdigest()
    manifest_path = tmp_path / "manifest.json"
    manifest = {
        "task": "suzuki",
        "uses_benchmark_test_labels": False,
        "review_status": "pending_human_review",
        "artifacts": {"evidence_cards": {"sha256": digest}},
    }
    manifest_path.write_text(json.dumps(manifest), encoding="utf-8")

    with pytest.raises(RuntimeError, match="not approved"):
        validate_sciatlas_evidence_bundle(
            evidence_path=evidence_path,
            manifest_path=manifest_path,
            task_alias="suzuki",
            cards=cards,
            allow_unreviewed=False,
        )

    manifest["review_status"] = "approved"
    manifest_path.write_text(json.dumps(manifest), encoding="utf-8")
    metadata = validate_sciatlas_evidence_bundle(
        evidence_path=evidence_path,
        manifest_path=manifest_path,
        task_alias="suzuki",
        cards=cards,
        allow_unreviewed=False,
    )
    assert metadata["evidence_sha256"] == digest
    assert metadata["online_retrieval_during_optimization"] is False

    evidence_path.write_text(evidence_path.read_text() + "\n", encoding="utf-8")
    with pytest.raises(ValueError, match="checksum"):
        validate_sciatlas_evidence_bundle(
            evidence_path=evidence_path,
            manifest_path=manifest_path,
            task_alias="suzuki",
            cards=cards,
            allow_unreviewed=False,
        )


def test_client_refuses_remote_search_without_token():
    client = SciAtlasClient(
        SciAtlasClientConfig(base_url="http://sciatlas.invalid", api_key="", timeout_seconds=1)
    )
    with pytest.raises(RuntimeError, match="SCIATLAS_API_KEY"):
        client.search({"plan": {}, "options": {}})


def test_preparation_script_supports_frozen_offline_response(tmp_path):
    response_path = tmp_path / "response.json"
    response_path.write_text(
        json.dumps(
            {
                "data": {
                    "result": {
                        "ranking": {
                            "papers": [
                                {
                                    "paper_id": "P1",
                                    "title": "Suzuki coupling ligand selection",
                                    "abstract": "Ligand electronics affect substrate scope.",
                                }
                            ]
                        }
                    }
                }
            }
        ),
        encoding="utf-8",
    )
    output_dir = tmp_path / "bundle"
    submission_root = Path(__file__).resolve().parents[2]
    completed = subprocess.run(
        [
            sys.executable,
            str(submission_root / "code" / "scripts" / "prepare_sciatlas_evidence.py"),
            "suzuki",
            "--response-json",
            str(response_path),
            "--output-dir",
            str(output_dir),
        ],
        cwd=submission_root,
        check=True,
        capture_output=True,
        text=True,
    )
    payload = json.loads(completed.stdout)
    manifest = json.loads((output_dir / "manifest.json").read_text(encoding="utf-8"))

    assert payload["evidence_card_count"] == 1
    assert manifest["review_status"] == "pending_human_review"
    assert manifest["uses_benchmark_test_labels"] is False
    assert (output_dir / "evidence_cards.jsonl").exists()
