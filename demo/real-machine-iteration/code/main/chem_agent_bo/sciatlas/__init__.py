"""SciAtlas literature retrieval adapter for TRACE evidence cards.

SciAtlas is intentionally kept outside the online controller loop.  The
adapter retrieves and freezes literature artifacts before an optimization run;
TRACE then consumes the resulting cards through its existing EvidenceStore.
"""

from .client import SciAtlasClient, SciAtlasClientConfig
from .evidence_builder import build_evidence_cards, extract_ranked_papers
from .leakage_guard import EvidenceSafetyReport, sanitize_paper
from .provenance import validate_sciatlas_evidence_bundle
from .schema import SciAtlasTaskProfile, load_sciatlas_config

__all__ = [
    "EvidenceSafetyReport",
    "SciAtlasClient",
    "SciAtlasClientConfig",
    "SciAtlasTaskProfile",
    "build_evidence_cards",
    "extract_ranked_papers",
    "load_sciatlas_config",
    "sanitize_paper",
    "validate_sciatlas_evidence_bundle",
]
