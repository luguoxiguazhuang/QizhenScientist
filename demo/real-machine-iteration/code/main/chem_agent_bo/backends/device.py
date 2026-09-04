"""LabVLA interface: push a SkillNet protocol to the real-instrument executor.

This is the launcher side of the LabVLA boundary. It submits a decomposed
protocol over HTTP to a LabVLA-driven executor, which performs the multimodal
embodied operations and returns the measured objective value.

The launcher is a batch process, not a server, so it cannot receive a callback.
This backend therefore submits a task and then polls for its terminal state.
A failed or timed-out task raises instead of degrading to a replayed value --
silently substituting a table lookup mid-run would write unmeasured numbers
into the experimental record.
"""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass
from typing import Any

from chem_agent_bo.backends.base import DEVICE, DeviceExecutionError, ExecutionOutcome

LOGGER = logging.getLogger(__name__)

_TERMINAL_OK = {"completed", "succeeded", "success", "done", "finished"}
_TERMINAL_BAD = {"failed", "error", "aborted", "cancelled", "canceled"}


@dataclass
class DeviceConfig:
    """Connection and pacing settings for the instrument endpoint."""

    base_url: str = ""
    submit_path: str = "/tasks"
    status_path: str = "/tasks/{task_id}"
    health_path: str = "/health"
    poll_interval_sec: float = 30.0
    timeout_sec: float = 7200.0
    request_timeout_sec: float = 60.0
    max_retries: int = 3
    objective_key: str = "yield"

    @classmethod
    def from_mapping(cls, payload: dict[str, Any] | None) -> "DeviceConfig":
        data = dict(payload or {})
        known = {field_name for field_name in cls.__dataclass_fields__}
        unknown = set(data) - known
        if unknown:
            raise ValueError(
                "Unknown runtime.execution.device keys: " + ", ".join(sorted(unknown))
            )
        return cls(**data)


class DeviceBackend:
    """LabVLA interface client.

    Submits a SkillNet protocol to the LabVLA-driven executor, then polls until
    the instrument reaches a verdict.
    """

    name = DEVICE

    def __init__(self, config: DeviceConfig, *, session: Any | None = None) -> None:
        if not str(config.base_url or "").strip():
            raise ValueError(
                "runtime.execution.device.base_url is required when backend is `device`."
            )
        self.config = config
        self._base_url = str(config.base_url).rstrip("/")
        self._session = session or self._default_session()

    @staticmethod
    def _default_session() -> Any:
        import requests  # imported lazily so table-only runs need no network stack

        return requests.Session()

    def _url(self, path: str, **kwargs: Any) -> str:
        return f"{self._base_url}{path.format(**kwargs)}"

    def is_available(self) -> bool:
        """Probe the instrument. Never raises -- an unreachable device is a
        expected state, not a programming error."""

        try:
            response = self._session.get(
                self._url(self.config.health_path),
                timeout=min(10.0, float(self.config.request_timeout_sec)),
            )
            return bool(getattr(response, "ok", False))
        except Exception as exc:  # noqa: BLE001
            LOGGER.warning("Instrument health probe failed: %s", exc)
            return False

    def _submit(
        self,
        *,
        task: str,
        candidate_id: int,
        candidate: dict[str, Any],
        steps: list[dict[str, Any]],
    ) -> str:
        payload = {
            "task": task,
            "candidate_id": int(candidate_id),
            "candidate": candidate,
            "steps": steps,
        }
        last_error: Exception | None = None
        for attempt in range(1, max(1, int(self.config.max_retries)) + 1):
            try:
                response = self._session.post(
                    self._url(self.config.submit_path),
                    json=payload,
                    timeout=float(self.config.request_timeout_sec),
                )
                response.raise_for_status()
                body = response.json()
                task_id = str(body.get("task_id") or "").strip()
                if not task_id:
                    raise DeviceExecutionError(
                        f"Instrument accepted the task but returned no task_id: {body}"
                    )
                return task_id
            except Exception as exc:  # noqa: BLE001
                last_error = exc
                if attempt >= max(1, int(self.config.max_retries)):
                    break
                backoff = min(30.0, 2.0**attempt)
                LOGGER.warning(
                    "Task submission attempt %d failed (%s); retrying in %.1fs",
                    attempt,
                    exc,
                    backoff,
                )
                time.sleep(backoff)
        raise DeviceExecutionError(
            f"Could not submit candidate {candidate_id} to the instrument: {last_error}"
        ) from last_error

    def _poll(self, task_id: str) -> dict[str, Any]:
        deadline = time.monotonic() + float(self.config.timeout_sec)
        url = self._url(self.config.status_path, task_id=task_id)
        while True:
            try:
                response = self._session.get(
                    url, timeout=float(self.config.request_timeout_sec)
                )
                response.raise_for_status()
                body = response.json()
            except Exception as exc:  # noqa: BLE001
                # A transient read failure should not discard a running experiment.
                LOGGER.warning("Status poll for task %s failed: %s", task_id, exc)
                body = {}

            status = str(body.get("status") or "").strip().lower()
            if status in _TERMINAL_OK:
                return body
            if status in _TERMINAL_BAD:
                raise DeviceExecutionError(
                    f"Instrument reported task {task_id} as `{status}`: "
                    f"{body.get('detail') or body}"
                )
            if time.monotonic() >= deadline:
                raise DeviceExecutionError(
                    f"Task {task_id} did not finish within "
                    f"{self.config.timeout_sec:.0f}s (last status `{status or 'unknown'}`)."
                )
            time.sleep(float(self.config.poll_interval_sec))

    def query(
        self,
        *,
        task: str,
        candidate_id: int,
        candidate: dict[str, Any],
        steps: list[dict[str, Any]],
    ) -> ExecutionOutcome:
        task_id = self._submit(
            task=task, candidate_id=candidate_id, candidate=candidate, steps=steps
        )
        LOGGER.info("Instrument accepted candidate %s as task %s", candidate_id, task_id)
        body = self._poll(task_id)
        if self.config.objective_key not in body:
            raise DeviceExecutionError(
                f"Task {task_id} completed without a `{self.config.objective_key}` value: {body}"
            )
        try:
            value = float(body[self.config.objective_key])
        except (TypeError, ValueError) as exc:
            raise DeviceExecutionError(
                f"Task {task_id} returned a non-numeric objective: {body}"
            ) from exc
        return ExecutionOutcome(
            value=value,
            backend=DEVICE,
            raw={"task_id": task_id, "response": body},
        )
