"""Task metadata used by the submission entrypoint."""

from __future__ import annotations

from typing import TypedDict


class TaskSpec(TypedDict):
    folder: str
    reaction_scope: str
    train_name: str
    features_name: str
    options_name: str


TASKS: dict[str, TaskSpec] = {
    "suzuki": {
        "folder": "Suzuki",
        "reaction_scope": "suzuki-miyaura cross-coupling",
        "train_name": "suzuki_train.csv",
        "features_name": "suzuki_test_features.csv",
        "options_name": "options.json",
    },
}


def normalize_task(raw: str) -> str:
    task = str(raw or "").strip().lower()
    if task not in TASKS:
        raise ValueError(f"Unsupported task `{raw}`. Use `suzuki`.")
    return task
