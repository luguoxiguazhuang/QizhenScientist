"""Evaluator result-query boundary.

The optimizer depends on this boundary rather than opening evaluator labels
directly. The concrete implementations live in
``chem_agent_bo.backends``: :class:`~chem_agent_bo.backends.DeviceBackend`
runs a decomposed protocol on a real instrument, and
:class:`~chem_agent_bo.backends.TableLookupBackend` replays the bundled result
table when no instrument is reachable.

``ExecutionBackend`` is the interface the runtime actually uses. It is a
superset of :class:`ResultOracle`: it also receives the decomposed protocol
steps, and returns provenance alongside the value so a replayed number is never
mistaken for a measurement. ``ResultOracle`` is kept as the minimal contract a
competition harness can implement.
"""

from __future__ import annotations

from typing import Any, Protocol

from chem_agent_bo.backends import (
    ExecutionBackend,
    ExecutionOutcome,
    TableLookupBackend,
)

__all__ = ["ExecutionBackend", "ExecutionOutcome", "ResultOracle", "TableLookupBackend"]


class ResultOracle(Protocol):
    """Minimal interface used by a closed-loop evaluator."""

    def query(self, *, task: str, candidate_id: int, candidate: dict[str, Any]) -> float:
        """Return the true objective value for one selected candidate."""
        ...
