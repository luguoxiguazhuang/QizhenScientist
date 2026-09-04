"""Submission launcher wrapper.

Each round the launcher proposes a condition, orchestrates it into an ordered
atomic-skill protocol through the SkillNet layer (``chem_agent_bo.steps``), and
hands that protocol across the LabVLA interface (``chem_agent_bo.backends``) to
be executed -- on the instrument under backend `device`, or replayed from the
bundled result table otherwise.

Run from the submission root:

    python code/scripts/run.py suzuki
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path


SUBMISSION_ROOT = Path(__file__).resolve().parents[2]
SUBMISSION_CODE_ROOT = SUBMISSION_ROOT / "code"
MAIN_ROOT = SUBMISSION_CODE_ROOT / "main"
for extra_path in (SUBMISSION_CODE_ROOT, MAIN_ROOT):
    if str(extra_path) not in sys.path:
        sys.path.insert(0, str(extra_path))

from submission_runner import build_parser, run_with_args


def main(argv: list[str] | None = None) -> None:
    parser: argparse.ArgumentParser = build_parser()
    args = parser.parse_args(argv)
    run_with_args(args)


if __name__ == "__main__":
    main()
