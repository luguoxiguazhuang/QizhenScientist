"""Evidence-card storage shared by the launcher and the SciAtlas utilities.

The ask/tell service that once lived here is gone: real experiments are now
driven through the execution backend in :mod:`chem_agent_bo.backends`, so the
launcher is the only entrypoint.
"""

from __future__ import annotations

from chem_agent_bo.lab.evidence import EvidenceCard, EvidenceStore

__all__ = ["EvidenceCard", "EvidenceStore"]
