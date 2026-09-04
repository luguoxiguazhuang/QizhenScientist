"""Resolve `runtime.execution` config into a concrete execution backend."""

from __future__ import annotations

import logging
from typing import Any

from chem_agent_bo.backends.base import (
    AUTO,
    BACKEND_CHOICES,
    DEVICE,
    TABLE_LOOKUP,
    ExecutionBackend,
)
from chem_agent_bo.backends.device import DeviceBackend, DeviceConfig
from chem_agent_bo.backends.table_lookup import TableLookupBackend

LOGGER = logging.getLogger(__name__)

DEFAULT_BACKEND = TABLE_LOOKUP


def normalize_backend(raw: str | None) -> str:
    backend = str(raw or DEFAULT_BACKEND).strip().lower() or DEFAULT_BACKEND
    if backend not in BACKEND_CHOICES:
        raise ValueError(
            f"Unsupported execution backend `{raw}`. Use one of: {', '.join(BACKEND_CHOICES)}."
        )
    return backend


def build_execution_backend(
    *,
    execution_cfg: dict[str, Any] | None,
    candidate_lookup: dict[tuple[str, ...], dict[str, Any]],
    feature_columns: list[str],
    backend_override: str | None = None,
    device_base_url_override: str | None = None,
) -> tuple[ExecutionBackend, dict[str, Any]]:
    """Build the backend for this run and describe how it was resolved.

    ``auto`` probes the instrument exactly once, here, so a single run never
    mixes measured and replayed values across rounds.
    """

    config = dict(execution_cfg or {})
    requested = normalize_backend(backend_override or config.get("backend"))

    device_cfg = DeviceConfig.from_mapping(config.get("device"))
    if str(device_base_url_override or "").strip():
        device_cfg.base_url = str(device_base_url_override).strip()

    table_backend = TableLookupBackend(
        candidate_lookup, feature_columns=feature_columns
    )
    resolution: dict[str, Any] = {"requested_backend": requested}

    if requested == TABLE_LOOKUP:
        resolution.update(resolved_backend=TABLE_LOOKUP, reason="configured")
        return table_backend, resolution

    if requested == DEVICE:
        device = DeviceBackend(device_cfg)
        if not device.is_available():
            raise RuntimeError(
                "Execution backend is `device` but the instrument at "
                f"{device_cfg.base_url} is not reachable. Refusing to fall back to the "
                "result table: that would record replayed values as measurements. "
                "Use backend `auto` if a substitute is acceptable."
            )
        resolution.update(
            resolved_backend=DEVICE, reason="configured", device_base_url=device_cfg.base_url
        )
        return device, resolution

    # auto: prefer the instrument, fall back once, and say so loudly.
    if str(device_cfg.base_url or "").strip():
        device = DeviceBackend(device_cfg)
        if device.is_available():
            resolution.update(
                resolved_backend=DEVICE,
                reason="auto_probe_succeeded",
                device_base_url=device_cfg.base_url,
            )
            return device, resolution
        reason = "auto_probe_failed"
    else:
        reason = "auto_no_device_base_url"

    LOGGER.warning(
        "Instrument unavailable (%s); this run uses the bundled result table. "
        "Observations will be labelled `%s`.",
        reason,
        TABLE_LOOKUP,
    )
    resolution.update(resolved_backend=TABLE_LOOKUP, reason=reason)
    return table_backend, resolution
