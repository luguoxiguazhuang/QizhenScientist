"""Execution backends: where an observed objective value comes from.

:class:`~chem_agent_bo.backends.device.DeviceBackend` is the LabVLA interface --
the boundary this launcher hands a SkillNet protocol across to a LabVLA-driven
robotic executor. :class:`~chem_agent_bo.backends.table_lookup.TableLookupBackend`
replays a bundled result table when no instrument is reachable.
"""

from chem_agent_bo.backends.base import (
    AUTO,
    BACKEND_CHOICES,
    DEVICE,
    TABLE_LOOKUP,
    DeviceExecutionError,
    ExecutionBackend,
    ExecutionError,
    ExecutionOutcome,
)
from chem_agent_bo.backends.device import DeviceBackend, DeviceConfig
from chem_agent_bo.backends.registry import (
    DEFAULT_BACKEND,
    build_execution_backend,
    normalize_backend,
)
from chem_agent_bo.backends.table_lookup import TableLookupBackend

__all__ = [
    "AUTO",
    "BACKEND_CHOICES",
    "DEFAULT_BACKEND",
    "DEVICE",
    "TABLE_LOOKUP",
    "DeviceBackend",
    "DeviceConfig",
    "DeviceExecutionError",
    "ExecutionBackend",
    "ExecutionError",
    "ExecutionOutcome",
    "TableLookupBackend",
    "build_execution_backend",
    "normalize_backend",
]
