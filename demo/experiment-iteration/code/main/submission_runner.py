"""Submission runtime implementation for TRACE competition replay.

Run from the submission root:

    python code/scripts/run.py suzuki

This module contains the full replay implementation used by the submission
launcher:
1. preload the labeled ``*_train.csv`` rows as initial observations,
2. let the chosen planner propose from ``*_test_features.csv``,
3. for `qizhen_scientist`, route the shortlist through the LLM controller,
4. query the public ``*_test.csv`` oracle for local reproducibility, and
5. append the measured result back into history for the next round.
"""

from __future__ import annotations

import argparse
from datetime import datetime, timezone
import hashlib
import json
import math
import os
import random
from dataclasses import dataclass
from pathlib import Path
import sys
from typing import Any, Callable

MAIN_ROOT = Path(__file__).resolve().parent
SUBMISSION_CODE_ROOT = MAIN_ROOT.parent
SUBMISSION_ROOT = SUBMISSION_CODE_ROOT.parent
PROJECT_ROOT = SUBMISSION_ROOT
for extra_path in (MAIN_ROOT, SUBMISSION_CODE_ROOT):
    if str(extra_path) not in sys.path:
        sys.path.insert(0, str(extra_path))
DEFAULT_SUBMISSION_CONFIG = SUBMISSION_CODE_ROOT / "config" / "config.yaml"
DEFAULT_OUTPUT_ROOT = SUBMISSION_ROOT / "results" / "project"
DEFAULT_LOG_ROOT = SUBMISSION_ROOT / "logs"
VENDOR_DIR = MAIN_ROOT / ".vendor_py"
if VENDOR_DIR.exists() and str(VENDOR_DIR) not in sys.path:
    sys.path.append(str(VENDOR_DIR))

try:
    import matplotlib.pyplot as _plt
    from matplotlib import colormaps as _mpl_colormaps

    if not hasattr(_plt, "register_cmap"):
        def _register_cmap(*args: Any, **kwargs: Any) -> None:
            cmap = kwargs.get("cmap")
            if cmap is None and args:
                cmap = args[-1]
            if cmap is not None:
                _mpl_colormaps.register(cmap)

        _plt.register_cmap = _register_cmap  # type: ignore[attr-defined]
except Exception:
    pass

import pandas as pd
import torch
from dotenv import load_dotenv
from olympus.campaigns import Campaign, ParameterSpace
from olympus.objects import ParameterContinuous, ParameterVector

try:
    from olympus.objects import ParameterCategorical
except ImportError:  # pragma: no cover
    from olympus.objects import Parameter as _OlympusParameter

    def ParameterCategorical(*, name: str, options: list[str]):  # type: ignore[misc]
        return _OlympusParameter(kind="categorical", name=name, options=options)

from chem_agent_bo.backends import (
    BACKEND_CHOICES,
    DEFAULT_BACKEND,
    DEVICE,
    ExecutionBackend,
    build_execution_backend,
)
from chem_agent_bo.bo.registry import build_planner, planner_choices
from chem_agent_bo.config.loader import load_agentic_bo_config
from chem_agent_bo.experiment_core import set_global_seed
from chem_agent_bo.lab.evidence import EvidenceCard, EvidenceStore
from chem_agent_bo.runtime import (
    ActionCapabilityPolicy,
    ControllerRuntime,
    ControllerRuntimeConfig,
)
from chem_agent_bo.sciatlas.provenance import validate_sciatlas_evidence_bundle
from chem_agent_bo.steps import build_steps_for_task, steps_to_payload
from chem_agent_bo.utils.run_io import capture_third_party_output
from task_registry import TASKS as ENTRY_TASKS
from task_registry import normalize_task

load_dotenv(SUBMISSION_ROOT / ".env", override=False)


DEFAULT_SEEDS = tuple(range(100, 2001, 100))
QIZHEN_MODE = "qizhen_scientist"
BASELINE_MODE = "atlas_baseline"
CONTROLLER_MODES: tuple[str, ...] = (QIZHEN_MODE, BASELINE_MODE)
QIZHEN_METHOD_NAME = QIZHEN_MODE
QIZHEN_METHOD_FAMILY = QIZHEN_MODE
QIZHEN_METHOD_DIR = QIZHEN_MODE
BASELINE_METHOD_NAME = BASELINE_MODE
BASELINE_METHOD_FAMILY = BASELINE_MODE
BASELINE_METHOD_DIR = BASELINE_MODE
DEFAULT_AGENTIC_CONFIG = MAIN_ROOT / "configs" / "agent_bo_suzuki.yaml"
DEFAULT_BATCH_SIZE = 1
BASELINE_SEEDED_RANDOM_STEPS = 3
BASELINE_SEEDED_TOP_K = 5
EARLY_SEEDED_SHORTLIST_SIZE = 20
MAIN_LOG_PATH: Path | None = None
COMPETITION_EVIDENCE_TARGET_NODES = (
    "design_init_experiments",
    "stagnation_diagnosis",
    "hypothesis_action",
    "semantic_assessment",
    "verification_pass",
    "reflection_action",
    "lab_batch_composition",
    "shortlist_rerank",
)


@dataclass(frozen=True)
class TaskProfile:
    reaction_scope: str
    key_dimensions: tuple[str, ...]


TASK_PROFILES = {
    "suzuki": TaskProfile(
        reaction_scope="suzuki-miyaura cross-coupling",
        key_dimensions=("Electrophile", "Nucleophile", "Ligand"),
    ),
}


@dataclass(frozen=True)
class TaskFiles:
    dataset_name: str
    task_dir: Path
    train_csv: Path
    test_csv: Path
    test_features_csv: Path
    searchspace_csv: Path | None
    options_json: Path | None


@dataclass
class TaskBundle:
    dataset_name: str
    feature_columns: list[str]
    target_column: str
    train_df: pd.DataFrame
    test_df: pd.DataFrame
    test_features_df: pd.DataFrame
    searchspace_df: pd.DataFrame | None
    param_space: ParameterSpace
    value_space: ParameterSpace
    candidate_lookup: dict[tuple[str, ...], dict[str, Any]]
    valid_values_per_col: dict[str, list[str]]
    reaction_scope: str
    key_dimensions: list[str]


class CompetitionFinitePoolEnv:
    """Minimal env surface expected by the existing planner registry."""

    def __init__(self, *, param_space: ParameterSpace, value_space: ParameterSpace, goal: str) -> None:
        self.param_space = param_space
        self.value_space = value_space
        self.goal = goal
        self.is_finite_pool = True


def normalize_controller_mode(raw: str) -> str:
    mode = str(raw or QIZHEN_MODE).strip().lower() or QIZHEN_MODE
    if mode not in CONTROLLER_MODES:
        raise ValueError(
            f"Unsupported controller mode `{raw}`. "
            f"Use `{QIZHEN_MODE}` or `{BASELINE_MODE}`."
        )
    return mode


def is_qizhen_mode(controller_mode: str) -> bool:
    """Whether this mode runs the LLM controller on top of the planner."""

    return normalize_controller_mode(controller_mode) == QIZHEN_MODE


def method_identity(controller_mode: str) -> tuple[str, str, str]:
    mode = normalize_controller_mode(controller_mode)
    if mode == BASELINE_MODE:
        return BASELINE_METHOD_NAME, BASELINE_METHOD_FAMILY, BASELINE_METHOD_DIR
    return QIZHEN_METHOD_NAME, QIZHEN_METHOD_FAMILY, QIZHEN_METHOD_DIR


def history_mode_for(backend_name: str) -> str:
    """Describe how observations were obtained, for the persisted payload."""

    if str(backend_name) == DEVICE:
        return "train_prior_then_instrument_feedback"
    return "train_prior_then_result_table_feedback"



def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def local_now() -> str:
    return datetime.now().astimezone().strftime("%Y-%m-%d %H:%M:%S %z")


def tprint(message: str) -> None:
    line = f"[{local_now()}] {message}"
    print(line, flush=True)
    if MAIN_LOG_PATH is not None:
        MAIN_LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
        with MAIN_LOG_PATH.open("a", encoding="utf-8") as handle:
            handle.write(line + "\n")


def timestamp_slug() -> str:
    return datetime.now().astimezone().strftime("%Y%m%d_%H%M%S")


def load_submission_runtime(path: str | Path) -> dict[str, Any]:
    import yaml

    with Path(path).open("r", encoding="utf-8") as handle:
        payload = yaml.safe_load(handle) or {}
    if not isinstance(payload, dict):
        raise TypeError("Submission config must be a mapping.")
    runtime = payload.get("runtime") or {}
    if not isinstance(runtime, dict):
        raise TypeError("Submission config runtime section must be a mapping.")
    return runtime


def resolve_path(raw: str | Path) -> Path:
    path = Path(raw)
    return path if path.is_absolute() else (PROJECT_ROOT / path).resolve()


def write_json_atomic(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary_path = path.with_suffix(path.suffix + ".tmp")
    temporary_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    temporary_path.replace(path)


def save_torch_atomic(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary_path = path.with_suffix(path.suffix + ".tmp")
    torch.save(payload, temporary_path)
    temporary_path.replace(path)


def append_jsonl(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(payload, ensure_ascii=False) + "\n")


def detail_log_path() -> Path | None:
    raw = str(os.getenv("TRACE_AGENT_DETAILED_LOG_PATH", "") or "").strip()
    if not raw:
        return None
    return Path(raw)


def append_detail_log(event: str, **payload: Any) -> None:
    path = detail_log_path()
    if path is None:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    record = {"ts": utc_now(), "event": event, **payload}
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(record, ensure_ascii=False) + "\n")


def detail_log_path_string() -> str:
    path = detail_log_path()
    return "" if path is None else str(path)


def third_party_log_path_for_seed(
    *,
    checkpoint_path: Path | None,
    progress_path: Path | None,
    seed: int,
) -> Path | None:
    anchor = checkpoint_path or progress_path
    if anchor is None:
        return None
    return anchor.parent / f"third_party_seed_{int(seed)}.log"


def default_seed_detail_log_path(*, output_dir: Path, seed: int) -> Path:
    return output_dir / f"run_detail_seed_{int(seed)}.jsonl"


def make_seed_state(
    *,
    output_dir: Path,
    seed: int,
    budget: int,
    batch_size: int,
) -> dict[str, Any]:
    total_rounds = math.ceil(int(budget) / max(1, int(batch_size)))
    return {
        "seed": int(seed),
        "status": "pending",
        "updated_at": "",
        "updated_at_local": "",
        "started_at": "",
        "completed_at": "",
        "last_event": "",
        "last_event_at": "",
        "current_operation": "",
        "current_round": 0,
        "completed_rounds": 0,
        "total_rounds": int(total_rounds),
        "completed_queries": 0,
        "total_queries": int(budget),
        "batch_size": int(batch_size),
        "best_so_far": None,
        "progress_path": str(output_dir / f"progress_seed_{int(seed)}.json"),
        "detail_log_path": str(default_seed_detail_log_path(output_dir=output_dir, seed=seed)),
        "checkpoint_path": str(output_dir / f"checkpoint_seed_{int(seed)}.pt"),
        "result_path": str(output_dir / f"seed_{int(seed)}.pt"),
    }


def write_overall_progress(
    path: Path,
    *,
    dataset: str,
    planner: str,
    controller_mode: str,
    output_dir: Path,
    seed_states: dict[str, dict[str, Any]],
    overall_status: str,
    active_seed: int | None = None,
    note: str = "",
    summary_path: str = "",
) -> None:
    states = list(seed_states.values())
    completed = [int(item["seed"]) for item in states if item.get("status") == "completed"]
    failed = [int(item["seed"]) for item in states if item.get("status") == "failed"]
    running = [int(item["seed"]) for item in states if item.get("status") == "running"]
    pending = [int(item["seed"]) for item in states if item.get("status") == "pending"]
    payload = {
        "status": overall_status,
        "updated_at": utc_now(),
        "updated_at_local": local_now(),
        "dataset": dataset,
        "planner": planner,
        "controller_mode": controller_mode,
        "output_dir": str(output_dir),
        "active_seed": None if active_seed is None else int(active_seed),
        "total_seed_count": len(states),
        "completed_seed_count": len(completed),
        "failed_seed_count": len(failed),
        "running_seed_count": len(running),
        "pending_seed_count": len(pending),
        "completed_seeds": completed,
        "failed_seeds": failed,
        "running_seeds": running,
        "pending_seeds": pending,
        "note": note,
        "summary_path": summary_path,
        "seed_statuses": sorted(states, key=lambda item: int(item["seed"])),
    }
    write_json_atomic(path, payload)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Run one TRACE competition replay task through the submission entrypoint.",
    )
    parser.add_argument(
        "task",
        choices=tuple(ENTRY_TASKS),
        help="Task alias. Use `suzuki`.",
    )
    parser.add_argument(
        "--config",
        default=str(DEFAULT_SUBMISSION_CONFIG),
        help="Submission runtime config YAML.",
    )
    parser.add_argument(
        "--dataset-root",
        default=None,
        help="Optional dataset root override. Defaults to the submission config.",
    )
    parser.add_argument(
        "--bayesian_method",
        choices=planner_choices(),
        default=None,
        help="Backbone BO planner override. Defaults to the submission config.",
    )
    parser.add_argument(
        "--agentic-config",
        default=None,
        help="Controller config override. Defaults to the submission config.",
    )
    parser.add_argument(
        "--controller-mode",
        choices=CONTROLLER_MODES,
        default=None,
        help="Controller mode override. Defaults to the submission config.",
    )
    parser.add_argument(
        "--execution-backend",
        choices=BACKEND_CHOICES,
        default=None,
        help=(
            "Where observed yields come from. `device` requires a reachable "
            "instrument and never falls back; `auto` probes once and substitutes "
            "the result table if the instrument is down; `table_lookup` always "
            "replays the bundled table. Defaults to the submission config."
        ),
    )
    parser.add_argument(
        "--device-base-url",
        default="",
        help="Instrument endpoint, overriding runtime.execution.device.base_url.",
    )
    parser.add_argument(
        "--evidence-cards",
        default="",
        help=(
            "Knowledge prior for `qizhen_scientist`: an evidence_cards.jsonl or .csv "
            "file. Defaults to runtime.evidence_paths for the task."
        ),
    )
    parser.add_argument(
        "--sciatlas-manifest",
        default="",
        help="Frozen SciAtlas manifest. Defaults to manifest.json beside the evidence cards.",
    )
    parser.add_argument(
        "--allow-unreviewed-sciatlas-evidence",
        action="store_true",
        help="Permit pending evidence for smoke tests only; formal runs require approved review status.",
    )
    parser.add_argument(
        "--reaction-scope",
        default="",
        help="Optional override for the hard-coded coupling reaction scope.",
    )
    parser.add_argument(
        "--evidence-top-k",
        type=int,
        default=10,
        help="Maximum number of applicable evidence cards to load.",
    )
    parser.add_argument(
        "--shortlist-size",
        type=int,
        default=None,
        help="Planner shortlist size override. Defaults to the submission config.",
    )
    parser.add_argument(
        "--goal",
        choices=("maximize", "minimize"),
        default="maximize",
        help="Objective direction. Competition public datasets use `maximize`.",
    )
    parser.add_argument(
        "--rounds",
        type=int,
        default=None,
        help="Total number of queried points per seed. Defaults to the submission config.",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=None,
        help="Number of ordered candidates queried per controller round. Defaults to the submission config.",
    )
    parser.add_argument(
        "--seeds",
        type=int,
        nargs="*",
        default=None,
        help="Seed list override. Defaults to the submission config.",
    )
    parser.add_argument(
        "--output-root",
        default=None,
        help="Root directory where seed folders are written. Defaults to the submission config.",
    )
    parser.add_argument(
        "--logs-root",
        default=None,
        help="Root directory for cleaned `.log` files. Defaults to the submission config.",
    )
    parser.add_argument(
        "--no-resume",
        action="store_true",
        help="Ignore an existing per-seed checkpoint and start that seed again.",
    )
    return parser


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    return build_parser().parse_args(argv)


def resolve_task_files(dataset_root: str | Path, task_name: str) -> TaskFiles:
    task_dir = Path(dataset_root) / task_name
    if not task_dir.exists():
        raise FileNotFoundError(f"Task directory not found: {task_dir}")
    train_csv = _single_match(task_dir, "*_train.csv")
    test_csv = _single_match(task_dir, "*_test.csv")
    test_features_csv = _single_match(task_dir, "*_test_features.csv")
    searchspace_matches = sorted(task_dir.glob("*_searchspace.csv"))
    searchspace_csv = searchspace_matches[0] if searchspace_matches else None
    options_matches = sorted(task_dir.glob("options.json"))
    options_json = options_matches[0] if options_matches else None
    return TaskFiles(
        dataset_name=task_dir.name,
        task_dir=task_dir,
        train_csv=train_csv,
        test_csv=test_csv,
        test_features_csv=test_features_csv,
        searchspace_csv=searchspace_csv,
        options_json=options_json,
    )


def _single_match(task_dir: Path, pattern: str) -> Path:
    matches = sorted(task_dir.glob(pattern))
    if len(matches) != 1:
        raise FileNotFoundError(
            f"Expected exactly one `{pattern}` under {task_dir}, found {len(matches)}."
        )
    return matches[0]


def load_task_bundle(files: TaskFiles, *, reaction_scope_override: str = "") -> TaskBundle:
    train_df = pd.read_csv(files.train_csv)
    test_df = pd.read_csv(files.test_csv)
    test_features_df = pd.read_csv(files.test_features_csv)
    searchspace_df = None

    if list(test_df.columns[:-1]) != list(test_features_df.columns):
        raise ValueError(
            "Expected test.csv to match test_features.csv plus one target column at the end."
        )
    target_candidates = [col for col in test_df.columns if col not in test_features_df.columns]
    if len(target_candidates) != 1:
        raise ValueError(
            f"Could not infer a single target column from {files.test_csv}. Found: {target_candidates}"
        )
    target_column = target_candidates[0]
    feature_columns = list(test_features_df.columns)

    _ensure_columns(train_df, feature_columns + [target_column], files.train_csv)
    _ensure_columns(test_df, feature_columns + [target_column], files.test_csv)

    task_profile = TASK_PROFILES.get(files.dataset_name.lower())
    reaction_scope = reaction_scope_override.strip() or (
        task_profile.reaction_scope if task_profile is not None else files.dataset_name
    )
    key_dimensions = [
        name
        for name in (
            list(task_profile.key_dimensions) if task_profile is not None else feature_columns[:3]
        )
        if name in feature_columns
    ]
    if not key_dimensions:
        key_dimensions = list(feature_columns[: min(3, len(feature_columns))])

    valid_value_frames = [train_df[feature_columns], test_features_df[feature_columns]]
    valid_values_source = pd.concat(valid_value_frames, ignore_index=True)
    valid_values_per_col = {
        col: _ordered_unique(valid_values_source[col].astype(str).tolist())
        for col in feature_columns
    }

    param_space = ParameterSpace()
    for col in feature_columns:
        param_space.add(ParameterCategorical(name=col, options=valid_values_per_col[col]))

    train_target = train_df[target_column].astype(float)
    test_target = (
        pd.to_numeric(test_df[target_column], errors="coerce")
        if target_column in test_df.columns
        else pd.Series(dtype=float)
    )
    value_low = float(train_target.min())
    if test_target.dropna().empty:
        value_high = 100.0
    else:
        value_high = float(pd.concat([train_target, test_target.dropna()], ignore_index=True).max())
    value_high = max(value_high, value_low)
    value_space = ParameterSpace()
    value_space.add(
        ParameterContinuous(
            name=target_column,
            low=value_low,
            high=value_high,
        )
    )

    candidate_lookup: dict[tuple[str, ...], dict[str, Any]] = {}
    for query_index, row in test_df.iterrows():
        key = row_to_key(row, feature_columns)
        if key in candidate_lookup:
            raise ValueError(
                "Duplicate candidate rows detected in the test candidate pool. "
                f"First duplicate key: {key}"
            )
        candidate_lookup[key] = {
            "query_index": int(query_index),
            "condition": {col: str(row[col]) for col in feature_columns},
            "observed_yield": float(row[target_column]),
        }

    return TaskBundle(
        dataset_name=files.dataset_name,
        feature_columns=feature_columns,
        target_column=target_column,
        train_df=train_df,
        test_df=test_df,
        test_features_df=test_features_df,
        searchspace_df=searchspace_df,
        param_space=param_space,
        value_space=value_space,
        candidate_lookup=candidate_lookup,
        valid_values_per_col=valid_values_per_col,
        reaction_scope=reaction_scope,
        key_dimensions=key_dimensions,
    )


def _ensure_columns(df: pd.DataFrame, required_columns: list[str], source_path: Path) -> None:
    missing = [col for col in required_columns if col not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns in {source_path}: {missing}")


def _ordered_unique(values: list[str]) -> list[str]:
    seen: set[str] = set()
    ordered: list[str] = []
    for value in values:
        text = str(value)
        if text in seen:
            continue
        seen.add(text)
        ordered.append(text)
    return ordered


def row_to_key(row: pd.Series | dict[str, Any], feature_columns: list[str]) -> tuple[str, ...]:
    return tuple(str(row[col]) for col in feature_columns)


def row_to_condition(row: pd.Series | dict[str, Any], feature_columns: list[str]) -> dict[str, str]:
    return {col: str(row[col]) for col in feature_columns}


def candidate_to_dict(sample: Any, param_space: ParameterSpace) -> dict[str, str]:
    if hasattr(sample, "to_dict"):
        try:
            raw = sample.to_dict()
            return {param.name: str(raw[param.name]) for param in param_space}
        except Exception:  # noqa: BLE001
            pass
    if isinstance(sample, dict):
        return {param.name: str(sample[param.name]) for param in param_space}
    return {param.name: str(getattr(sample, param.name)) for param in param_space}


def build_empty_campaign(bundle: TaskBundle) -> Campaign:
    campaign = Campaign()
    campaign.set_param_space(bundle.param_space)
    campaign.set_value_space(bundle.value_space)
    return campaign


def initialize_campaign_from_train(
    bundle: TaskBundle,
    *,
    goal: str,
) -> tuple[Campaign, list[dict[str, Any]], list[dict[str, Any]], float | None]:
    campaign = build_empty_campaign(bundle)
    history: list[dict[str, Any]] = []
    train_prior: list[dict[str, Any]] = []
    current_best: float | None = None
    context_columns = [
        col for col in bundle.train_df.columns
        if col not in set(bundle.feature_columns + [bundle.target_column])
    ]
    for offset, (_, row) in enumerate(bundle.train_df.iterrows(), start=1):
        candidate = row_to_condition(row, bundle.feature_columns)
        observed_yield = float(row[bundle.target_column])
        vector = ParameterVector().from_dict(candidate, param_space=bundle.param_space)
        campaign.add_observation(vector, observed_yield)
        history_entry = build_history_entry(
            iteration=offset,
            candidate=candidate,
            result=observed_yield,
            goal=goal,
            variable_names=bundle.feature_columns,
            previous_best=current_best,
            stage="train_prior",
            trigger_reasons=["competition_initial_prior"],
            controller_mode="competition_train_prior",
            intervention_type="train_prior",
            observation_origin="train_csv",
            context_conditions={col: str(row[col]) for col in context_columns},
        )
        history.append(history_entry)
        current_best = float(history_entry["best_result"])
        train_prior.append(
            {
                "prior_index": offset,
                "condition": dict(candidate),
                "observed_yield": observed_yield,
                "best_so_far": current_best,
                "context_conditions": dict(history_entry.get("context_conditions") or {}),
            }
        )
    return campaign, history, train_prior, current_best


def build_constraint(
    feature_columns: list[str],
    allowed_keys: set[tuple[str, ...]],
):
    allowed = set(allowed_keys)

    def _constraint(values: Any) -> bool:
        if hasattr(values, "to_dict"):
            try:
                data = values.to_dict()
            except Exception:  # noqa: BLE001
                data = {name: getattr(values, name) for name in feature_columns}
        elif isinstance(values, dict):
            data = values
        elif hasattr(values, "tolist"):
            raw = values.tolist()
            if raw and isinstance(raw[0], list):
                raw = raw[0]
            data = {
                name: raw[index] if index < len(raw) else ""
                for index, name in enumerate(feature_columns)
            }
        elif isinstance(values, (list, tuple)):
            data = {
                name: values[index] if index < len(values) else ""
                for index, name in enumerate(feature_columns)
            }
        else:
            data = {name: getattr(values, name) for name in feature_columns}
        key = tuple(str(data[name]) for name in feature_columns)
        return key in allowed

    return _constraint


def allowed_keys_signature(allowed_keys: set[tuple[str, ...]]) -> str:
    ordered = sorted(allowed_keys)
    return f"{len(ordered)}:{'|'.join('/'.join(key) for key in ordered[:16])}"


def best_value(values: list[float], goal: str) -> float:
    return min(values) if goal == "minimize" else max(values)


def reached_threshold(current: float, threshold: float, goal: str) -> bool:
    return current <= threshold if goal == "minimize" else current >= threshold


def build_search_space_meta(
    bundle: TaskBundle,
    *,
    remaining_keys: set[tuple[str, ...]],
) -> dict[str, Any]:
    return {
        "dataset_name": bundle.dataset_name,
        "backend": "competition_dataset_oracle",
        "feature_columns": list(bundle.feature_columns),
        "condition_columns": list(bundle.feature_columns),
        "valid_values_per_col": dict(bundle.valid_values_per_col),
        "continuous_ranges": {},
        "fixed_conditions": {},
        "controlled_conditions": {},
        "static_conditions": {},
        "descriptor_status": {
            "controller_metadata_enabled": False,
            "candidate_descriptor_profiles_enabled": False,
            "planner_descriptor_mode": "disabled",
            "planner_descriptor_reason": "Competition coupling runner keeps descriptors off.",
        },
        "descriptor_overview": {},
        "stages": [],
        "key_dimensions": list(bundle.key_dimensions),
        "scaffold_dims": list(bundle.key_dimensions),
        "candidate_count": int(len(bundle.candidate_lookup)),
        "candidate_pool_remaining": int(len(remaining_keys)),
        "oracle_evaluation_disabled": False,
    }


def build_reaction_context(bundle: TaskBundle, *, goal: str) -> dict[str, Any]:
    return {
        "dataset": bundle.dataset_name,
        "reaction_type": bundle.reaction_scope,
        "objective": bundle.target_column,
        "goal": goal,
        "backend": "competition_dataset_oracle",
    }


def build_evidence_knowledge_units(cards: list[EvidenceCard]) -> list[dict[str, Any]]:
    knowledge_units: list[dict[str, Any]] = []
    for rank, card in enumerate(cards, start=1):
        parts = [
            str(card.summary or "").strip(),
            str(card.supporting_excerpt or "").strip(),
            str(card.transferability_note or "").strip(),
            str(card.notes or "").strip(),
        ]
        content = " | ".join(part for part in parts if part)
        if not content:
            continue
        knowledge_units.append(
            {
                "id": str(card.card_id),
                "content": content,
                "source_type": "evidence_card",
                "evidence_source_type": str(card.source_type or "literature"),
                "source": str(card.source or ""),
                "source_path": str(card.source_path or ""),
                "doi": str(card.doi or ""),
                "confidence": max(0.1, 1.0 - ((rank - 1) * 0.1)),
                "score": float(len(cards) - rank + 1),
            }
        )
    return knowledge_units


def build_evidence_trace(
    *,
    cards: list[EvidenceCard],
    bundle: TaskBundle,
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    units = build_evidence_knowledge_units(cards)
    source_types = sorted({str(card.source_type or "literature") for card in cards})
    meta = {
        "knowledge_source": (
            "sciatlas_frozen_literature"
            if source_types == ["sciatlas_literature"]
            else "evidence_cards"
        ),
        "knowledge_count": int(len(units)),
        "query": bundle.reaction_scope,
        "reaction_scope": bundle.reaction_scope,
        "variables": list(bundle.feature_columns),
        "target_nodes": list(COMPETITION_EVIDENCE_TARGET_NODES),
        "retrieved_card_ids": [card.card_id for card in cards if card.card_id],
        "source_types": source_types,
        "retrieved_units": units,
    }
    return units, meta


def build_candidate_pool(shortlist: list[dict[str, str]]) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    seen: set[tuple[tuple[str, str], ...]] = set()
    for candidate in shortlist:
        signature = tuple(sorted((key, str(value)) for key, value in candidate.items()))
        if signature in seen:
            continue
        seen.add(signature)
        index = len(items)
        items.append(
            {
                "candidate_index": index,
                "bo_rank": index + 1,
                "main_pool_rank": index + 1,
                "is_main_bo_top1": index == 0,
                "shortlist_source": "planner_shortlist",
                "pool_source": "main_pool",
                "candidate": dict(candidate),
            }
        )
    return items


def diversify_candidate_pool(
    candidate_pool: list[dict[str, Any]],
    *,
    seed: int,
    step: int,
    frontier_size: int,
) -> list[dict[str, Any]]:
    if len(candidate_pool) <= 1 or frontier_size <= 1:
        return candidate_pool
    limit = min(len(candidate_pool), int(frontier_size))
    derived_seed = (
        (int(seed) * 1_000_003)
        + (int(step) * 10_007)
        + limit
    )
    reordered = list(candidate_pool[:limit])
    random.Random(derived_seed).shuffle(reordered)
    reordered.extend(candidate_pool[limit:])
    normalized: list[dict[str, Any]] = []
    for index, item in enumerate(reordered):
        updated = dict(item)
        updated["candidate_index"] = index
        updated["bo_rank"] = index + 1
        updated["main_pool_rank"] = index + 1
        updated["is_main_bo_top1"] = index == 0
        normalized.append(updated)
    return normalized


def build_history_entry(
    *,
    iteration: int,
    candidate: dict[str, str],
    result: float,
    goal: str,
    variable_names: list[str],
    previous_best: float | None,
    reflection_action: dict[str, Any] | None = None,
    stage: str = "lab_observation",
    trigger_reasons: list[str] | None = None,
    controller_mode: str = "lab_tell",
    intervention_type: str = "lab_tell",
    observation_origin: str = "",
    context_conditions: dict[str, str] | None = None,
) -> dict[str, Any]:
    improved = previous_best is None or (
        result < previous_best if goal == "minimize" else result > previous_best
    )
    best_result = result if previous_best is None else best_value([previous_best, result], goal)
    entry = {
        "iteration": int(iteration),
        "stage": stage,
        "trigger_reasons": list(trigger_reasons or ["lab_measured_result"]),
        "controller_mode": controller_mode,
        "intervention_type": intervention_type,
        "subspace_active": False,
        "active_variables": list(variable_names),
        "candidate": dict(candidate),
        "result": float(result),
        "improved_best": bool(improved),
        "best_result": float(best_result),
        "feasibility_action": "accept",
        "observation_origin": observation_origin,
    }
    if context_conditions:
        entry["context_conditions"] = dict(context_conditions)
    if reflection_action is not None:
        entry["reflection_action"] = reflection_action
    return entry


def build_recommendation_reason(
    *,
    controller_mode: str,
    planner_name: str,
    decision: Any | None,
    semantic_assessment: dict[str, Any] | None,
    selection_policy: str = "planner_top1",
    planner_rank: int = 1,
) -> str:
    if controller_mode == BASELINE_MODE:
        if selection_policy == "planner_top1":
            return (
                f"{planner_name} planner top-1 candidate executed directly in "
                f"{BASELINE_MODE} mode."
            )
        return (
            f"{planner_name} planner shortlist sampled in {BASELINE_MODE} mode "
            f"via `{selection_policy}`, "
            f"executing planner rank {int(planner_rank)}."
        )
    pieces: list[str] = []
    if decision is not None:
        reasoning = str((decision.controller_plan or {}).get("reasoning") or "").strip()
        if reasoning:
            pieces.append(reasoning)
        executed_action = str((decision.action_package or {}).get("executed_execution_action") or "").strip()
        if executed_action:
            pieces.append(f"executed_action={executed_action}")
    if semantic_assessment:
        soft_comment = str(semantic_assessment.get("soft_comment") or "").strip()
        if soft_comment:
            pieces.append(soft_comment)
    if not pieces:
        return f"{planner_name} shortlist evaluated in {controller_mode} mode."
    return " | ".join(pieces)


def build_submission_record(
    *,
    step: int,
    round_number: int,
    recommendation_rank: int,
    record: dict[str, Any],
    observed_yield: float,
    best_so_far: float,
    planner_name: str,
    controller_mode: str,
    decision: Any | None,
    recommendation_reason: str,
    planner_rank: int = 1,
) -> dict[str, Any]:
    action_package = decision.action_package if decision is not None else {}
    return {
        "step": int(step),
        "round": int(round_number),
        "batch_round": int(round_number),
        "recommendation_rank": int(recommendation_rank),
        "query_index": int(record["query_index"]),
        "candidate_index": int(record["query_index"]),
        "candidate_id": int(record["query_index"]),
        "condition": dict(record["condition"]),
        "actual_yield": float(observed_yield),
        "observed_yield": float(observed_yield),
        "observed_value": float(observed_yield),
        "predicted_yield": None,
        "best_so_far": float(best_so_far),
        "planner_name": planner_name,
        "controller_mode": controller_mode,
        "executed_action": str(action_package.get("executed_execution_action") or "direct_bo_pick"),
        "planner_rank": int(planner_rank),
        "model_prediction": None,
        "predictive_uncertainty": None,
        "acquisition_value": None,
        "recommendation_reason": recommendation_reason,
    }


def _sample_std(values: list[float]) -> float:
    if len(values) <= 1:
        return 0.0
    mean_value = float(sum(values) / len(values))
    variance = sum((value - mean_value) ** 2 for value in values) / (len(values) - 1)
    return float(math.sqrt(variance))


def summarize_metric(values: list[float]) -> dict[str, float]:
    mean_value = float(sum(values) / len(values))
    std_value = _sample_std(values)
    ci_half_width = 1.96 * std_value / math.sqrt(len(values)) if values else 0.0
    return {
        "mean": mean_value,
        "std": float(std_value),
        "ci95_low": float(mean_value - ci_half_width),
        "ci95_high": float(mean_value + ci_half_width),
    }


def validate_seed_payload(
    *,
    bundle: TaskBundle,
    seed_payload: dict[str, Any],
    budget: int,
) -> dict[str, Any]:
    trajectory = list(seed_payload.get("trajectory") or [])
    query_indices = [int(item.get("query_index")) for item in trajectory]
    unique_query_indices = len(set(query_indices)) == len(query_indices)
    valid_index_range = all(0 <= query_index < len(bundle.test_features_df) for query_index in query_indices)
    condition_matches = True
    for item in trajectory:
        query_index = int(item.get("query_index"))
        expected_row = bundle.test_features_df.iloc[query_index]
        expected_condition = row_to_condition(expected_row, bundle.feature_columns)
        if dict(item.get("condition") or {}) != expected_condition:
            condition_matches = False
            break
    validation = {
        "expected_rounds": int(budget),
        "actual_rounds": int(len(trajectory)),
        "round_count_ok": len(trajectory) == int(budget),
        "query_index_range_ok": bool(valid_index_range),
        "query_index_unique_ok": bool(unique_query_indices),
        "condition_match_ok": bool(condition_matches),
    }
    validation["all_checks_passed"] = bool(all(validation[key] for key in (
        "round_count_ok",
        "query_index_range_ok",
        "query_index_unique_ok",
        "condition_match_ok",
    )))
    return validation


def build_agentic_components(
    config_path: str | Path,
    planner_name: str,
    controller_mode: str = QIZHEN_MODE,
) -> tuple[Any, Any]:
    from chem_agent_bo.agent.decision_engine import DecisionEngine

    method_name, method_family, _ = method_identity(controller_mode)
    config = load_agentic_bo_config(
        config_path,
        overrides={
            "experiment.planner_name": planner_name,
            "orchestrator.planner_name": planner_name,
            "orchestrator.method_name": method_name,
            "orchestrator.method_family": method_family,
        },
    )
    runtime_cfg = config.runtime
    decision_engine = DecisionEngine(
        model_name=runtime_cfg.model_name,
        temperature=runtime_cfg.temperature,
        api_base=runtime_cfg.api_base,
        timeout_sec=runtime_cfg.llm_timeout_sec,
        request_max_retries=runtime_cfg.llm_request_max_retries,
        structured_retry_attempts=runtime_cfg.llm_structured_retry_attempts,
        retry_backoff_sec=runtime_cfg.llm_retry_backoff_sec,
        retry_max_backoff_sec=runtime_cfg.llm_retry_max_backoff_sec,
        retry_jitter_sec=runtime_cfg.llm_retry_jitter_sec,
        fallback_model_name=runtime_cfg.llm_fallback_model_name,
        fallback_attempts=runtime_cfg.llm_fallback_attempts,
        fail_on_nonretryable_error=runtime_cfg.llm_fail_on_nonretryable_error,
        pricing_profile=runtime_cfg.llm_pricing_profile,
        input_cost_per_1m=runtime_cfg.llm_input_cost_per_1m,
        output_cost_per_1m=runtime_cfg.llm_output_cost_per_1m,
        cached_input_cost_per_1m=runtime_cfg.llm_cached_input_cost_per_1m,
        prompt_config=config.prompt,
    )
    if decision_engine.shortlist_rerank_agent is None:
        raise RuntimeError(
            f"{controller_mode} requires a live LLM client. Set ANTHROPIC_AUTH_TOKEN "
            "or OPENAI_API_KEY before running the competition adapter."
    )
    return config, decision_engine


def empty_llm_usage_summary() -> dict[str, Any]:
    return {
        "llm_model_name": None,
        "llm_pricing_profile": None,
        "llm_total_calls": 0,
        "llm_successful_calls": 0,
        "llm_total_input_tokens": 0,
        "llm_total_output_tokens": 0,
        "llm_total_cached_input_tokens": 0,
        "llm_total_tokens": 0,
        "llm_estimated_cost_usd": 0.0,
        "llm_usage_available": False,
    }


def build_controller_runtime(agent_config: Any, decision_engine: Any, planner_name: str) -> ControllerRuntime:
    orchestrator_cfg = agent_config.orchestrator
    runtime_config = ControllerRuntimeConfig(
        planner_name=planner_name,
        planner_action_policies=dict(orchestrator_cfg.planner_action_policies or {}),
        enable_action_package_v2=bool(orchestrator_cfg.enable_action_package_v2),
        enable_action_package_v06=bool(orchestrator_cfg.enable_action_package_v06),
        verification_mode=str(orchestrator_cfg.verification_mode or "advisory"),
        controller_reflection_input_mode=str(
            orchestrator_cfg.controller_reflection_input_mode or "full"
        ),
        lab_mode=True,
    )
    return ControllerRuntime(
        decision_engine=decision_engine,
        config=runtime_config,
        action_policy=ActionCapabilityPolicy.for_lab(),
    )


def load_evidence_cards(
    *,
    evidence_path: str,
    bundle: TaskBundle,
    evidence_top_k: int,
) -> list[EvidenceCard]:
    if not evidence_path:
        return []
    evidence_store = EvidenceStore.load(evidence_path)
    return evidence_store.applicable(
        variables=bundle.feature_columns,
        reaction_scope=bundle.reaction_scope,
        target_nodes=list(COMPETITION_EVIDENCE_TARGET_NODES),
        max_items=max(1, int(evidence_top_k)),
    )


def run_single_seed(
    *,
    bundle: TaskBundle,
    task_alias: str,
    execution_backend: ExecutionBackend,
    controller_mode: str,
    decision_engine: Any | None,
    agent_config: Any | None,
    planner_name: str,
    goal: str,
    budget: int,
    batch_size: int,
    seed: int,
    evidence_cards: list[EvidenceCard],
    evidence_metadata: dict[str, Any] | None,
    shortlist_size: int,
    checkpoint_path: Path | None = None,
    progress_path: Path | None = None,
    resume: bool = True,
    status_callback: Callable[[str, dict[str, Any]], None] | None = None,
) -> dict[str, Any]:
    controller_mode = normalize_controller_mode(controller_mode)
    method_name, method_family, _ = method_identity(controller_mode)
    set_global_seed(seed)
    env = CompetitionFinitePoolEnv(
        param_space=bundle.param_space,
        value_space=bundle.value_space,
        goal=goal,
    )
    campaign, history, train_prior, current_best = initialize_campaign_from_train(bundle, goal=goal)
    initial_history_count = len(history)
    queried_keys: set[tuple[str, ...]] = set()
    third_party_log_path = third_party_log_path_for_seed(
        checkpoint_path=checkpoint_path,
        progress_path=progress_path,
        seed=seed,
    )
    with capture_third_party_output(
        enabled=(planner_name == "atlas"),
        log_path=third_party_log_path,
        label=f"seed={int(seed)} planner_init planner={planner_name}",
    ):
        planner = build_planner(
            planner_name,
            env=env,
            init_budget=0,
            seed=seed,
            known_constraints=None,
            use_descriptors=False,
        )
    runtime: ControllerRuntime | None = None
    knowledge_units: list[dict[str, Any]] = []
    knowledge_meta: dict[str, Any] = {}
    usage_start_index = 0
    if is_qizhen_mode(controller_mode):
        if decision_engine is None or agent_config is None:
            raise RuntimeError(f"{controller_mode} mode requires a decision engine and agent config.")
        runtime = build_controller_runtime(agent_config, decision_engine, planner_name)
        knowledge_units, knowledge_meta = build_evidence_trace(cards=evidence_cards, bundle=bundle)
        usage_start_index = len(decision_engine.usage_records())
    trajectory: list[dict[str, Any]] = []
    submission_trajectory: list[dict[str, Any]] = []
    decision_trace: list[dict[str, Any]] = []
    best_so_far_series: list[float] = []
    baseline_rng = random.Random(seed)
    configured_shortlist = (
        int(agent_config.orchestrator.shortlist_candidate_pool_size or 12)
        if agent_config is not None
        else 12
    )
    batch_size = max(1, int(batch_size))
    total_queries = max(1, int(budget))
    total_rounds = math.ceil(total_queries / batch_size)
    effective_shortlist_size = max(
        batch_size,
        int(shortlist_size),
        configured_shortlist,
    )
    completed_rounds = 0
    prior_llm_usage_calls: list[dict[str, Any]] = []
    def notify(event: str, **payload: Any) -> None:
        if status_callback is None:
            return
        status_callback(
            event,
            {
                "ts": utc_now(),
                "dataset": bundle.dataset_name,
                "planner": planner_name,
                "controller_mode": controller_mode,
                "seed": int(seed),
                **payload,
            },
        )
    if resume and checkpoint_path is not None and checkpoint_path.exists():
        checkpoint = torch.load(checkpoint_path, map_location="cpu")
        expected_identity = {
            "dataset": bundle.dataset_name,
            "planner": planner_name,
            "controller_mode": controller_mode,
            "seed": int(seed),
            "budget": total_queries,
            "execution_backend": execution_backend.name,
            "batch_size": batch_size,
        }
        actual_identity = {
            key: checkpoint.get(key)
            for key in expected_identity
        }
        if actual_identity != expected_identity:
            raise RuntimeError(
                "Checkpoint configuration does not match this run: "
                f"expected={expected_identity}, actual={actual_identity}"
            )
        trajectory = list(checkpoint.get("trajectory") or [])
        submission_trajectory = list(checkpoint.get("submission_trajectory") or [])
        decision_trace = list(checkpoint.get("decision_trace") or [])
        history = list(checkpoint.get("history") or history)
        best_so_far_series = [float(value) for value in checkpoint.get("best_so_far_series") or []]
        prior_llm_usage_calls = list(checkpoint.get("llm_usage_calls") or [])
        completed_rounds = int(checkpoint.get("completed_rounds") or 0)
        if len(trajectory) != min(completed_rounds * batch_size, total_queries):
            raise RuntimeError(
                "Checkpoint query count is inconsistent with its completed round count."
            )
        queried_keys = {
            tuple(item["condition"][col] for col in bundle.feature_columns)
            for item in trajectory
        }
        for item in trajectory:
            vector = ParameterVector().from_dict(
                item["condition"],
                param_space=bundle.param_space,
            )
            campaign.add_observation(vector, float(item["observed_yield"]))
        if history:
            current_best = float(history[-1]["best_result"])
        rng_state = checkpoint.get("baseline_rng_state")
        if rng_state is not None:
            baseline_rng.setstate(rng_state)
        tprint(
            f"[resume] seed={seed} completed_rounds={completed_rounds}/{total_rounds} "
            f"completed_queries={len(trajectory)}/{total_queries}",
        )
        append_detail_log(
            "seed_resume",
            dataset=bundle.dataset_name,
            planner=planner_name,
            controller_mode=controller_mode,
            seed=int(seed),
            completed_rounds=int(completed_rounds),
            total_rounds=int(total_rounds),
            completed_queries=len(trajectory),
            total_queries=int(total_queries),
            checkpoint_path=str(checkpoint_path),
        )
        notify(
            "seed_resume",
            status="running",
            current_round=int(completed_rounds + 1) if completed_rounds < total_rounds else int(total_rounds),
            completed_rounds=int(completed_rounds),
            total_rounds=int(total_rounds),
            completed_queries=len(trajectory),
            total_queries=int(total_queries),
            batch_size=int(batch_size),
        )

    for round_number in range(completed_rounds + 1, total_rounds + 1):
        tprint(
            f"[round_start] dataset={bundle.dataset_name} seed={seed} "
            f"round={round_number}/{total_rounds} completed_queries={len(trajectory)}/{total_queries}"
        )
        append_detail_log(
            "round_start",
            dataset=bundle.dataset_name,
            planner=planner_name,
            controller_mode=controller_mode,
            seed=int(seed),
            round=int(round_number),
            total_rounds=int(total_rounds),
            completed_queries=len(trajectory),
            total_queries=int(total_queries),
        )
        notify(
            "round_start",
            status="running",
            current_round=int(round_number),
            completed_rounds=int(round_number - 1),
            total_rounds=int(total_rounds),
            completed_queries=len(trajectory),
            total_queries=int(total_queries),
            batch_size=int(batch_size),
        )
        if progress_path is not None:
            write_json_atomic(
                progress_path,
                {
                    "status": "running",
                    "updated_at": utc_now(),
                    "dataset": bundle.dataset_name,
                    "planner": planner_name,
                    "controller_mode": controller_mode,
                    "seed": int(seed),
                    "current_round": int(round_number),
                    "completed_rounds": int(round_number - 1),
                    "total_rounds": int(total_rounds),
                    "completed_queries": len(trajectory),
                    "total_queries": int(total_queries),
                    "batch_size": int(batch_size),
                    "checkpoint_path": str(checkpoint_path or ""),
                    "detail_log_path": detail_log_path_string(),
                },
            )
        round_batch_size = min(batch_size, total_queries - len(trajectory))
        remaining_keys = set(bundle.candidate_lookup) - queried_keys
        if len(remaining_keys) < round_batch_size:
            raise RuntimeError(
                f"Only {len(remaining_keys)} candidate rows remain for "
                f"{bundle.dataset_name} round {round_number}, but {round_batch_size} are required."
            )
        constraints = [build_constraint(bundle.feature_columns, remaining_keys)]
        requested_shortlist_size = min(
            max(effective_shortlist_size, round_batch_size),
            len(remaining_keys),
        )
        if round_number <= BASELINE_SEEDED_RANDOM_STEPS:
            requested_shortlist_size = min(
                max(requested_shortlist_size, EARLY_SEEDED_SHORTLIST_SIZE),
                len(remaining_keys),
            )
        tprint(
            f"[planner_shortlist_start] dataset={bundle.dataset_name} seed={seed} "
            f"round={round_number}/{total_rounds} requested_shortlist={requested_shortlist_size} "
            f"remaining_candidates={len(remaining_keys)}"
        )
        notify(
            "planner_shortlist_start",
            status="running",
            current_round=int(round_number),
            completed_rounds=int(round_number - 1),
            total_rounds=int(total_rounds),
            completed_queries=len(trajectory),
            total_queries=int(total_queries),
            requested_shortlist_size=int(requested_shortlist_size),
            remaining_candidates=int(len(remaining_keys)),
        )
        with capture_third_party_output(
            enabled=(planner_name == "atlas"),
            log_path=third_party_log_path,
            label=(
                f"seed={int(seed)} round={int(round_number)} "
                f"planner_shortlist planner={planner_name}"
            ),
        ):
            suggestions = planner.suggest_shortlist(
                observations=campaign.observations,
                subspace=bundle.param_space,
                shortlist_size=requested_shortlist_size,
                known_constraints=constraints,
                known_constraints_signature=allowed_keys_signature(remaining_keys),
            )
        if not suggestions:
            raise RuntimeError(
                f"Planner `{planner_name}` returned no suggestion at round {round_number}."
            )
        shortlist = [
            candidate_to_dict(sample, bundle.param_space)
            for sample in suggestions
        ]
        candidate_pool = build_candidate_pool(shortlist)
        append_detail_log(
            "planner_shortlist_ready",
            dataset=bundle.dataset_name,
            planner=planner_name,
            controller_mode=controller_mode,
            seed=int(seed),
            round=int(round_number),
            requested_shortlist_size=int(requested_shortlist_size),
            candidate_pool_size=len(candidate_pool),
        )
        tprint(
            f"[planner_shortlist_ready] dataset={bundle.dataset_name} seed={seed} "
            f"round={round_number}/{total_rounds} candidate_pool_size={len(candidate_pool)}"
        )
        notify(
            "planner_shortlist_ready",
            status="running",
            current_round=int(round_number),
            completed_rounds=int(round_number - 1),
            total_rounds=int(total_rounds),
            completed_queries=len(trajectory),
            total_queries=int(total_queries),
            requested_shortlist_size=int(requested_shortlist_size),
            candidate_pool_size=int(len(candidate_pool)),
        )
        if round_number <= BASELINE_SEEDED_RANDOM_STEPS:
            candidate_pool = diversify_candidate_pool(
                candidate_pool,
                seed=seed,
                step=round_number,
                frontier_size=EARLY_SEEDED_SHORTLIST_SIZE,
            )
        if len(candidate_pool) < round_batch_size:
            raise RuntimeError(
                f"Planner `{planner_name}` returned {len(candidate_pool)} candidates at round "
                f"{round_number}; {round_batch_size} are required."
            )
        decision = None
        selection_policy = "planner_top1"
        if is_qizhen_mode(controller_mode):
            assert runtime is not None
            bootstrap_history = history[:initial_history_count]
            decision_history = history[initial_history_count:]
            tprint(
                f"[controller_plan_batch_start] dataset={bundle.dataset_name} seed={seed} "
                f"round={round_number}/{total_rounds} batch_size={round_batch_size} "
                f"candidate_pool_size={len(candidate_pool)}"
            )
            append_detail_log(
                "controller_plan_batch_start",
                dataset=bundle.dataset_name,
                planner=planner_name,
                controller_mode=controller_mode,
                seed=int(seed),
                round=int(round_number),
                batch_size=int(round_batch_size),
                candidate_pool_size=len(candidate_pool),
            )
            notify(
                "controller_plan_batch_start",
                status="running",
                current_round=int(round_number),
                completed_rounds=int(round_number - 1),
                total_rounds=int(total_rounds),
                completed_queries=len(trajectory),
                total_queries=int(total_queries),
                batch_size=int(round_batch_size),
                candidate_pool_size=int(len(candidate_pool)),
            )
            decision = runtime.plan_batch(
                bootstrap_history=bootstrap_history,
                history=decision_history,
                candidate_pool=candidate_pool,
                batch_size=round_batch_size,
                search_space=bundle.param_space,
                search_space_meta=build_search_space_meta(bundle, remaining_keys=remaining_keys),
                reaction_context=build_reaction_context(bundle, goal=goal),
                goal=goal,
                objective_name=bundle.target_column,
                iteration=round_number,
                observations=len(decision_history),
                total_budget=total_queries,
                knowledge_units=knowledge_units,
                knowledge_meta=knowledge_meta,
                evidence_trace=knowledge_meta,
            )
            append_detail_log(
                "controller_plan_batch_done",
                dataset=bundle.dataset_name,
                planner=planner_name,
                controller_mode=controller_mode,
                seed=int(seed),
                round=int(round_number),
                selected_candidates=len(decision.selected_candidates),
            )
            tprint(
                f"[controller_plan_batch_done] dataset={bundle.dataset_name} seed={seed} "
                f"round={round_number}/{total_rounds} selected_candidates={len(decision.selected_candidates)}"
            )
            notify(
                "controller_plan_batch_done",
                status="running",
                current_round=int(round_number),
                completed_rounds=int(round_number - 1),
                total_rounds=int(total_rounds),
                completed_queries=len(trajectory),
                total_queries=int(total_queries),
                selected_candidates=int(len(decision.selected_candidates)),
            )
            selected_candidates = [dict(item) for item in decision.selected_candidates]
            if len(selected_candidates) != round_batch_size:
                raise RuntimeError(
                    f"Controller produced {len(selected_candidates)} candidates at round "
                    f"{round_number}; {round_batch_size} are required."
                )
        else:
            if round_number <= BASELINE_SEEDED_RANDOM_STEPS:
                selected_pool_size = min(
                    max(BASELINE_SEEDED_TOP_K, round_batch_size),
                    len(candidate_pool),
                )
                selection_policy = (
                    f"planner_seeded_top{selected_pool_size}_first{BASELINE_SEEDED_RANDOM_STEPS}"
                )
                selected_entries = baseline_rng.sample(
                    candidate_pool[:selected_pool_size],
                    k=round_batch_size,
                )
            else:
                selected_entries = candidate_pool[:round_batch_size]
            selected_candidates = [dict(item["candidate"]) for item in selected_entries]

        pool_by_key = {
            tuple(item["candidate"][col] for col in bundle.feature_columns): item
            for item in candidate_pool
        }
        round_records: list[dict[str, Any]] = []
        round_keys: set[tuple[str, ...]] = set()
        for recommendation_rank, candidate in enumerate(selected_candidates, start=1):
            key = tuple(candidate[col] for col in bundle.feature_columns)
            record = bundle.candidate_lookup.get(key)
            if record is None:
                raise RuntimeError(
                    "Controller proposed a candidate outside the competition candidate pool: "
                    f"{candidate}"
                )
            if key in queried_keys or key in round_keys:
                raise RuntimeError(
                    f"Controller proposed a duplicate query at round {round_number}: {candidate}"
                )
            round_keys.add(key)
            pool_entry = pool_by_key.get(key) or {}
            planner_rank = int(pool_entry.get("bo_rank") or recommendation_rank)
            selected_semantic = (
                decision.semantic_assessments[recommendation_rank - 1]
                if decision is not None
                and recommendation_rank <= len(decision.semantic_assessments)
                else None
            )
            selected_verification = (
                decision.verification_passes[recommendation_rank - 1]
                if decision is not None
                and recommendation_rank <= len(decision.verification_passes)
                else None
            )
            query_step = len(trajectory) + 1
            # SkillNet: orchestrate the condition into an ordered atomic-skill
            # protocol. Deterministic and model-free -- the same condition always
            # yields the same protocol, so a run can be diffed and replayed.
            steps = steps_to_payload(
                build_steps_for_task(task_alias, record["condition"])
            )
            # LabVLA interface: hand that protocol across the execution boundary.
            # Under backend `device` a LabVLA-driven executor performs it on the
            # instrument and returns the measured yield; under `table_lookup` the
            # bundled result table is replayed instead. `outcome.backend` records
            # which of the two produced this number.
            outcome = execution_backend.query(
                task=task_alias,
                candidate_id=int(record["query_index"]),
                candidate=dict(record["condition"]),
                steps=steps,
            )
            observed_yield = float(outcome.value)
            vector = ParameterVector().from_dict(candidate, param_space=bundle.param_space)
            campaign.add_observation(vector, observed_yield)
            history_entry = build_history_entry(
                iteration=initial_history_count + query_step,
                candidate=record["condition"],
                result=observed_yield,
                goal=goal,
                variable_names=bundle.feature_columns,
                previous_best=current_best,
                observation_origin=outcome.backend,
            )
            history.append(history_entry)
            queried_keys.add(key)
            current_best = float(history_entry["best_result"])
            best_so_far_series.append(current_best)
            recommendation_reason = build_recommendation_reason(
                controller_mode=controller_mode,
                planner_name=planner_name,
                decision=decision,
                semantic_assessment=selected_semantic,
                selection_policy=selection_policy,
                planner_rank=planner_rank,
            )
            trajectory.append(
                {
                    "step": int(query_step),
                    "round": int(round_number),
                    "batch_round": int(round_number),
                    "recommendation_rank": int(recommendation_rank),
                    "query_index": int(record["query_index"]),
                    "condition": dict(record["condition"]),
                    "observed_yield": observed_yield,
                    "actual_yield": observed_yield,
                    "predicted_yield": None,
                    "best_so_far": current_best,
                    "execution_backend": outcome.backend,
                    "execution_detail": dict(outcome.raw),
                    "steps": steps,
                }
            )
            submission_trajectory.append(
                build_submission_record(
                    step=query_step,
                    round_number=round_number,
                    recommendation_rank=recommendation_rank,
                    record=record,
                    observed_yield=observed_yield,
                    best_so_far=current_best,
                    planner_name=planner_name,
                    controller_mode=controller_mode,
                    decision=decision,
                    recommendation_reason=recommendation_reason,
                    planner_rank=planner_rank,
                )
            )
            round_records.append(
                {
                    "query_step": query_step,
                    "recommendation_rank": recommendation_rank,
                    "candidate": candidate,
                    "record": record,
                    "observed_yield": observed_yield,
                    "execution_backend": outcome.backend,
                    "steps": steps,
                    "best_so_far": current_best,
                    "planner_rank": planner_rank,
                    "semantic_assessment": selected_semantic,
                    "verification_pass": selected_verification,
                    "recommendation_reason": recommendation_reason,
                }
            )

        selected_reflection = None
        if is_qizhen_mode(controller_mode):
            assert runtime is not None and decision is not None
            final_record = round_records[-1]
            bootstrap_history = history[:initial_history_count]
            decision_history = history[initial_history_count:]
            tprint(
                f"[reflection_start] dataset={bundle.dataset_name} seed={seed} "
                f"round={round_number}/{total_rounds} query_step={final_record['query_step']}"
            )
            append_detail_log(
                "reflection_start",
                dataset=bundle.dataset_name,
                planner=planner_name,
                controller_mode=controller_mode,
                seed=int(seed),
                round=int(round_number),
                query_step=int(final_record["query_step"]),
            )
            notify(
                "reflection_start",
                status="running",
                current_round=int(round_number),
                completed_rounds=int(round_number - 1),
                total_rounds=int(total_rounds),
                completed_queries=len(trajectory),
                total_queries=int(total_queries),
                query_step=int(final_record["query_step"]),
            )
            selected_reflection = runtime.reflect_after_result(
                bootstrap_history=bootstrap_history,
                history=decision_history,
                candidate=final_record["candidate"],
                result=final_record["observed_yield"],
                action_package=decision.action_package,
                semantic_assessment=final_record["semantic_assessment"],
                search_space=bundle.param_space,
                search_space_meta=build_search_space_meta(
                    bundle,
                    remaining_keys=remaining_keys - round_keys,
                ),
                goal=goal,
                objective_name=bundle.target_column,
                iteration=round_number,
                observations=len(decision_history),
                total_budget=total_queries,
                knowledge_units=knowledge_units,
                knowledge_meta=knowledge_meta,
            )
            history[-1]["reflection_action"] = selected_reflection
            append_detail_log(
                "reflection_done",
                dataset=bundle.dataset_name,
                planner=planner_name,
                controller_mode=controller_mode,
                seed=int(seed),
                round=int(round_number),
                query_step=int(final_record["query_step"]),
            )
            tprint(
                f"[reflection_done] dataset={bundle.dataset_name} seed={seed} "
                f"round={round_number}/{total_rounds} query_step={final_record['query_step']}"
            )
            notify(
                "reflection_done",
                status="running",
                current_round=int(round_number),
                completed_rounds=int(round_number - 1),
                total_rounds=int(total_rounds),
                completed_queries=len(trajectory),
                total_queries=int(total_queries),
                query_step=int(final_record["query_step"]),
            )

        for item in round_records:
            recommendation_rank = int(item["recommendation_rank"])
            decision_trace.append(
                {
                    "step": int(item["query_step"]),
                    "round": int(round_number),
                    "batch_round": int(round_number),
                    "recommendation_rank": recommendation_rank,
                    "query_index": int(item["record"]["query_index"]),
                    "condition": dict(item["record"]["condition"]),
                    "observed_yield": float(item["observed_yield"]),
                    "best_so_far": float(item["best_so_far"]),
                    "backbone_planner": planner_name,
                    "controller_mode": controller_mode,
                    "execution_backend": item["execution_backend"],
                    "batch_size": round_batch_size,
                    "candidate_pool": candidate_pool,
                    "controller_plan": decision.controller_plan if decision is not None else None,
                    "action_package": decision.action_package if decision is not None else {
                        "requested_execution_action": "direct_bo_pick",
                        "executed_execution_action": "direct_bo_pick",
                        "selection_policy": selection_policy,
                    },
                    "semantic_assessment": item["semantic_assessment"],
                    "verification_pass": item["verification_pass"],
                    "recommendation_reason": item["recommendation_reason"],
                    "diagnosis": decision.diagnosis if decision is not None else None,
                    "hypothesis_action": decision.hypothesis_action if decision is not None else None,
                    "coverage_insight": decision.coverage_insight if decision is not None else None,
                    "action_capability": decision.action_capability if decision is not None else {
                        "requested_action": "direct_bo_pick",
                        "executed_action": "direct_bo_pick",
                        "fallback_reason": None,
                        "allowed_actions": [],
                        "changed": False,
                    },
                    "rerank_action": decision.rerank_action if decision is not None else None,
                    "evidence_trace": decision.evidence_trace if decision is not None else {},
                    "skill_trace": decision.skill_trace if decision is not None else {},
                    "trace_record": (
                        decision.trace_records[recommendation_rank - 1]
                        if decision is not None
                        and recommendation_rank <= len(decision.trace_records)
                        else {
                            "controller_action": "direct_bo_pick",
                            "controller_boundary": "planner_only_competition_loop",
                        }
                    ),
                    "reflection_action": (
                        selected_reflection
                        if recommendation_rank == len(round_records)
                        else None
                    ),
                }
            )

        llm_usage_calls = prior_llm_usage_calls + (
            [item for item in decision_engine.usage_records()[usage_start_index:]]
            if decision_engine is not None
            else []
        )
        if checkpoint_path is not None:
            save_torch_atomic(
                checkpoint_path,
                {
                    "checkpoint_schema_version": 1,
                    "updated_at": utc_now(),
                    "dataset": bundle.dataset_name,
                    "planner": planner_name,
                    "controller_mode": controller_mode,
                    "seed": int(seed),
                    "budget": int(total_queries),
                    "batch_size": int(batch_size),
                    "completed_rounds": int(round_number),
                    "trajectory": trajectory,
                    "submission_trajectory": submission_trajectory,
                    "decision_trace": decision_trace,
                    "history": history,
                    "best_so_far_series": best_so_far_series,
                    "baseline_rng_state": baseline_rng.getstate(),
                    "llm_usage_calls": llm_usage_calls,
                },
            )
            append_detail_log(
                "checkpoint_saved",
                dataset=bundle.dataset_name,
                planner=planner_name,
                controller_mode=controller_mode,
                seed=int(seed),
                round=int(round_number),
                checkpoint_path=str(checkpoint_path),
                completed_queries=len(trajectory),
            )
            tprint(
                f"[checkpoint_saved] dataset={bundle.dataset_name} seed={seed} "
                f"round={round_number}/{total_rounds} completed_queries={len(trajectory)}/{total_queries}"
            )
            notify(
                "checkpoint_saved",
                status="running",
                current_round=int(round_number),
                completed_rounds=int(round_number),
                total_rounds=int(total_rounds),
                completed_queries=len(trajectory),
                total_queries=int(total_queries),
                checkpoint_path=str(checkpoint_path),
                best_so_far=float(current_best),
            )
        if progress_path is not None:
            write_json_atomic(
                progress_path,
                {
                    "status": "checkpointed",
                    "updated_at": utc_now(),
                    "dataset": bundle.dataset_name,
                    "planner": planner_name,
                    "controller_mode": controller_mode,
                    "seed": int(seed),
                    "current_round": int(round_number),
                    "completed_rounds": int(round_number),
                    "total_rounds": int(total_rounds),
                    "completed_queries": len(trajectory),
                    "total_queries": int(total_queries),
                    "batch_size": int(batch_size),
                    "best_so_far": float(current_best),
                    "last_query_indices": [
                        int(item["record"]["query_index"]) for item in round_records
                    ],
                    "checkpoint_path": str(checkpoint_path or ""),
                    "detail_log_path": detail_log_path_string(),
                },
            )
        tprint(
            "[round_complete] "
            + json.dumps(
                {
                    "dataset": bundle.dataset_name,
                    "seed": int(seed),
                    "round": int(round_number),
                    "total_rounds": int(total_rounds),
                    "batch_size": int(round_batch_size),
                    "query_indices_in_recommendation_order": [
                        int(item["record"]["query_index"]) for item in round_records
                    ],
                    "observed_yields_in_recommendation_order": [
                        float(item["observed_yield"]) for item in round_records
                    ],
                    "best_so_far": float(current_best),
                    "completed_queries": len(trajectory),
                    "total_queries": total_queries,
                },
                ensure_ascii=False,
            ),
        )
        append_detail_log(
            "round_complete",
            dataset=bundle.dataset_name,
            planner=planner_name,
            controller_mode=controller_mode,
            seed=int(seed),
            round=int(round_number),
            total_rounds=int(total_rounds),
            batch_size=int(round_batch_size),
            completed_queries=len(trajectory),
            total_queries=int(total_queries),
            best_so_far=float(current_best),
            query_indices=[int(item["record"]["query_index"]) for item in round_records],
        )
        notify(
            "round_complete",
            status="running",
            current_round=int(round_number),
            completed_rounds=int(round_number),
            total_rounds=int(total_rounds),
            completed_queries=len(trajectory),
            total_queries=int(total_queries),
            batch_size=int(round_batch_size),
            best_so_far=float(current_best),
            query_indices=[int(item["record"]["query_index"]) for item in round_records],
        )

    global_best = best_value(bundle.test_df[bundle.target_column].astype(float).tolist(), goal)
    threshold_95 = (
        float(global_best) * 0.95 if goal == "maximize" else float(global_best) * 1.05
    )
    t95 = None
    for idx, value in enumerate(best_so_far_series, start=1):
        if reached_threshold(value, threshold_95, goal):
            t95 = idx
            break
    t95_penalized = int(t95) if t95 is not None else int(budget) + 1
    train_best_reference = best_value(bundle.train_df[bundle.target_column].astype(float).tolist(), goal)
    initial_round_found_best = float(best_so_far_series[0]) if best_so_far_series else float(current_best or 0.0)
    history_mode = history_mode_for(execution_backend.name)
    seed_payload = {
        "seed": int(seed),
        "dataset": bundle.dataset_name,
        "planner": planner_name,
        "method_name": method_name,
        "method_family": method_family,
        "controller_mode": controller_mode,
        "reaction_scope": bundle.reaction_scope,
        "history_mode": history_mode,
        "batch_size": batch_size,
        "round_count": total_rounds,
        "total_query_budget": total_queries,
        "initial_train_observation_count": int(initial_history_count),
        "train_prior": train_prior,
        "trajectory": trajectory,
        "submission_trajectory": submission_trajectory,
        "trajectory_schema_version": "competition_v2",
        "history": history,
        "decision_trace": decision_trace,
        "evidence_metadata": dict(evidence_metadata or {}),
        "llm_usage": {
            "calls_for_seed": prior_llm_usage_calls + (
                [item for item in decision_engine.usage_records()[usage_start_index:]]
                if decision_engine is not None
                else []
            ),
        },
        "metrics": {
            "initial_round_found_best": initial_round_found_best,
            "initial_best": initial_round_found_best,
            "best_found": float(best_so_far_series[-1]),
            "global_best_public_test": float(global_best),
            "threshold_95_public_test": float(threshold_95),
            "t95_public_test": t95,
            "round_to_95_global_best": t95_penalized,
            "t95_public_test_penalized": t95_penalized,
            "auc_best_so_far": float(sum(best_so_far_series) / len(best_so_far_series)),
            "train_best_reference": float(train_best_reference),
        },
    }
    seed_payload["submission_validation"] = validate_seed_payload(
        bundle=bundle,
        seed_payload=seed_payload,
        budget=budget,
    )
    if not seed_payload["submission_validation"]["all_checks_passed"]:
        raise RuntimeError(
            f"Submission validation failed for seed {seed}: {seed_payload['submission_validation']}"
        )
    notify(
        "seed_complete",
        status="completed",
        current_round=int(total_rounds),
        completed_rounds=int(total_rounds),
        total_rounds=int(total_rounds),
        completed_queries=len(trajectory),
        total_queries=int(total_queries),
        batch_size=int(batch_size),
        best_so_far=float(seed_payload["metrics"]["best_found"]),
    )
    return seed_payload


def write_seed_payload(output_dir: Path, seed_payload: dict[str, Any]) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    seed = int(seed_payload["seed"])
    target_path = output_dir / f"seed_{seed}.pt"
    torch.save(seed_payload, target_path)
    return target_path


def write_summary(
    *,
    output_dir: Path,
    files: TaskFiles,
    bundle: TaskBundle,
    controller_mode: str,
    planner_name: str,
    agentic_config_path: str,
    goal: str,
    budget: int,
    batch_size: int,
    seeds: list[int],
    execution_backend_name: str,
    seed_payloads: list[dict[str, Any]],
    evidence_cards: list[EvidenceCard],
    evidence_path: str,
    evidence_metadata: dict[str, Any] | None,
    llm_usage_summary: dict[str, Any],
) -> Path:
    method_name, method_family, _ = method_identity(controller_mode)
    metrics = [payload["metrics"] for payload in seed_payloads]
    submission_validations = [payload.get("submission_validation") or {} for payload in seed_payloads]
    initial_round_values = [float(item["initial_round_found_best"]) for item in metrics]
    best_found_values = [float(item["best_found"]) for item in metrics]
    auc_values = [float(item["auc_best_so_far"]) for item in metrics]
    train_reference_values = [float(item["train_best_reference"]) for item in metrics]
    t95_penalized_values = [float(item["t95_public_test_penalized"]) for item in metrics]
    aggregate_metrics = {
        "initial_round_found_best": summarize_metric(initial_round_values),
        "best_found": summarize_metric(best_found_values),
        "auc_best_so_far": summarize_metric(auc_values),
        "train_best_reference": summarize_metric(train_reference_values),
        "round_to_95_global_best": summarize_metric(t95_penalized_values),
        "mean_initial_best": float(sum(initial_round_values) / len(initial_round_values)),
        "mean_best_found": float(sum(best_found_values) / len(best_found_values)),
        "mean_auc_best_so_far": float(sum(auc_values) / len(auc_values)),
        "mean_train_best_reference": float(sum(train_reference_values) / len(train_reference_values)),
        "mean_t95_public_test_penalized": float(sum(t95_penalized_values) / len(t95_penalized_values)),
        "t95_public_test_hits": int(sum(item["t95_public_test"] is not None for item in metrics)),
    }
    summary = {
        "dataset": files.dataset_name,
        "task_dir": str(files.task_dir),
        "planner": planner_name,
        "method_name": method_name,
        "method_family": method_family,
        "controller_mode": controller_mode,
        "execution_backend": execution_backend_name,
        "agentic_config_path": agentic_config_path,
        "goal": goal,
        "budget": int(budget),
        "batch_size": int(batch_size),
        "round_count": math.ceil(int(budget) / max(1, int(batch_size))),
        "history_mode": history_mode_for(execution_backend_name),
        "initial_train_observation_count": int(len(bundle.train_df)),
        "reaction_scope": bundle.reaction_scope,
        "feature_columns": list(bundle.feature_columns),
        "key_dimensions": list(bundle.key_dimensions),
        "seeds": list(seeds),
        "competition_profile": {
            "expected_seeds": list(DEFAULT_SEEDS),
            "seed_list_matches_competition": list(seeds) == list(DEFAULT_SEEDS),
            "expected_seed_count": len(DEFAULT_SEEDS),
            "actual_seed_count": len(seeds),
            "expected_budget": 40,
            "budget_matches_competition": int(budget) == 40,
            "expected_batch_size": 1,
            "batch_size_matches_competition": int(batch_size) == 1,
        },
        "evidence_cards_path": evidence_path,
        "applicable_evidence_card_ids": [card.card_id for card in evidence_cards],
        "evidence_metadata": dict(evidence_metadata or {}),
        "source_files": {
            "train_csv": str(files.train_csv),
            "test_csv": str(files.test_csv),
            "test_features_csv": str(files.test_features_csv),
            "searchspace_csv": "" if files.searchspace_csv is None else str(files.searchspace_csv),
            "options_json": "" if files.options_json is None else str(files.options_json),
        },
        "aggregate_metrics": aggregate_metrics,
        "submission_validation_summary": {
            "all_seed_payloads_valid": bool(
                submission_validations
                and all(item.get("all_checks_passed") for item in submission_validations)
            ),
            "validated_seed_count": len(submission_validations),
            "round_count_ok_seeds": int(sum(item.get("round_count_ok") is True for item in submission_validations)),
            "query_index_range_ok_seeds": int(
                sum(item.get("query_index_range_ok") is True for item in submission_validations)
            ),
            "query_index_unique_ok_seeds": int(
                sum(item.get("query_index_unique_ok") is True for item in submission_validations)
            ),
            "condition_match_ok_seeds": int(
                sum(item.get("condition_match_ok") is True for item in submission_validations)
            ),
        },
        "llm_usage_summary": llm_usage_summary,
        "per_seed_metrics": metrics,
        "per_seed_validation": submission_validations,
    }
    summary_path = output_dir / "summary.json"
    summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    return summary_path


def run_with_args(args: argparse.Namespace) -> None:
    runtime = load_submission_runtime(args.config)
    task_alias = normalize_task(args.task)
    task_spec = ENTRY_TASKS[task_alias]
    dataset_root = resolve_path(args.dataset_root or runtime.get("dataset_root") or "dataset")
    planner_name = str(
        args.bayesian_method
        or runtime.get("bayesian_method")
        or runtime.get("bo_method")
        or "atlas"
    )
    agentic_config_path = str(
        resolve_path(
            args.agentic_config or runtime.get("agentic_config") or DEFAULT_AGENTIC_CONFIG
        )
    )
    controller_mode = normalize_controller_mode(
        str(args.controller_mode or runtime.get("controller_mode") or QIZHEN_MODE)
    )
    budget = int(args.rounds or runtime.get("rounds") or 40)
    batch_size = int(args.batch_size or runtime.get("batch_size") or DEFAULT_BATCH_SIZE)
    shortlist_size = int(args.shortlist_size or runtime.get("shortlist_size") or 12)
    seeds = [int(seed) for seed in (args.seeds or runtime.get("seeds") or list(DEFAULT_SEEDS))]
    output_root = resolve_path(args.output_root or runtime.get("output_root") or DEFAULT_OUTPUT_ROOT)
    logs_root = resolve_path(args.logs_root or runtime.get("logs_root") or DEFAULT_LOG_ROOT)
    if budget <= 0:
        raise ValueError("--rounds must be a positive integer.")
    if batch_size <= 0:
        raise ValueError("--batch-size must be a positive integer.")
    if shortlist_size <= 0:
        raise ValueError("--shortlist-size must be a positive integer.")
    method_name, method_family, method_dir = method_identity(controller_mode)
    files = resolve_task_files(dataset_root, task_spec["folder"])
    run_log_path = logs_root / files.dataset_name / controller_mode / planner_name / f"run_{timestamp_slug()}.log"
    global MAIN_LOG_PATH
    MAIN_LOG_PATH = run_log_path
    tprint(
        "[submission_start] "
        f"task={task_alias} dataset={files.dataset_name} mode={controller_mode} bayesian_method={planner_name}"
    )
    bundle = load_task_bundle(files, reaction_scope_override=args.reaction_scope)
    agent_config = None
    decision_engine = None
    if is_qizhen_mode(controller_mode):
        agent_config, decision_engine = build_agentic_components(
            agentic_config_path,
            planner_name,
            controller_mode,
        )
    # `qizhen_scientist` runs with a knowledge prior by default; `atlas_baseline`
    # never carries one, so its numbers stay a clean planner-only reference.
    configured_evidence_paths = runtime.get("evidence_paths") or {}
    if not isinstance(configured_evidence_paths, dict):
        raise TypeError("runtime.evidence_paths must be a mapping.")
    evidence_path = str(args.evidence_cards or "").strip()
    if not evidence_path and is_qizhen_mode(controller_mode):
        evidence_path = str(configured_evidence_paths.get(task_alias) or "").strip()
        if not evidence_path:
            raise ValueError(
                f"{QIZHEN_MODE} runs with a knowledge prior. Pass --evidence-cards, "
                f"or configure runtime.evidence_paths.{task_alias}."
            )
    if evidence_path and not is_qizhen_mode(controller_mode):
        raise ValueError(
            f"--evidence-cards is only meaningful for `{QIZHEN_MODE}`; "
            f"`{BASELINE_MODE}` is a planner-only reference and takes no prior."
        )
    if evidence_path:
        evidence_path = str(resolve_path(evidence_path))
    evidence_cards = load_evidence_cards(
        evidence_path=evidence_path,
        bundle=bundle,
        evidence_top_k=args.evidence_top_k,
    )
    evidence_metadata: dict[str, Any] = {}
    if evidence_path:
        evidence_file = Path(evidence_path)
        evidence_metadata = {
            "source": "evidence_cards",
            "evidence_path": str(evidence_file),
            "evidence_sha256": hashlib.sha256(evidence_file.read_bytes()).hexdigest(),
            "card_count": len(evidence_cards),
        }
    # Retrieved literature carries a review + checksum gate; a hand-curated card
    # set does not. Which one this is follows from the cards, not from a mode name.
    if any(
        str(card.source_type or "").strip().lower() == "sciatlas_literature"
        for card in evidence_cards
    ):
        evidence_metadata = validate_sciatlas_evidence_bundle(
            evidence_path=evidence_path,
            manifest_path=str(args.sciatlas_manifest or "").strip() or None,
            task_alias=task_alias,
            cards=evidence_cards,
            allow_unreviewed=bool(args.allow_unreviewed_sciatlas_evidence),
        )
    execution_cfg = runtime.get("execution") or {}
    if not isinstance(execution_cfg, dict):
        raise TypeError("runtime.execution must be a mapping.")
    execution_backend, execution_resolution = build_execution_backend(
        execution_cfg=execution_cfg,
        candidate_lookup=bundle.candidate_lookup,
        feature_columns=list(bundle.feature_columns),
        backend_override=args.execution_backend,
        device_base_url_override=args.device_base_url,
    )
    tprint(
        f"[execution_backend] requested={execution_resolution['requested_backend']} "
        f"resolved={execution_resolution['resolved_backend']} "
        f"reason={execution_resolution['reason']}"
    )

    output_dir = output_root / files.dataset_name / method_dir / planner_name
    output_dir.mkdir(parents=True, exist_ok=True)
    overall_progress_path = output_dir / "overall_progress.json"
    overall_detail_path = output_dir / "overall_progress.jsonl"
    seed_states = {
        str(int(seed)): make_seed_state(
            output_dir=output_dir / f"seed_{int(seed)}",
            seed=int(seed),
            budget=budget,
            batch_size=batch_size,
        )
        for seed in seeds
    }
    write_overall_progress(
        overall_progress_path,
        dataset=files.dataset_name,
        planner=planner_name,
        controller_mode=controller_mode,
        output_dir=output_dir,
        seed_states=seed_states,
        overall_status="running",
        note="run_started",
    )
    append_jsonl(
        overall_detail_path,
        {
            "ts": utc_now(),
            "ts_local": local_now(),
            "event": "run_started",
            "dataset": files.dataset_name,
            "planner": planner_name,
            "controller_mode": controller_mode,
            "seeds": list(seeds),
        },
    )
    seed_payloads: list[dict[str, Any]] = []
    written_files: list[str] = []
    for seed in seeds:
        seed = int(seed)
        seed_output_dir = output_dir / f"seed_{seed}"
        seed_output_dir.mkdir(parents=True, exist_ok=True)
        pt_path = seed_output_dir / f"seed_{seed}.pt"
        checkpoint_path = seed_output_dir / f"checkpoint_seed_{seed}.pt"
        progress_path = seed_output_dir / f"progress_seed_{seed}.json"
        detail_path = default_seed_detail_log_path(output_dir=seed_output_dir, seed=seed)
        os.environ["TRACE_AGENT_DETAILED_LOG_PATH"] = str(detail_path)
        tprint(f"[seed_start] seed={seed} output_dir={seed_output_dir}")
        seed_states[str(seed)].update(
            {
                "status": "running",
                "updated_at": utc_now(),
                "updated_at_local": local_now(),
                "started_at": seed_states[str(seed)].get("started_at") or utc_now(),
                "last_event": "seed_start",
                "last_event_at": utc_now(),
                "current_operation": "seed_start",
                "detail_log_path": str(detail_path),
            }
        )
        write_overall_progress(
            overall_progress_path,
            dataset=files.dataset_name,
            planner=planner_name,
            controller_mode=controller_mode,
            output_dir=output_dir,
            seed_states=seed_states,
            overall_status="running",
            active_seed=seed,
            note="seed_start",
        )
        append_jsonl(
            overall_detail_path,
            {
                "ts": utc_now(),
                "ts_local": local_now(),
                "event": "seed_start",
                "dataset": files.dataset_name,
                "planner": planner_name,
                "controller_mode": controller_mode,
                "seed": seed,
            },
        )
        def status_callback(event: str, payload: dict[str, Any], *, seed_key: str = str(seed)) -> None:
            state = seed_states[seed_key]
            event_ts = str(payload.get("ts") or utc_now())
            state["updated_at"] = event_ts
            state["updated_at_local"] = local_now()
            state["last_event"] = event
            state["last_event_at"] = event_ts
            state["current_operation"] = event
            for key in (
                "current_round",
                "completed_rounds",
                "total_rounds",
                "completed_queries",
                "total_queries",
                "batch_size",
                "best_so_far",
            ):
                if key in payload:
                    state[key] = payload[key]
            if event == "seed_complete":
                state["status"] = "completed"
                state["completed_at"] = event_ts
                state["current_operation"] = ""
            elif event == "seed_failed":
                state["status"] = "failed"
                state["completed_at"] = event_ts
            else:
                state["status"] = str(payload.get("status") or "running")
            write_overall_progress(
                overall_progress_path,
                dataset=files.dataset_name,
                planner=planner_name,
                controller_mode=controller_mode,
                output_dir=output_dir,
                seed_states=seed_states,
                overall_status="running",
                active_seed=seed,
                note=event,
            )
            append_jsonl(
                overall_detail_path,
                {
                    "ts": event_ts,
                    "ts_local": local_now(),
                    "event": event,
                    "seed_output_dir": str(seed_output_dir),
                    **payload,
                },
            )
        if pt_path.exists() and not args.no_resume:
            payload = torch.load(pt_path, map_location="cpu")
            seed_states[str(seed)].update(
                {
                    "status": "completed",
                    "updated_at": utc_now(),
                    "updated_at_local": local_now(),
                    "completed_at": utc_now(),
                    "last_event": "seed_already_completed",
                    "last_event_at": utc_now(),
                    "current_operation": "",
                    "result_path": str(pt_path),
                }
            )
            write_overall_progress(
                overall_progress_path,
                dataset=files.dataset_name,
                planner=planner_name,
                controller_mode=controller_mode,
                output_dir=output_dir,
                seed_states=seed_states,
                overall_status="running",
                active_seed=seed,
                note="seed_already_completed",
            )
            append_jsonl(
                overall_detail_path,
                {
                    "ts": utc_now(),
                    "ts_local": local_now(),
                    "event": "seed_already_completed",
                    "dataset": files.dataset_name,
                    "planner": planner_name,
                    "controller_mode": controller_mode,
                    "seed": seed,
                    "result_path": str(pt_path),
                },
            )
            tprint(f"[resume] seed={seed} is already complete: {pt_path}")
        else:
            try:
                payload = run_single_seed(
                    task_alias=task_alias,
                    execution_backend=execution_backend,
                    bundle=bundle,
                    controller_mode=controller_mode,
                    decision_engine=decision_engine,
                    agent_config=agent_config,
                    planner_name=planner_name,
                    goal=args.goal,
                    budget=budget,
                    batch_size=batch_size,
                    seed=seed,
                    evidence_cards=evidence_cards,
                    evidence_metadata=evidence_metadata,
                    shortlist_size=shortlist_size,
                    checkpoint_path=checkpoint_path,
                    progress_path=progress_path,
                    resume=not args.no_resume,
                    status_callback=status_callback,
                )
                pt_path = write_seed_payload(seed_output_dir, payload)
            except Exception as exc:
                status_callback(
                    "seed_failed",
                    {
                        "ts": utc_now(),
                        "dataset": files.dataset_name,
                        "planner": planner_name,
                        "controller_mode": controller_mode,
                        "seed": seed,
                        "status": "failed",
                        "error_type": type(exc).__name__,
                        "error": str(exc),
                    },
                )
                write_json_atomic(
                    progress_path,
                    {
                        "status": "failed",
                        "updated_at": utc_now(),
                        "dataset": files.dataset_name,
                        "planner": planner_name,
                        "controller_mode": controller_mode,
                        "seed": seed,
                        "total_rounds": math.ceil(
                            int(budget) / max(1, int(batch_size))
                        ),
                        "total_queries": int(budget),
                        "batch_size": int(batch_size),
                        "checkpoint_available": checkpoint_path.exists(),
                        "checkpoint_path": str(checkpoint_path),
                        "detail_log_path": detail_log_path_string(),
                        "error_type": type(exc).__name__,
                        "error": str(exc),
                        "resume_command_hint": "Rerun the same command without --no-resume.",
                    },
                )
                write_overall_progress(
                    overall_progress_path,
                    dataset=files.dataset_name,
                    planner=planner_name,
                    controller_mode=controller_mode,
                    output_dir=output_dir,
                    seed_states=seed_states,
                    overall_status="running",
                    active_seed=seed,
                    note="seed_failed",
                )
                raise
        write_json_atomic(
            progress_path,
            {
                "status": "completed",
                "updated_at": utc_now(),
                "dataset": files.dataset_name,
                "planner": planner_name,
                "controller_mode": controller_mode,
                "seed": seed,
                "completed_rounds": int(payload["round_count"]),
                "total_rounds": int(payload["round_count"]),
                "completed_queries": len(payload["trajectory"]),
                "total_queries": int(payload["total_query_budget"]),
                "batch_size": int(payload["batch_size"]),
                "best_so_far": float(payload["metrics"]["best_found"]),
                "checkpoint_path": str(checkpoint_path),
                "detail_log_path": detail_log_path_string(),
                "result_path": str(pt_path),
            },
        )
        seed_states[str(seed)].update(
            {
                "status": "completed",
                "updated_at": utc_now(),
                "updated_at_local": local_now(),
                "completed_at": seed_states[str(seed)].get("completed_at") or utc_now(),
                "last_event": "seed_written",
                "last_event_at": utc_now(),
                "current_operation": "",
                "completed_rounds": int(payload["round_count"]),
                "total_rounds": int(payload["round_count"]),
                "completed_queries": len(payload["trajectory"]),
                "total_queries": int(payload["total_query_budget"]),
                "batch_size": int(payload["batch_size"]),
                "best_so_far": float(payload["metrics"]["best_found"]),
                "result_path": str(pt_path),
            }
        )
        seed_payloads.append(payload)
        written_files.append(str(pt_path))
        write_overall_progress(
            overall_progress_path,
            dataset=files.dataset_name,
            planner=planner_name,
            controller_mode=controller_mode,
            output_dir=output_dir,
            seed_states=seed_states,
            overall_status="running",
            active_seed=seed,
            note="seed_written",
        )
        append_jsonl(
            overall_detail_path,
            {
                "ts": utc_now(),
                "ts_local": local_now(),
                "event": "seed_written",
                "dataset": files.dataset_name,
                "planner": planner_name,
                "controller_mode": controller_mode,
                "seed": seed,
                "result_path": str(pt_path),
            },
        )
        tprint(f"[ok] wrote {pt_path}")
    summary_path = write_summary(
        execution_backend_name=execution_backend.name,
        output_dir=output_dir,
        files=files,
        bundle=bundle,
        controller_mode=controller_mode,
        planner_name=planner_name,
        agentic_config_path=str(agentic_config_path),
        goal=args.goal,
        budget=budget,
        batch_size=batch_size,
        seeds=list(seeds),
        seed_payloads=seed_payloads,
        evidence_cards=evidence_cards,
        evidence_path=evidence_path,
        evidence_metadata=evidence_metadata,
        llm_usage_summary=(
            decision_engine.usage_summary()
            if decision_engine is not None
            else empty_llm_usage_summary()
        ),
    )
    write_overall_progress(
        overall_progress_path,
        dataset=files.dataset_name,
        planner=planner_name,
        controller_mode=controller_mode,
        output_dir=output_dir,
        seed_states=seed_states,
        overall_status="completed",
        summary_path=str(summary_path),
        note="run_completed",
    )
    append_jsonl(
        overall_detail_path,
        {
            "ts": utc_now(),
            "ts_local": local_now(),
            "event": "run_completed",
            "dataset": files.dataset_name,
            "planner": planner_name,
            "controller_mode": controller_mode,
            "summary_path": str(summary_path),
        },
    )
    print(
        json.dumps(
            {
                "dataset": files.dataset_name,
                "planner": planner_name,
                "method_name": method_name,
                "method_family": method_family,
                "controller_mode": controller_mode,
                "reaction_scope": bundle.reaction_scope,
                "batch_size": int(batch_size),
                "round_count": math.ceil(int(budget) / max(1, int(batch_size))),
                "execution_backend": execution_backend.name,
                "history_mode": history_mode_for(execution_backend.name),
                "initial_train_observation_count": int(len(bundle.train_df)),
                "evidence_cards_used": [card.card_id for card in evidence_cards],
                "output_dir": str(output_dir),
                "run_log_path": str(run_log_path),
                "summary_json": str(summary_path),
                "written_files": written_files,
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    run_with_args(parse_args())
