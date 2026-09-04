"""Execution backend interface shared by the launcher and the lab service.

This is the LabVLA interface contract: :class:`ExecutionBackend` is what a
LabVLA-driven robotic executor implements on the far side of the boundary.

An execution backend answers one question: given a chosen condition and the
protocol steps it decomposes into, what was the measured objective value? The
real instrument is the primary implementation; the bundled result table is the
substitute used when no instrument is reachable.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Protocol, runtime_checkable

TABLE_LOOKUP = "table_lookup"
DEVICE = "device"
AUTO = "auto"

#: Values accepted by ``runtime.execution.backend``.
BACKEND_CHOICES: tuple[str, ...] = (DEVICE, TABLE_LOOKUP, AUTO)


class ExecutionError(RuntimeError):
    """Raised when a backend cannot produce a trustworthy measurement."""


class DeviceExecutionError(ExecutionError):
    """Raised when the instrument rejects, fails, or times out on a task."""


@dataclass(frozen=True)
class ExecutionOutcome:
    """One measurement plus the provenance needed to audit it later."""

    value: float
    backend: str
    raw: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if self.backend not in {DEVICE, TABLE_LOOKUP}:
            raise ValueError(
                f"ExecutionOutcome.backend must name a concrete backend, got `{self.backend}`."
            )


@runtime_checkable
class ExecutionBackend(Protocol):
    """Where an observed objective value comes from -- the LabVLA interface.

    This is the contract a LabVLA-driven robotic executor implements. It is the
    superset of ``main/oracle.py:ResultOracle``: it adds the SkillNet-decomposed
    ``steps`` an instrument needs in order to run the experiment, and returns
    provenance alongside the value instead of a bare float.
    """

    name: str

    def is_available(self) -> bool:
        """Whether this backend can currently accept work."""

    def query(
        self,
        *,
        task: str,
        candidate_id: int,
        candidate: dict[str, Any],
        steps: list[dict[str, Any]],
    ) -> ExecutionOutcome:
        """Run one condition and return its measured objective value."""
