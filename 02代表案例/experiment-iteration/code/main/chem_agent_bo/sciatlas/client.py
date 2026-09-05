"""Minimal dependency-free client for the hosted SciAtlas search API."""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from typing import Any
import urllib.error
import urllib.request


DEFAULT_BASE_URL = "http://sciatlas.openkg.cn"


@dataclass(frozen=True)
class SciAtlasClientConfig:
    base_url: str
    api_key: str
    timeout_seconds: int = 900

    @classmethod
    def from_environment(cls) -> "SciAtlasClientConfig":
        return cls(
            base_url=str(os.getenv("SCIATLAS_API_BASE_URL") or DEFAULT_BASE_URL).rstrip("/"),
            api_key=str(os.getenv("SCIATLAS_API_KEY") or "").strip(),
            timeout_seconds=int(os.getenv("SCIATLAS_TIMEOUT") or 900),
        )


class SciAtlasClient:
    """Call only the stable paper-search boundary needed by this submission."""

    def __init__(self, config: SciAtlasClientConfig | None = None) -> None:
        self.config = config or SciAtlasClientConfig.from_environment()

    def search(self, request_payload: dict[str, Any]) -> dict[str, Any]:
        if not self.config.api_key:
            raise RuntimeError(
                "SCIATLAS_API_KEY is required to retrieve literature. "
                "Use --response-json to build cards from a previously frozen response."
            )
        request = urllib.request.Request(
            f"{self.config.base_url}/v1/search",
            data=json.dumps(request_payload, ensure_ascii=False).encode("utf-8"),
            headers={
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.config.api_key}",
                "X-API-Key": self.config.api_key,
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=self.config.timeout_seconds) as response:
                raw = response.read().decode("utf-8", errors="replace")
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"SciAtlas API returned HTTP {exc.code}: {detail}") from exc
        except urllib.error.URLError as exc:
            raise RuntimeError(f"Could not reach SciAtlas at {self.config.base_url}: {exc}") from exc
        payload = json.loads(raw) if raw else {}
        if not isinstance(payload, dict):
            raise TypeError("SciAtlas search response must be a JSON object.")
        if payload.get("ok") is False:
            raise RuntimeError(f"SciAtlas search failed: {payload}")
        return payload
