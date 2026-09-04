"""Retrieve and freeze SciAtlas literature as TRACE evidence cards.

This is a preprocessing command. It never reads benchmark ``*_test.csv``
labels and is intentionally separate from the online optimization entrypoint.
"""

from __future__ import annotations

import argparse
from dataclasses import asdict
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import sys
from typing import Any


SUBMISSION_ROOT = Path(__file__).resolve().parents[2]
SUBMISSION_CODE_ROOT = SUBMISSION_ROOT / "code"
MAIN_ROOT = SUBMISSION_CODE_ROOT / "main"
for extra_path in (SUBMISSION_CODE_ROOT, MAIN_ROOT):
    if str(extra_path) not in sys.path:
        sys.path.insert(0, str(extra_path))

from chem_agent_bo.sciatlas import (
    SciAtlasClient,
    build_evidence_cards,
    load_sciatlas_config,
)


DEFAULT_CONFIG = SUBMISSION_CODE_ROOT / "config" / "sciatlas.yaml"


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Retrieve SciAtlas literature and freeze TRACE evidence cards.",
    )
    parser.add_argument("task", choices=("suzuki",))
    parser.add_argument("--config", default=str(DEFAULT_CONFIG))
    parser.add_argument(
        "--response-json",
        default="",
        help="Build from a previously frozen SciAtlas response instead of calling the API.",
    )
    parser.add_argument("--top-k", type=int, default=None)
    parser.add_argument(
        "--output-dir",
        default="",
        help="Defaults to data/evidence_cards/sciatlas/<task>.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Replace an existing frozen artifact set in the exact output directory.",
    )
    return parser


def _json_bytes(payload: Any) -> bytes:
    return json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True).encode("utf-8")


def _write_atomic(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_bytes(data)
    temporary.replace(path)


def _sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def run(args: argparse.Namespace) -> dict[str, Any]:
    profile = load_sciatlas_config(args.config, args.task)
    request_payload = profile.request_payload(top_k=args.top_k)
    if args.response_json:
        response_path = Path(args.response_json).resolve()
        response = json.loads(response_path.read_text(encoding="utf-8"))
        retrieval_source = f"frozen_response:{response_path}"
    else:
        response = SciAtlasClient().search(request_payload)
        retrieval_source = "sciatlas_api"
    if not isinstance(response, dict):
        raise TypeError("SciAtlas response must be a JSON object.")

    cards, safety_audit = build_evidence_cards(response, profile)
    if not cards:
        raise RuntimeError(
            "SciAtlas returned no usable evidence cards after safety filtering. "
            "Inspect the raw response or revise the retrieval profile."
        )
    output_dir = (
        Path(args.output_dir).resolve()
        if args.output_dir
        else SUBMISSION_ROOT / "data" / "evidence_cards" / "sciatlas" / args.task
    )
    paths = {
        "request": output_dir / "request.json",
        "response": output_dir / "raw_response.json",
        "cards": output_dir / "evidence_cards.jsonl",
        "manifest": output_dir / "manifest.json",
    }
    existing = [str(path) for path in paths.values() if path.exists()]
    if existing and not args.force:
        raise FileExistsError(
            "Refusing to replace frozen SciAtlas artifacts without --force: " + ", ".join(existing)
        )

    request_bytes = _json_bytes(request_payload)
    response_bytes = _json_bytes(response)
    cards_bytes = b"".join(
        (json.dumps(asdict(card), ensure_ascii=False) + "\n").encode("utf-8")
        for card in cards
    )
    _write_atomic(paths["request"], request_bytes)
    _write_atomic(paths["response"], response_bytes)
    _write_atomic(paths["cards"], cards_bytes)
    manifest = {
        "schema_version": 1,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "method": "qizhen_scientist",
        "task": args.task,
        "reaction_scope": profile.reaction_scope,
        "retrieval_source": retrieval_source,
        "online_retrieval_during_optimization": False,
        "uses_benchmark_test_labels": False,
        "review_status": "pending_human_review",
        "profile": asdict(profile),
        "safety_audit": safety_audit,
        "artifacts": {
            "request": {"path": str(paths["request"]), "sha256": _sha256(request_bytes)},
            "raw_response": {"path": str(paths["response"]), "sha256": _sha256(response_bytes)},
            "evidence_cards": {"path": str(paths["cards"]), "sha256": _sha256(cards_bytes)},
        },
    }
    _write_atomic(paths["manifest"], _json_bytes(manifest))
    return {
        "task": args.task,
        "evidence_card_count": len(cards),
        "safety_audit": safety_audit,
        "output_dir": str(output_dir),
        "evidence_cards": str(paths["cards"]),
        "manifest": str(paths["manifest"]),
        "next_step": "Review the cards and set manifest review_status to approved before a formal run.",
    }


def main(argv: list[str] | None = None) -> None:
    args = build_parser().parse_args(argv)
    print(json.dumps(run(args), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
