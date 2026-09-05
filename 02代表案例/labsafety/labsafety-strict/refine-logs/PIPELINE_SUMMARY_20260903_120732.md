# Pipeline Summary

**Problem**: Validate whether subliminal learning extends to the safety domain — a teacher tuned to appear chemistry-lab-safety-competent transmitting unsafe behavior to a same-base multimodal student via surface-safe filtered text, measured cross-modally on QA_I — and, if validated, discover its mechanism.
**Final Method Thesis**: matched-control, multi-seed, uncertainty-aware reproduction of the task.md fixed protocol (M0 gate, `kind: phenomenon-validation`), then — only if M0 passes — a pre-registered Location → Causal Intervention → Formation Tracing ladder in the student's language tower.
**Final Verdict**: READY (external review 9.11/10, 3 rounds)
**Date**: 2026-09-03

## Final Deliverables
- Proposal: `refine-logs/FINAL_PROPOSAL.md`
- Review summary: `refine-logs/REVIEW_SUMMARY.md`
- Experiment plan: `refine-logs/EXPERIMENT_PLAN.md`
- Experiment tracker: `refine-logs/EXPERIMENT_TRACKER.md`

## Contribution Snapshot
- Dominant contribution: first pre-registered validation protocol + four-state verdict for safety-domain subliminal learning with cross-modal measurement and matched-filter controls (Ctrl-A base student, Ctrl-B base-teacher data through the same filter).
- Optional supporting contribution: mechanistic characterization of the transmitted unsafe shift (layer-band localization, v_c causal dose-response, divergence-token data tracing, erosion-vs-acquisition adjudication).
- Explicitly rejected complexity: SAE training, influence functions, cross-model replication, circuit discovery, image-side fine-tuning variants, mitigation methods.

## Must-Prove Claims
- C1: Acc(QA_I)_Ctrl-A − Acc(QA_I)_treated ≥ 3 pp
- C2: Acc(QA_I)_Ctrl-B − Acc(QA_I)_treated ≥ 3 pp
- C3: both hold across ≥ 3 seeds ({42, 200, 201})
- C4: filtered channel passes unsafe-vocabulary re-scan
- C5 (conditional on M0): internal language-tower carrier mediates the effect; causal intervention moves it predictably; signal traceable to training data

## First Runs to Launch
1. MP — pre-stage hygiene: dedup checks (QUERIES/anchor data vs QA_I), distractor unsafe-coding, L_loc/d_safe/QA_T construction, harness smoke test.
2. M0 seed=42 pipeline — teacher anchor SFT (once) → tuned/base teacher generation (12,000 prompts each) → lenient filter + stratified equalization + re-scan → student SFT (treated + Ctrl-B) → QA_I eval.
3. M0 Ctrl-A eval (base student, no fine-tune) + seeds 200/201 pipelines → verdict.json (four-state).

## Main Risks
- Phenomenon does not reproduce: not-established is a legitimate, pre-registered endpoint (pipeline ends with negative-result report).
- n=133 noise floor: paired statistics + bootstrap CI + pooled McNemar + inconclusive band; verdicts never forced.
- Judge endpoint throughput (~70k filter calls): checkpointed resumable client with retry/backoff; wall-clock bottleneck, not GPU.
- OOM/preemption deadlocks: single process per GPU, gradient checkpointing, fixed batch; never `device_map="auto"`.

## Next Action
- Proceed to `/auto-experiment` — implement `pipeline/` scripts from EXPERIMENT_PLAN.md, run M0 first; Phase 1.25 Phenomenon-Validation Gate keys on `kind: phenomenon-validation`; mechanism routing (`/mechanism-skills`) only after an established/conditional verdict.
