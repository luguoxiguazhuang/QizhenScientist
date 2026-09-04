"""Execution backends, and the guarantee that a substitute never masquerades
as a measurement."""

from __future__ import annotations

from typing import Any

import pytest

from chem_agent_bo.backends import (
    DEVICE,
    TABLE_LOOKUP,
    DeviceBackend,
    DeviceConfig,
    DeviceExecutionError,
    ExecutionError,
    ExecutionOutcome,
    TableLookupBackend,
    build_execution_backend,
    normalize_backend,
)

FEATURES = ["Electrophile", "Solvent"]
CONDITION = {"Electrophile": "6-iodoquinoline", "Solvent": "methanol"}
LOOKUP = {
    ("6-iodoquinoline", "methanol"): {"query_index": 7, "observed_yield": 91.5},
}


# --------------------------------------------------------------------------- #
# A scriptable stand-in for the instrument HTTP endpoint.
# --------------------------------------------------------------------------- #
class _Response:
    def __init__(self, payload: dict[str, Any], *, ok: bool = True, status: int = 200) -> None:
        self._payload = payload
        self.ok = ok
        self.status_code = status

    def json(self) -> dict[str, Any]:
        return self._payload

    def raise_for_status(self) -> None:
        if not self.ok:
            raise RuntimeError(f"HTTP {self.status_code}")


class FakeDevice:
    """Replays a scripted sequence of status responses."""

    def __init__(
        self,
        *,
        healthy: bool = True,
        statuses: list[dict[str, Any]] | None = None,
        submit_failures: int = 0,
    ) -> None:
        self.healthy = healthy
        self.statuses = list(statuses or [{"status": "completed", "yield": 91.5}])
        self.submit_failures = submit_failures
        self.submitted: list[dict[str, Any]] = []
        self.submit_attempts = 0
        self.poll_count = 0

    def get(self, url: str, timeout: float | None = None) -> _Response:
        if url.endswith("/health"):
            return _Response({"ok": self.healthy}, ok=self.healthy)
        self.poll_count += 1
        index = min(self.poll_count - 1, len(self.statuses) - 1)
        return _Response(self.statuses[index])

    def post(self, url: str, json: dict[str, Any], timeout: float | None = None) -> _Response:
        self.submit_attempts += 1
        if self.submit_attempts <= self.submit_failures:
            raise ConnectionError("instrument refused the connection")
        self.submitted.append(json)
        return _Response({"task_id": "task-001"})


def _device(fake: FakeDevice, **overrides: Any) -> DeviceBackend:
    settings: dict[str, Any] = {
        "base_url": "http://instrument.local",
        "poll_interval_sec": 0.0,
        "timeout_sec": 5.0,
        "request_timeout_sec": 1.0,
        "max_retries": 3,
    }
    settings.update(overrides)
    return DeviceBackend(DeviceConfig(**settings), session=fake)


# --------------------------------------------------------------------------- #
# Table lookup
# --------------------------------------------------------------------------- #
def test_table_lookup_returns_labelled_outcome() -> None:
    backend = TableLookupBackend(LOOKUP, feature_columns=FEATURES)
    outcome = backend.query(task="suzuki", candidate_id=7, candidate=CONDITION, steps=[])

    assert outcome.value == 91.5
    assert outcome.backend == TABLE_LOOKUP
    assert outcome.raw["query_index"] == 7


def test_table_lookup_rejects_out_of_pool_candidate() -> None:
    backend = TableLookupBackend(LOOKUP, feature_columns=FEATURES)
    with pytest.raises(ExecutionError, match="outside the bundled result table"):
        backend.query(
            task="suzuki",
            candidate_id=0,
            candidate={"Electrophile": "unknown", "Solvent": "thf"},
            steps=[],
        )


# --------------------------------------------------------------------------- #
# Device: submit, poll, fail
# --------------------------------------------------------------------------- #
def test_device_polls_until_completion() -> None:
    fake = FakeDevice(
        statuses=[
            {"status": "running"},
            {"status": "running"},
            {"status": "completed", "yield": 88.25},
        ]
    )
    outcome = _device(fake).query(
        task="suzuki",
        candidate_id=7,
        candidate=CONDITION,
        steps=[{"index": 1, "action": "take_sample"}],
    )

    assert outcome == ExecutionOutcome(
        value=88.25, backend=DEVICE, raw={"task_id": "task-001", "response": fake.statuses[-1]}
    )
    assert fake.poll_count == 3
    # The decomposed protocol must reach the instrument, not just the condition.
    assert fake.submitted[0]["steps"] == [{"index": 1, "action": "take_sample"}]
    assert fake.submitted[0]["candidate"] == CONDITION


def test_device_retries_submission_then_succeeds() -> None:
    fake = FakeDevice(submit_failures=2)
    outcome = _device(fake).query(task="suzuki", candidate_id=7, candidate=CONDITION, steps=[])

    assert outcome.value == 91.5
    assert fake.submit_attempts == 3


def test_device_gives_up_after_max_retries() -> None:
    fake = FakeDevice(submit_failures=99)
    with pytest.raises(DeviceExecutionError, match="Could not submit"):
        _device(fake, max_retries=2).query(
            task="suzuki", candidate_id=7, candidate=CONDITION, steps=[]
        )
    assert fake.submit_attempts == 2


def test_device_failure_status_raises() -> None:
    fake = FakeDevice(statuses=[{"status": "failed", "detail": "vial not found"}])
    with pytest.raises(DeviceExecutionError, match="vial not found"):
        _device(fake).query(task="suzuki", candidate_id=7, candidate=CONDITION, steps=[])


def test_device_timeout_raises() -> None:
    fake = FakeDevice(statuses=[{"status": "running"}])
    with pytest.raises(DeviceExecutionError, match="did not finish within"):
        _device(fake, timeout_sec=0.0).query(
            task="suzuki", candidate_id=7, candidate=CONDITION, steps=[]
        )


def test_device_completed_without_objective_raises() -> None:
    fake = FakeDevice(statuses=[{"status": "completed"}])
    with pytest.raises(DeviceExecutionError, match="without a `yield` value"):
        _device(fake).query(task="suzuki", candidate_id=7, candidate=CONDITION, steps=[])


# --------------------------------------------------------------------------- #
# Backend resolution and the no-silent-fallback guarantee
# --------------------------------------------------------------------------- #
def _build(cfg: dict[str, Any], **kwargs: Any):
    return build_execution_backend(
        execution_cfg=cfg,
        candidate_lookup=LOOKUP,
        feature_columns=FEATURES,
        **kwargs,
    )


def test_default_is_table_lookup() -> None:
    backend, resolution = _build({})
    assert backend.name == TABLE_LOOKUP
    assert resolution["resolved_backend"] == TABLE_LOOKUP


def test_device_mode_refuses_to_fall_back(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(DeviceBackend, "is_available", lambda self: False)
    with pytest.raises(RuntimeError, match="Refusing to fall back"):
        _build({"backend": "device", "device": {"base_url": "http://instrument.local"}})


def test_auto_falls_back_when_device_is_unreachable(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(DeviceBackend, "is_available", lambda self: False)
    backend, resolution = _build(
        {"backend": "auto", "device": {"base_url": "http://instrument.local"}}
    )
    assert backend.name == TABLE_LOOKUP
    assert resolution["reason"] == "auto_probe_failed"


def test_auto_uses_device_when_reachable(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(DeviceBackend, "is_available", lambda self: True)
    monkeypatch.setattr(DeviceBackend, "_default_session", staticmethod(lambda: FakeDevice()))
    backend, resolution = _build(
        {"backend": "auto", "device": {"base_url": "http://instrument.local"}}
    )
    assert backend.name == DEVICE
    assert resolution["reason"] == "auto_probe_succeeded"


def test_auto_without_base_url_uses_table() -> None:
    backend, resolution = _build({"backend": "auto"})
    assert backend.name == TABLE_LOOKUP
    assert resolution["reason"] == "auto_no_device_base_url"


def test_cli_override_beats_config(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(DeviceBackend, "is_available", lambda self: True)
    monkeypatch.setattr(DeviceBackend, "_default_session", staticmethod(lambda: FakeDevice()))
    backend, _ = _build(
        {"backend": "table_lookup"},
        backend_override="device",
        device_base_url_override="http://instrument.local",
    )
    assert backend.name == DEVICE


def test_device_without_base_url_is_rejected() -> None:
    with pytest.raises(ValueError, match="base_url is required"):
        _build({"backend": "device"})


def test_unknown_backend_is_rejected() -> None:
    with pytest.raises(ValueError, match="Unsupported execution backend"):
        normalize_backend("teleport")


def test_unknown_device_key_is_rejected() -> None:
    with pytest.raises(ValueError, match="Unknown runtime.execution.device keys"):
        DeviceConfig.from_mapping({"base_url": "x", "poll_interval": 5})


def test_outcome_rejects_non_concrete_backend() -> None:
    with pytest.raises(ValueError, match="must name a concrete backend"):
        ExecutionOutcome(value=1.0, backend="auto")
