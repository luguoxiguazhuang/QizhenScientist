"""SkillNet experiment-skill orchestration: condition -> ordered atomic skills.

This is where a reaction condition becomes an executable, step-by-step
protocol. Orchestration is deterministic and model-free.

No LLM is involved: the same condition always yields the same step list, so a
protocol can be diffed, reviewed, and replayed. Process constants that the
dataset holds fixed (scale, loadings, temperature, time) live here as explicit
defaults rather than being invented per run.
"""

from __future__ import annotations

import re
from typing import Any

from chem_agent_bo.steps.schema import (
    ANALYZE,
    DISPENSE,
    HEAT,
    STIR,
    TAKE_SAMPLE,
    ExperimentStep,
)

# Values that mean "this component is deliberately omitted" in the bundled
# Suzuki dataset (both `Ligand` and `Base` really take the literal "Nothing").
_ABSENT_VALUES = {"", "nothing", "none", "n/a", "na"}

# Suzuki-Miyaura process constants. The public HTE dataset varies only the five
# categorical components and holds everything below fixed, so these are not
# tunable parameters -- they are the invariant part of the published protocol.
SUZUKI_DEFAULTS: dict[str, float] = {
    "scale_mmol": 0.1,
    "nucleophile_equiv": 1.5,
    "pd_mol_percent": 5.0,
    "ligand_mol_percent": 10.0,
    "base_equiv": 3.0,
    "solvent_volume_ml": 0.5,
    "temperature_c": 100.0,
    "duration_min": 60.0,
}

# Fixed catalyst for the Suzuki task, from data/Suzuki/options.json.
SUZUKI_CATALYST = "palladium(2+) diacetate"

_NUMERIC_PREFIX = re.compile(r"^\s*([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)")


def _is_absent(value: Any) -> bool:
    return str(value or "").strip().lower() in _ABSENT_VALUES


def parse_leading_number(value: Any) -> float | None:
    """Pull the numeric prefix out of a display string such as ``"3 mL"``."""

    match = _NUMERIC_PREFIX.match(str(value or ""))
    if match is None:
        return None
    try:
        return float(match.group(1))
    except ValueError:
        return None


def decompose_suzuki(condition: dict[str, str]) -> list[ExperimentStep]:
    """Turn one Suzuki condition into an ordered, executable step list."""

    scale = SUZUKI_DEFAULTS["scale_mmol"]
    steps: list[ExperimentStep] = []

    def add(**kwargs: Any) -> None:
        steps.append(ExperimentStep(index=len(steps) + 1, **kwargs))

    add(
        action=TAKE_SAMPLE,
        target="reaction vial",
        note="Charge an inert, dry vial and place it on the deck.",
    )
    add(
        action=DISPENSE,
        target=str(condition.get("Electrophile", "")),
        role="Electrophile",
        amount=scale,
        unit="mmol",
        note="Limiting reagent; defines 1.0 equiv for this run.",
    )
    add(
        action=DISPENSE,
        target=str(condition.get("Nucleophile", "")),
        role="Nucleophile",
        amount=SUZUKI_DEFAULTS["nucleophile_equiv"],
        unit="equiv",
    )
    add(
        action=DISPENSE,
        target=SUZUKI_CATALYST,
        role="Catalyst",
        amount=SUZUKI_DEFAULTS["pd_mol_percent"],
        unit="mol%",
        note="Fixed across the dataset; not an optimization variable.",
    )

    ligand = str(condition.get("Ligand", ""))
    if _is_absent(ligand):
        add(
            action=DISPENSE,
            target="(no ligand)",
            role="Ligand",
            amount=0.0,
            unit="mol%",
            note="Ligand-free condition; skip the ligand addition.",
        )
    else:
        add(
            action=DISPENSE,
            target=ligand,
            role="Ligand",
            amount=SUZUKI_DEFAULTS["ligand_mol_percent"],
            unit="mol%",
        )

    base = str(condition.get("Base", ""))
    if _is_absent(base):
        add(
            action=DISPENSE,
            target="(no base)",
            role="Base",
            amount=0.0,
            unit="equiv",
            note="Base-free condition; skip the base addition.",
        )
    else:
        add(
            action=DISPENSE,
            target=base,
            role="Base",
            amount=SUZUKI_DEFAULTS["base_equiv"],
            unit="equiv",
        )

    add(
        action=DISPENSE,
        target=str(condition.get("Solvent", "")),
        role="Solvent",
        amount=SUZUKI_DEFAULTS["solvent_volume_ml"],
        unit="mL",
        note="Added last so all solids are charged dry.",
    )
    add(
        action=STIR,
        target="reaction vial",
        duration_min=SUZUKI_DEFAULTS["duration_min"],
        temperature_c=SUZUKI_DEFAULTS["temperature_c"],
        note="Seal and stir under inert atmosphere.",
    )
    add(
        action=ANALYZE,
        target="reaction mixture",
        note="Quench an aliquot and measure product yield.",
    )
    return steps


def decompose_design_space(
    condition: dict[str, Any],
    design_space: Any,
) -> list[ExperimentStep]:
    """Decompose a lab-project condition using its design-space metadata.

    Routing uses the two signals a :class:`DesignVariable` actually carries --
    ``kind`` and ``unit`` -- because the design space has no semantic notion of
    "reagent" versus "amount".
    """

    steps: list[ExperimentStep] = []

    def add(**kwargs: Any) -> None:
        steps.append(ExperimentStep(index=len(steps) + 1, **kwargs))

    add(
        action=TAKE_SAMPLE,
        target="reaction vial",
        note="Charge the vial and place it on the deck.",
    )

    variables = {getattr(v, "name", ""): v for v in getattr(design_space, "variables", [])}
    temperature_c: float | None = None
    duration_min: float | None = None

    for name, raw_value in condition.items():
        variable = variables.get(name)
        unit = str(getattr(variable, "unit", "") or "").strip()
        kind = str(getattr(variable, "kind", "categorical") or "categorical")
        text = str(raw_value)
        number = parse_leading_number(text)
        unit_key = unit.lower().strip(" °")

        if unit_key in {"c", "celsius", "degc"}:
            temperature_c = number
            continue
        if unit_key in {"min", "minute", "minutes", "h", "hr", "hour", "hours"}:
            duration_min = number * 60.0 if (number is not None and unit_key.startswith("h")) else number
            continue
        if unit_key in {"ml", "l", "ul", "μl"}:
            add(
                action=DISPENSE,
                target=name,
                role=name,
                amount=number,
                unit=unit or "mL",
                note=f"Solvent charge for {name}.",
            )
            continue
        if kind == "categorical" or number is None:
            add(action=DISPENSE, target=text, role=name)
            continue
        add(action=DISPENSE, target=name, role=name, amount=number, unit=unit)

    if temperature_c is not None:
        add(
            action=HEAT,
            target="reaction vial",
            temperature_c=temperature_c,
            note="Bring the vial to the target temperature before stirring.",
        )
    add(
        action=STIR,
        target="reaction vial",
        duration_min=duration_min,
        temperature_c=temperature_c,
    )
    add(
        action=ANALYZE,
        target="reaction mixture",
        note="Sample the mixture and measure the objective.",
    )
    return steps


def build_steps_for_task(
    task_alias: str,
    condition: dict[str, Any],
    *,
    design_space: Any | None = None,
) -> list[ExperimentStep]:
    """SkillNet entry point: dispatch to the orchestrator matching the task."""

    if design_space is not None:
        return decompose_design_space(condition, design_space)
    alias = str(task_alias or "").strip().lower()
    if alias == "suzuki":
        return decompose_suzuki(condition)
    raise ValueError(
        f"No protocol decomposition registered for task `{task_alias}`. "
        "Pass a design_space, or add a decomposer in chem_agent_bo/steps/decompose.py."
    )
