"""Protocol decomposition must be deterministic and well-formed."""

from __future__ import annotations

import csv
from pathlib import Path

import pytest

from chem_agent_bo.steps import (
    ACTIONS,
    SUZUKI_CATALYST,
    build_steps_for_task,
    decompose_suzuki,
    parse_leading_number,
    steps_to_payload,
)
from chem_agent_bo.steps.schema import ExperimentStep

REPO_ROOT = Path(__file__).resolve().parents[2]
SUZUKI_TEST_CSV = REPO_ROOT / "data" / "Suzuki" / "suzuki_test.csv"


def _load_conditions(limit: int | None = None) -> list[dict[str, str]]:
    with SUZUKI_TEST_CSV.open("r", encoding="utf-8", newline="") as handle:
        rows = []
        for index, row in enumerate(csv.DictReader(handle)):
            if limit is not None and index >= limit:
                break
            rows.append({k: v for k, v in row.items() if k != "Yield"})
    return rows


@pytest.mark.parametrize("condition", _load_conditions(limit=20))
def test_step_list_is_well_formed(condition: dict[str, str]) -> None:
    steps = decompose_suzuki(condition)

    assert [step.index for step in steps] == list(range(1, len(steps) + 1))
    assert all(step.action in ACTIONS for step in steps)

    solvent_at = next(i for i, s in enumerate(steps) if s.role == "Solvent")
    stir_at = next(i for i, s in enumerate(steps) if s.action == "stir")
    analyze_at = next(i for i, s in enumerate(steps) if s.action == "analyze")
    assert solvent_at < stir_at < analyze_at, "solvent must be charged before stirring"

    # The limiting reagent defines the scale and must be dispensed first.
    dispenses = [s for s in steps if s.action == "dispense"]
    assert dispenses[0].role == "Electrophile"
    assert dispenses[0].unit == "mmol"


def test_decomposition_is_deterministic() -> None:
    condition = _load_conditions(limit=1)[0]
    assert steps_to_payload(decompose_suzuki(condition)) == steps_to_payload(
        decompose_suzuki(condition)
    )


def test_absent_ligand_and_base_are_explicit_not_dropped() -> None:
    condition = {
        "Electrophile": "6-iodoquinoline",
        "Nucleophile": "quinolin-6-ylboronic acid",
        "Ligand": "Nothing",
        "Base": "Nothing",
        "Solvent": "methanol",
    }
    steps = decompose_suzuki(condition)
    ligand = next(s for s in steps if s.role == "Ligand")
    base = next(s for s in steps if s.role == "Base")

    # Kept as zero-amount steps so the device sees an explicit decision
    # rather than a silently missing component.
    assert ligand.amount == 0.0 and "ligand-free" in ligand.note.lower()
    assert base.amount == 0.0 and "base-free" in base.note.lower()


def test_fixed_catalyst_is_included() -> None:
    steps = decompose_suzuki(_load_conditions(limit=1)[0])
    catalyst = next(s for s in steps if s.role == "Catalyst")
    assert catalyst.target == SUZUKI_CATALYST
    assert catalyst.unit == "mol%"


def test_global_optimum_condition_snapshot() -> None:
    """The 99.90 condition should decompose to a stable nine-step protocol."""

    condition = {
        "Electrophile": "6-iodoquinoline",
        "Nucleophile": "5-methyl-1-(oxan-2-yl)-4-(4,4,5,5-tetramethyl-1,3,2-dioxaborolan-2-yl)indazole",
        "Ligand": "tris(2-methylphenyl)phosphane",
        "Base": "lithium 2-methylpropan-2-olate",
        "Solvent": "methanol",
    }
    payload = steps_to_payload(build_steps_for_task("suzuki", condition))

    assert [s["action"] for s in payload] == [
        "take_sample",
        "dispense",
        "dispense",
        "dispense",
        "dispense",
        "dispense",
        "dispense",
        "stir",
        "analyze",
    ]
    stir = payload[-2]
    assert stir["temperature_c"] == 100.0
    assert stir["duration_min"] == 60.0


def test_unknown_action_is_rejected() -> None:
    with pytest.raises(ValueError, match="Unknown action"):
        ExperimentStep(index=1, action="levitate", target="vial")


def test_unregistered_task_is_rejected() -> None:
    with pytest.raises(ValueError, match="No protocol decomposition"):
        build_steps_for_task("buchwald", {})


@pytest.mark.parametrize(
    ("text", "expected"),
    [("3 mL", 3.0), ("50 C", 50.0), ("0.2", 0.2), ("-1.5e1 x", -15.0), ("Fe(NO3)3", None)],
)
def test_parse_leading_number(text: str, expected: float | None) -> None:
    assert parse_leading_number(text) == expected


# --------------------------------------------------------------------------- #
# Lab design-space decomposition (routes on `kind` + `unit`)
# --------------------------------------------------------------------------- #
class _StubVariable:
    def __init__(self, name: str, kind: str = "categorical", unit: str = "") -> None:
        self.name = name
        self.kind = kind
        self.unit = unit


class _StubDesignSpace:
    def __init__(self, variables: list[_StubVariable]) -> None:
        self.variables = variables


AEROBIC_SPACE = _StubDesignSpace(
    [
        _StubVariable("TEMPO derivative"),
        _StubVariable("Additive"),
        _StubVariable("Solvent"),
        _StubVariable("M(NO3)3", kind="fixed"),
        _StubVariable("Solvent volume", kind="discrete_numeric", unit="mL"),
        _StubVariable("Temperature", kind="discrete_numeric", unit="C"),
    ]
)
AEROBIC_CONDITION = {
    "TEMPO derivative": "4-OMe-TEMPO",
    "Additive": "CsCl",
    "Solvent": "DCE",
    "M(NO3)3": "Fe(NO3)3.9H2O",
    "Solvent volume": "0.2 mL",
    "Temperature": "50 C",
}


def test_design_space_routes_unit_bearing_variables() -> None:
    from chem_agent_bo.steps import decompose_design_space

    steps = decompose_design_space(AEROBIC_CONDITION, AEROBIC_SPACE)

    heat = next(s for s in steps if s.action == "heat")
    assert heat.temperature_c == 50.0

    volume = next(s for s in steps if s.unit == "mL")
    assert volume.amount == 0.2

    # Temperature must not also be dispensed as if it were a reagent.
    assert not any(s.action == "dispense" and s.role == "Temperature" for s in steps)
    assert steps[0].action == "take_sample"
    assert steps[-1].action == "analyze"


def test_design_space_dispenses_every_reagent() -> None:
    from chem_agent_bo.steps import decompose_design_space

    steps = decompose_design_space(AEROBIC_CONDITION, AEROBIC_SPACE)
    dispensed = {s.target for s in steps if s.action == "dispense"}
    assert {"4-OMe-TEMPO", "CsCl", "DCE", "Fe(NO3)3.9H2O"} <= dispensed


def test_design_space_decomposition_is_deterministic() -> None:
    from chem_agent_bo.steps import decompose_design_space

    first = steps_to_payload(decompose_design_space(AEROBIC_CONDITION, AEROBIC_SPACE))
    second = steps_to_payload(decompose_design_space(AEROBIC_CONDITION, AEROBIC_SPACE))
    assert first == second
