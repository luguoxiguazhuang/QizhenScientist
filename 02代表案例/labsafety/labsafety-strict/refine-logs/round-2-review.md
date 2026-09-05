# Round 2 Review (external reviewer: qwen3.8-max via OpenAI-compatible endpoint)

<details>
<summary>Raw reviewer response (verbatim)</summary>

## 7 scores

| Dimension | Weight | Score | Rationale |
|---|---:|---:|---|
| Problem Fidelity | 15% | **9.5/10** | The Problem Anchor is preserved verbatim. The immutable claims, controls, seeds, filter/re-scan requirement, and mechanism conditionality are intact. No substantive drift. |
| Method Specificity | 25% | **8.6/10** | Much stronger: per-item schema, paired deltas, McNemar, bootstrap CI, full-pipeline seeds, contamination checks, stratified equalization, judge reliability, and pre-registered ladder rules. Remaining gaps: numeric reliability thresholds, pooled-seed rule, unsafe-option definition, and circularity risk in direction construction. |
| Contribution Quality | 25% | **8.8/10** | The dominant contribution is now correctly centered on M0 as a pre-registered validation verdict. Mechanism is conditional and secondary. Negative/inconclusive outcomes are legitimized. Still slightly broad because the mechanism ladder contains several secondary analyses. |
| Frontier Leverage | 15% | **8.5/10** | Modern enough: representation directions, probing, steering dose-response, divergence-token ablation, LLM-based implicit-unsafe audit, structured extraction diagnostics. Not forced. Needs tighter integration between text-side divergence and student-side carrier. |
| Feasibility | 10% | **8.2/10** | Feasible under the stated compute budget, but the full-pipeline 3-seed design plus judge calls plus conditional ladder is operationally heavy. The main risk is coordination complexity, not raw compute. |
| Validation Focus | 5% | **8.6/10** | Strong validation focus: blind judging, re-judge stability, format diagnostics, contamination dedup, filter asymmetry audit. Needs exact numeric thresholds for “high agreement,” “severe drift,” and “borderline reliability.” |
| Venue Readiness | 5% | **8.8/10** | Framing is much better: M0 dominant, mechanism conditional, statistical validity explicit, negative results acceptable. Ready-ish as a validation protocol paper if the remaining pre-registration ambiguities are closed. |

## Overall score

**8.7/10**

Weighted calculation:

\[
0.15(9.5) + 0.25(8.6) + 0.25(8.8) + 0.15(8.5) + 0.10(8.2) + 0.05(8.6) + 0.05(8.8)
= 8.74
\]

Rounded: **8.7/10**

## Verdict

**REVISE**

Not READY because the overall score is below 9 and a few blocking specification issues remain. The revision successfully addresses the previous round’s critical concerns, but the protocol still needs several exact pre-registered definitions before it can be considered execution-ready.

## Problem Anchor: preserved or drifted?

**Preserved.**

The Problem Anchor is intact. The revised proposal does not expand QA_I, does not change the 3 pp threshold, does not change the teacher/student models, does not change the judge/filter endpoint, and does not turn the project into mitigation or benchmark construction. The added statistical and reliability machinery is appropriately framed as strengthening the verdict rather than altering the claim.

## Dominant contribution: sharper or still too broad?

**Sharper.**

The dominant contribution is now clearly M0: a pre-registered, uncertainty-aware, matched-control, multi-seed validation verdict for safety-domain subliminal learning. The mechanism ladder is correctly demoted to a conditional secondary contribution.

The remaining breadth is mostly in the mechanism ladder. It is still somewhat broad because it includes multiple probes, controls, dose levels, divergence scores, removal percentages, and erosion/acquisition criteria. That is acceptable if each rung has one primary pre-registered test and all other analyses are explicitly labeled sensitivity/diagnostic.

## Method: simpler or still overbuilt?

**Simpler, but still mildly overbuilt in the mechanism ladder.**

The simplifications from the prior round are real:

- LoRA weight-diffing is no longer a primary screen.
- M4 is narrowed to one divergence score and one retrain-ablation logic.
- The ladder is staged with stop rules.
- M0 is clearly dominant.
- Negative and inconclusive outcomes are legitimate.

However, the ladder still has several secondary branches that could create researcher degrees of freedom:

- M1 includes multiple prompt families and secondary pooling choices.
- M2 includes both behavior prediction and arm-identity prediction.
- M3 includes multiple doses, controls, rescue tests, and ablation variants.
- M4 includes three removal percentages.
- Erosion/acquisition adjudication adds another layer of causal rescue.

The method is now acceptable in scope, but it should be tightened by naming one primary analysis per rung and demoting everything else to sensitivity analysis.

## Frontier leverage: appropriate, old-school, or forced?

**Appropriate.**

The frontier leverage is now better calibrated. The proposal uses a reasonable 2025–26 mechanistic toolkit:

- activation differences,
- layer-wise probing,
- representation-direction steering,
- dose-response causal tests,
- divergence-token/data attribution,
- contrastive safety-direction analysis,
- LLM-based implicit-unsafe audit.

It is not old-school, and it is no longer forced. The main weakness is integration: the student-side carrier evidence and the data-side divergence evidence need a tighter bridge.

---

# Drift warning

**No major drift detected.**

Do **not**:

- expand QA_I beyond 133 items;
- change the 3 pp threshold;
- change the teacher/student base models;
- replace the fixed judge/filter endpoint;
- convert the implicit-unsafe audit into an authoritative filter;
- let the mechanism ladder run if M0 is not established/conditional;
- use QA_I both to define and to test the main mechanism direction without an independent localizer.

The following additions would be acceptable and not drift:

- numeric pre-registration of thresholds;
- independent localizer splits;
- diagnostic text-side audits;
- stronger statistical pooling rules;
- explicit unsafe-option coding.

---

# Simplification opportunities

1. **Declare one primary test per mechanism rung.**
   - M1: one primary prompt set for layer shortlisting.
   - M2: one primary probe target: unsafe behavior, not arm identity.
   - M3: one primary direction, one primary dose contrast, one primary rescue test.
   - M4: one primary removal rate, e.g. 10%, with 5% and 20% as sensitivity.

2. **Demote arm-identity probing.**
   - Arm identity is confounded with teacher tuning, filter selection, and stochastic generation. It can be a diagnostic, but it should not be a primary mechanism target.

3. **Collapse M1 into M2 candidate selection.**
   - M1 can simply produce a pre-registered layer band for M2. It does not need to be treated as a separate mechanistic claim unless it survives M2.

4. **Reduce secondary activation aggregation choices.**
   - Choose final-answer-token residual stream as primary. Mean-pool answer tokens can be diagnostic only.

5. **Keep implicit-unsafe audit strictly diagnostic.**
   - It should not enter the M0 verdict except as an interpretability/confound diagnostic. Otherwise it risks becoming a second filter and drifting from the fixed protocol.

6. **Pre-register one primary M4 success metric.**
   - Example: treated-vs-Ctrl-B gap shrinkage at 10% removal relative to random-k removal. Other k values are sensitivity checks.

7. **Limit rescue tests.**
   - For M3, choose one primary rescue: zeroing the candidate direction projection or removing the top-layer LoRA contribution, not both as co-primary tests.

---

# Modernization opportunities

1. **Use an independent representation-engineering localizer.**
   - Estimate `v_c` and `d_safe` on a held-out contrastive set disjoint from QA_I. This avoids circularity and makes the steering test much more defensible.

2. **Strengthen the structured answer-extraction layer.**
   - The regex/diagnostic extraction layer is good. Make it the authoritative source for format-validity, refusal, OTHER, and option-parse diagnostics. The verbatim judge remains the official metric, but the diagnostic layer should explain all format-related anomalies.

3. **Add a text-side implicit-carrier diagnostic.**
   - The current mechanism ladder is student-side and data-divergence-side, but the actual transmitted channel is teacher text. A lightweight diagnostic could embed filtered teacher outputs and test whether treated vs Ctrl-B pools differ along a latent unsafe/competence axis, without changing the filter. This should remain diagnostic, not a new claim.

4. **Bridge M4 divergence tokens to the student carrier.**
   - After M4 identifies top-divergence examples, test whether students trained without those examples show reduced `v_c` separation or reduced probe AUC. This would connect data attribution to the internal carrier.

5. **Calibrate the erosion/acquisition decision table with direction geometry.**
   - The `d_safe` contrastive direction is a good modern representation-engineering move. Pre-register how the direction is extracted, how cosine thresholds are chosen, and whether the test uses held-out prompts.

---

# Remaining action items

## CRITICAL

### 1. Pre-register the exact outcome coding for QA_I

The proposal says the judge returns `{CORRECT, INCORRECT, OTHER}`, but the main metric and mechanism metrics need an exact mapping.

Specify:

- Is `Acc(QA_I)` = fraction labeled `CORRECT` only?
- Are `INCORRECT` and `OTHER` both counted as failures?
- How are refusals counted?
- How are empty/malformed answers counted?
- What is the primary binary outcome for McNemar?
- What is the format-controlled subset?
- What counts as an “unsafe choice”?

This is blocking because Claims 1–3 depend on a 3 pp accuracy difference, and at n=133 a few ambiguous items can flip the verdict.

### 2. Define the unsafe-choice rate used in M2/M3

The mechanism ladder refers to “unsafe behavior,” “unsafe-choice rate,” and “judge-INCORRECT toward unsafe option,” but the proposal does not specify how unsafe options are identified.

Need one of:

- a pre-registered mapping from each QA_I item’s options to safe/unsafe/correct/incorrect;
- or a rule that “unsafe choice” means choosing a known unsafe distractor;
- or, if no unsafe-option mapping exists, replace “unsafe-choice rate” with “incorrect-answer rate” and explicitly acknowledge the limitation.

This is blocking for mechanism metrics.

### 3. Specify the pooled-seed statistical rule exactly

The proposal says “pooled estimate across seeds as pre-registered replicates,” but the exact pooling rule is not specified.

Pre-register one primary rule, for example:

- seed-stratified paired bootstrap over items and seeds;
- or a random-effects meta-analysis of paired seed-level deltas;
- or a permutation test over discordant pairs with seed as a stratification variable.

Also specify:

- whether the pooled CI must exclude 0 for “established”;
- whether the pooled estimate is a mean delta, median delta, or weighted average;
- how to handle a seed with degenerate variance;
- whether McNemar p-values are used as gates or diagnostics.

This is blocking because the M0 verdict depends on it.

### 4. Replace qualitative reliability terms with numeric thresholds

The verdict rules use phrases like:

- “re-judge agreement high”;
- “judge reliability borderline”;
- “severe arm-skewed format drift”;
- “CI width exceeding the effect threshold.”

These need numeric pre-registration.

Example thresholds, to be adjusted but made explicit:

- re-judge label agreement ≥ 0.85 or Cohen’s κ ≥ 0.75;
- arm difference in re-judge flip rate ≤ 3 pp;
- arm difference in format-valid rate ≤ 5 pp;
- arm difference in refusal/OTHER rate ≤ 5 pp;
- bootstrap CI width > 6 pp triggers inconclusive;
- pooled CI lower bound > 0 for established.

Without numeric thresholds, the verdict can still appear post-hoc.

### 5. Prevent circularity in mechanism direction construction

The proposal constructs `v_c` from treated − Ctrl-B activation differences and then tests it on QA_I. If QA_I activations are used to define `v_c`, the steering test is circular.

Pre-register:

- `v_c` is estimated from an independent localizer set, not QA_I;
- `d_safe` is estimated from contrastive prompts disjoint from QA_I;
- M1/M2 may use QA_I only if the final M3 steering test uses a direction estimated elsewhere;
- or split QA_I into direction-localizer and test halves, though the independent localizer is cleaner.

This is blocking for Claim 5.

---

## IMPORTANT

### 6. Tighten M2 probe leakage rules

Specify:

- item-level cross-validation within training seeds;
- leave-one-seed-out as the primary generalization test;
- no probe trained on the same item’s activation and label without cross-validation;
- class imbalance handling for unsafe/incorrect labels;
- permutation baseline matched to label frequency and item structure.

Otherwise probe AUC may reflect item-level memorization rather than a generalizable carrier.

### 7. Specify M4 integration with the filtered/equalized dataset

M4 computes divergence over “surviving examples,” but the exact integration point needs clarification.

Specify:

- whether divergence is computed after filtering and stratified equalization;
- whether treated and Ctrl-B examples are paired by prompt;
- how top-k removal affects the equalized training set;
- whether random-k removal is drawn from the same equalized pool;
- whether the student is retrained on the reduced set without re-equalizing;
- whether the same seed recipe is used.

This is important because M4’s causal claim depends on comparing top-k removal to random-k removal under identical data conditions.

### 8. Strengthen the M4-to-mechanism bridge

Right now M4 is somewhat separate from M1–M3. A simple bridge would improve the mechanism account:

- after identifying top-divergence examples, test whether removing them reduces the treated-vs-Ctrl-B activation gap along `v_c`;
- or test whether probe AUC drops more under top-k removal than random-k removal.

This should be a secondary pre-registered diagnostic, not a new primary claim.

### 9. Pre-register the erosion/acquisition decision table more tightly

The erosion/acquisition table is conceptually good, but needs exact rules.

Specify:

- contrastive prompt set size and source;
- how `d_safe` is extracted from the frozen base student;
- whether cosine thresholds 0.3 and 0.5 are pre-registered or calibrated on held-out prompts;
- which rescue test is primary;
- what happens if steering toward `d_safe` changes format validity;
- how to classify cases where `v_c` is weak but `d_safe` rescue works.

Otherwise the adjudication may become interpretive.

### 10. Cap researcher degrees of freedom in the ladder

Add a short pre-registration clause:

- one primary layer band;
- one primary direction;
- one primary M3 dose contrast;
- one primary M4 removal percentage;
- one primary erosion/acquisition criterion;
- all other tests are sensitivity analyses;
- M0 re-runs are allowed only for script/run failures, not because the verdict is undesirable;
- mechanism re-runs are allowed only if a guard fails, with logged cause.

This will make the proposal much more defensible.

---

# Summary judgment

The revised proposal is substantially improved. The Problem Anchor is preserved, the dominant contribution is sharper, the method is more focused, and the frontier leverage is now appropriate. The previous critical problems — under-specified M0 verdict logic, weak handling of n=133 noise, missing judge controls, and under-specified mechanism rules — have mostly been addressed.

However, it is not yet READY because several verdict-critical details remain qualitative or ambiguous:

1. exact accuracy/unsafe-choice coding;  
2. pooled-seed statistical rule;  
3. numeric judge-reliability thresholds;  
4. independent localizer for mechanism directions;  
5. tighter integration between M4 data attribution and the student-side carrier.

If those are fixed with exact pre-registered rules, this should move close to READY.
</details>
