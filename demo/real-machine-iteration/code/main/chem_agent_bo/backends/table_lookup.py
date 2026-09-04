"""Substitute backend: read the objective from the bundled result table.

Used when no instrument is reachable. Every value it returns is labelled
``table_lookup`` so a replayed number is never mistaken for a fresh
measurement.
"""

from __future__ import annotations

from typing import Any

from chem_agent_bo.backends.base import TABLE_LOOKUP, ExecutionError, ExecutionOutcome


class TableLookupBackend:
    """Look a candidate's objective up in a preloaded finite-pool table."""

    name = TABLE_LOOKUP

    def __init__(
        self,
        candidate_lookup: dict[tuple[str, ...], dict[str, Any]],
        *,
        feature_columns: list[str],
        target_key: str = "observed_yield",
    ) -> None:
        self._candidate_lookup = candidate_lookup
        self._feature_columns = list(feature_columns)
        self._target_key = target_key

    def is_available(self) -> bool:
        return bool(self._candidate_lookup)

    def query(
        self,
        *,
        task: str,
        candidate_id: int,
        candidate: dict[str, Any],
        steps: list[dict[str, Any]],
    ) -> ExecutionOutcome:
        key = tuple(str(candidate[column]) for column in self._feature_columns)
        record = self._candidate_lookup.get(key)
        if record is None:
            raise ExecutionError(
                f"Candidate is outside the bundled result table for task `{task}`: {candidate}"
            )
        return ExecutionOutcome(
            value=float(record[self._target_key]),
            backend=TABLE_LOOKUP,
            raw={"query_index": record.get("query_index"), "source": "bundled_result_table"},
        )
