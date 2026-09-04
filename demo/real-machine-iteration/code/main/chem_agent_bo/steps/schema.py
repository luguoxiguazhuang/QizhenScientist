"""SkillNet atomic experiment skills.

The closed action vocabulary of the SkillNet layer: every operation a protocol
may contain is one of these, so a device adapter can switch on them
exhaustively.

A reaction *condition* says what to combine; an :class:`ExperimentStep` says
what an operator or an instrument actually does, in order. The two are kept
separate because a condition is what the optimizer reasons about, while the
step list is what leaves the system as an executable instruction.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

# SkillNet atomic skill vocabulary. Closed by design: anything a decomposer
# emits must be in here so a device adapter can switch on it exhaustively.
TAKE_SAMPLE = "take_sample"
DISPENSE = "dispense"
STIR = "stir"
HEAT = "heat"
QUENCH = "quench"
ANALYZE = "analyze"

ACTIONS: tuple[str, ...] = (
    TAKE_SAMPLE,
    DISPENSE,
    STIR,
    HEAT,
    QUENCH,
    ANALYZE,
)


@dataclass(frozen=True)
class ExperimentStep:
    """One atomic operation in an experiment protocol."""

    index: int
    action: str
    target: str
    role: str = ""
    amount: float | None = None
    unit: str = ""
    duration_min: float | None = None
    temperature_c: float | None = None
    note: str = ""

    def __post_init__(self) -> None:
        if self.action not in ACTIONS:
            raise ValueError(
                f"Unknown action `{self.action}`. Allowed: {', '.join(ACTIONS)}."
            )
        if int(self.index) < 1:
            raise ValueError(f"Step index must be 1-based, got {self.index}.")

    def to_dict(self) -> dict[str, Any]:
        return {
            "index": int(self.index),
            "action": self.action,
            "target": self.target,
            "role": self.role,
            "amount": None if self.amount is None else float(self.amount),
            "unit": self.unit,
            "duration_min": None if self.duration_min is None else float(self.duration_min),
            "temperature_c": None if self.temperature_c is None else float(self.temperature_c),
            "note": self.note,
        }


def steps_to_payload(steps: list[ExperimentStep]) -> list[dict[str, Any]]:
    """Serialize an ordered step list for transport or persistence."""

    return [step.to_dict() for step in steps]
