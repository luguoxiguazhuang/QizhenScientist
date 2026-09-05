# Refinement Report

**Problem**: Validate a given behavior (subliminal transmission of unsafe behavior, safety-competence teacher → same-base multimodal student, cross-modal) and plan its mechanism discovery.
**Initial Approach**: task.md fixed protocol + matched controls + seeds + re-scan (M0 gate) → mechanism ladder.
**Date**: 2026-09-03
**Rounds**: 3 / 5
**Final Score**: 9.11 / 10
**Final Verdict**: READY

## Problem Anchor
(verbatim, see FINAL_PROPOSAL.md §Problem Anchor)

## Output Files
- Review summary: `refine-logs/REVIEW_SUMMARY.md`
- Final proposal: `refine-logs/FINAL_PROPOSAL.md`

## Score Evolution

| Round | Problem Fidelity | Method Specificity | Contribution Quality | Frontier Leverage | Feasibility | Validation Focus | Venue Readiness | Overall | Verdict |
|-------|------------------|--------------------|----------------------|-------------------|-------------|------------------|-----------------|---------|---------|
| 1     | 9                | 6                  | 8                    | 8                 | 7           | 5                | 6               | 7.0     | REVISE  |
| 2     | 9.5              | 8.6                | 8.8                  | 8.5               | 8.2         | 8.6              | 8.8             | 8.7     | REVISE  |
| 3     | 9.5              | 9.3                | 9.0                  | 8.6               | 8.8         | 9.6              | 9.2             | 9.11    | READY   |

## Round-by-Round Review Record

| Round | Main Reviewer Concerns | What Was Changed | Result |
|-------|-------------------------|------------------|--------|
| 1     | n=133 verdict fragility; uncontrolled confounds; under-specified ladder | Paired statistics, seeds, equalization, judge controls, dedup, ladder rules, d_safe adjudication | resolved |
| 2     | Exact coding / pooling / thresholds; anti-circularity; M4 integration; leakage; degrees of freedom | Exact pre-registration of all verdict-critical quantities; L_loc + d_safe localizers; prompt-paired KL; leave-one-seed-out probes; caps | resolved |
| 3     | Sign conventions; unsafe-choice denominator; specificity guard; bridge rule; McNemar sensitivity; diagnostic cap | Adopted as pre-registration clauses | resolved |

## Final Proposal Snapshot
- Canonical clean version lives in `refine-logs/FINAL_PROPOSAL.md`.
- The dominant contribution is a pre-registered, uncertainty-aware, matched-control, multi-seed M0 verdict for safety-domain subliminal learning with cross-modal measurement.
- The mechanism ladder (Location → Causal Intervention → Formation Tracing) is conditional on M0 ∈ {established, conditional} and uses one primary test per rung.
- Anti-circularity is guaranteed by independent localizers (L_loc for v_c; disjoint 40/40 pairs for d_safe).
- Erosion-vs-acquisition is adjudicated by a pre-registered cosine/rescue decision table.

## Method Evolution Highlights
1. Most important focusing move: demoted everything but one primary test per rung; M1 folded into M2 candidate selection.
2. Most important mechanism upgrade: anti-circular independent localizers + pre-registered numeric reliability gates.
3. Most important modernization justified: representation-engineering directions (v_c, d_safe) and KL-based data ablation; SAEs/circuit discovery/RL explicitly rejected as overbuilt for the claim.

## Pushback / Drift Log
| Round | Reviewer Said | Author Response | Outcome |
|-------|---------------|-----------------|---------|
| 1     | Could add SAE / circuit discovery for frontier leverage | Rejected — shared-init + LoRA + 4×A800 budget; SAE/circuit overbuilt; directions suffice | accepted restraint |
| 1     | Raw 3 pp threshold | Kept the immutable 3 pp claim; upgraded only the evidentiary standard (paired CI, gates) | accepted |
| 2     | Arm-identity probing as primary | Demoted to diagnostic (confounded with teacher tuning/filter/generation) | accepted |
| 3     | Interpretive guards on v_c / M4 | Adopted verbatim as pre-registration clauses | accepted |

## Remaining Weaknesses
- n=133 resolution limit is mitigated (paired statistics, inconclusive band) but not eliminated.
- Filter and eval judge share the qwen3.8-max endpoint (task.md binding); bias is audited, not removable.
- Mechanism ladder may return mixed / inconclusive-mechanism — pre-registered as legitimate.

## Raw Reviewer Responses

<details>
<summary>Round 1 Review</summary>

See `refine-logs/round-1-review.md` (full verbatim response).

</details>

<details>
<summary>Round 2 Review</summary>

See `refine-logs/round-2-review.md` (full verbatim response).

</details>

<details>
<summary>Round 3 Review</summary>

See `refine-logs/round-3-review.md` (full verbatim response).

</details>

## Next Steps
- READY: proceed to `/experiment-plan` (done, this pipeline) then `/auto-experiment` to implement and run M0 first.
