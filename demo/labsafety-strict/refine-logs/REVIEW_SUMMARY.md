# Review Summary

**Problem**: Validate (then mechanistically explain) whether a safety-competence-looking teacher transmits unsafe behavior to a same-base multimodal student via surface-safe filtered text, measured cross-modally (task.md behavior; given-validation mode).
**Initial Approach**: fixed task.md protocol + matched controls + seeds + re-scan (M0), then a mechanism ladder.
**Date**: 2026-09-03
**Rounds**: 3 / 5
**Final Score**: 9.11 / 10
**Final Verdict**: READY

## Problem Anchor
- Bottom-line problem: determine whether subliminal learning extends to the safety domain (safety-competence teacher → unsafe student via surface-safe filtered text; cross-modal measurement), and if so identify the mechanism.
- Must-solve bottleneck: a defensible verdict requires matched controls (Ctrl-A, Ctrl-B), ≥3 seeds, surface-clean channel proof, and erosion-vs-acquisition separability.
- Non-goals: mitigation; protocol changes; different models; new benchmarks; human eval.
- Constraints: local Qwen3.5-9B; qwen3.8-max judge; GPUs 4–7; ample budget; task.md protocol binding.
- Success condition: four-state M0 verdict + conditional carrier account.

## Round-by-Round Resolution Log

| Round | Main Reviewer Concerns | What This Round Simplified / Modernized | Solved? | Remaining Risk |
|-------|-------------------------|------------------------------------------|---------|----------------|
| 1 | (CRITICAL) M0 verdict logic under-specified for n=133; raw 3 pp below noise floor; judge bias / filter asymmetry / contamination / format drift uncontrolled; mechanism ladder under-constrained | Added paired item-level statistics, full-pipeline seeds, stratified equalization, judge reliability controls, contamination dedup, pre-registered ladder rules, d_safe representation-engineering adjudication; LoRA weight-diff demoted; M4 narrowed | yes | numeric thresholds, pooling rule, outcome coding, circularity still open |
| 2 | (CRITICAL) exact outcome coding; exact pooled-seed rule; numeric reliability thresholds; independent localizers; M4 integration; (IMPORTANT) probe leakage, erosion/acquisition exactness, degrees-of-freedom cap | Exact CORRECT/non-CORRECT coding + distractor unsafe-coding; pooled mean of seed means + two-level bootstrap + pooled McNemar; numeric gates (agreement ≥0.85, κ ≥0.75, diffs ≤3–5 pp, CI width >6 pp → inconclusive); L_loc + d_safe disjoint localizers; M4 prompt-paired KL after equalization; leave-one-seed-out probes; cosine thresholds 0.3/0.5; one-primary-per-rung cap; M1 folded into M2 | yes | interpretive guards only |
| 3 | (non-blocking) sign conventions; unsafe-choice denominator + coding audit; unsafe-specificity guard; M4 bridge interpretation rule; McNemar sensitivity; diagnostic cap | All six adopted as pre-registration clauses in the final proposal | yes | none blocking |

## Overall Evolution
- The method became more concrete: every verdict-critical quantity now has an exact pre-registered definition (coding, pooling, thresholds, localizers, removal rules).
- The dominant contribution became more focused: M0 verdict is primary; mechanism ladder is conditional, secondary, one-primary-test-per-rung.
- Unnecessary complexity was removed: LoRA weight-diffing demoted; M1 folded into M2 candidate selection; arm-identity probing, mean-pooling, implicit-unsafe audit, text-side embedding audit all demoted to diagnostic/sensitivity.
- Modern technical leverage improved appropriately: representation-engineering directions (v_c, d_safe) with anti-circular localizers, dose-response steering, KL-based data ablation — nothing forced (no SAEs/circuits/RL).
- Drift was avoided: no QA_I expansion, no threshold/model/endpoint changes, diagnostics never become filters or primary evidence.

## Final Status
- Anchor status: preserved
- Focus status: tight
- Modernity status: appropriately frontier-aware
- Strongest parts of final method: pre-registered four-state verdict with matched controls; anti-circular mechanism ladder; erosion-vs-acquisition decision table.
- Remaining weaknesses: n=133 resolution limit (mitigated, not eliminated); filter judge and eval judge share the same endpoint (audited, not replaceable under task.md); mechanism may return mixed/inconclusive (pre-registered as legitimate).
