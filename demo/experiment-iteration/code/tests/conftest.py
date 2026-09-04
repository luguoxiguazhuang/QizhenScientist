from __future__ import annotations

from pathlib import Path
import sys


MAIN_ROOT = Path(__file__).resolve().parents[1] / "main"
if str(MAIN_ROOT) not in sys.path:
    sys.path.insert(0, str(MAIN_ROOT))
