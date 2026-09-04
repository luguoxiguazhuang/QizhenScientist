"""Reference implementation of the executor side of the LabVLA interface.

The launcher does not run experiments itself: when it needs a yield it hands a
SkillNet-decomposed protocol across the LabVLA boundary and waits for the
measurement. This script implements the executor half of that contract, so the
loop can be exercised end to end before a LabVLA-driven robot is wired up, and
so whoever builds the real executor has an unambiguous reference.

    Terminal 1:  python code/scripts/device_stub.py --port 8900
    Terminal 2:  python code/scripts/run.py suzuki --rounds 3 \
                     --controller-mode atlas_baseline \
                     --execution-backend device \
                     --device-base-url http://127.0.0.1:8900

Contract
--------
    GET  /health                 -> 200 while the executor can accept work
    POST /tasks                  {task, candidate_id, candidate, steps}
                                 -> {"task_id": "..."}
    GET  /tasks/{task_id}        -> {"status": "pending" | "running"
                                     | "completed" | "failed",
                                     "yield": <float>,      # when completed
                                     "detail": "..."}       # when failed

`steps` is the ordered protocol from ``chem_agent_bo.steps``; each entry carries
``index``, ``action`` (one of take_sample / dispense / stir / heat / quench /
analyze), ``target``, ``role``, ``amount``, ``unit``, ``duration_min``,
``temperature_c`` and ``note``.

This stub is for wiring and testing only. It does not measure anything: it
either replays the bundled result table or returns a fixed value, and it always
labels which. Never present its numbers as experimental data.
"""

from __future__ import annotations

import argparse
import csv
import sys
import threading
import uuid
from pathlib import Path
from typing import Any

SUBMISSION_ROOT = Path(__file__).resolve().parents[2]


def load_reference_table(csv_path: Path) -> dict[tuple[str, ...], float]:
    """Load condition -> yield so the stub can echo plausible numbers."""

    with csv_path.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        columns = [c for c in (reader.fieldnames or []) if c != "Yield"]
        return {
            tuple(str(row[c]) for c in columns): float(row["Yield"])
            for row in reader
        }, columns


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8900)
    parser.add_argument(
        "--reference-csv",
        default=str(SUBMISSION_ROOT / "data" / "Suzuki" / "suzuki_test.csv"),
        help="Table used to echo a plausible yield. Omit to always return --fixed-yield.",
    )
    parser.add_argument(
        "--fixed-yield",
        type=float,
        default=50.0,
        help="Value returned when a condition is not in the reference table.",
    )
    parser.add_argument(
        "--latency-sec",
        type=float,
        default=0.0,
        help="Seconds a task stays `running`, to exercise the launcher's polling.",
    )
    parser.add_argument(
        "--fail-every",
        type=int,
        default=0,
        help="Fail every Nth task, to exercise the launcher's error path (0 = never).",
    )
    return parser


def create_app(args: argparse.Namespace):  # noqa: ANN201
    from fastapi import FastAPI, HTTPException

    table: dict[tuple[str, ...], float] = {}
    columns: list[str] = []
    reference = Path(args.reference_csv) if args.reference_csv else None
    if reference and reference.exists():
        table, columns = load_reference_table(reference)
        print(f"[device_stub] reference table: {len(table)} rows from {reference}")
    else:
        print("[device_stub] no reference table; every task returns --fixed-yield")

    app = FastAPI(title="Instrument stub")
    tasks: dict[str, dict[str, Any]] = {}
    lock = threading.Lock()
    counter = {"n": 0}

    @app.get("/health")
    def health() -> dict[str, Any]:
        with lock:
            return {"ok": True, "active_tasks": len(tasks)}

    @app.post("/tasks")
    def submit(payload: dict[str, Any]) -> dict[str, str]:
        steps = payload.get("steps") or []
        if not steps:
            raise HTTPException(status_code=400, detail="A task must carry its protocol steps.")
        candidate = payload.get("candidate") or {}
        task_id = uuid.uuid4().hex[:12]

        with lock:
            counter["n"] += 1
            index = counter["n"]
        should_fail = args.fail_every > 0 and index % args.fail_every == 0

        key = tuple(str(candidate.get(c, "")) for c in columns) if columns else ()
        measured = table.get(key, args.fixed_yield)

        print(
            f"[device_stub] task {task_id}: {len(steps)} steps, "
            f"{sum(1 for s in steps if s.get('action') == 'dispense')} dispense, "
            f"candidate_id={payload.get('candidate_id')}"
            + ("  -> will FAIL" if should_fail else f"  -> {measured}")
        )
        for step in steps:
            amount = (
                f"{step['amount']} {step.get('unit') or ''}".strip()
                if step.get("amount") is not None
                else ""
            )
            print(f"    {step.get('index')}. {step.get('action'):<12} "
                  f"{str(step.get('target'))[:44]:<44} {amount}")

        with lock:
            tasks[task_id] = {
                "created": __import__("time").monotonic(),
                "yield": measured,
                "fail": should_fail,
            }
        return {"task_id": task_id}

    @app.get("/tasks/{task_id}")
    def status(task_id: str) -> dict[str, Any]:
        import time

        with lock:
            task = tasks.get(task_id)
        if task is None:
            raise HTTPException(status_code=404, detail=f"Unknown task {task_id}")
        if time.monotonic() - task["created"] < args.latency_sec:
            return {"status": "running"}
        if task["fail"]:
            return {"status": "failed", "detail": "Simulated instrument fault."}
        return {
            "status": "completed",
            "yield": task["yield"],
            "source": "device_stub (not a measurement)",
        }

    return app


def main(argv: list[str] | None = None) -> None:
    args = build_parser().parse_args(argv)
    try:
        import uvicorn
    except ImportError:
        print("device_stub needs fastapi and uvicorn: pip install fastapi uvicorn", file=sys.stderr)
        raise SystemExit(1)
    print(f"[device_stub] listening on http://{args.host}:{args.port}")
    uvicorn.run(create_app(args), host=args.host, port=args.port, log_level="warning")


if __name__ == "__main__":
    main()
