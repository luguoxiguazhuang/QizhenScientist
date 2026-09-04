# Experiment Tips Routing

<!-- Metadata block (parsed by /auto orchestrator resume check). -->
committed: true
matched_tips:
  - finetune-hyperparameter-sweep
  - multiple-choice-evaluation

## Matches

1. **finetune-hyperparameter-sweep** — plan runs LoRA-SFT for teacher (lr=2e-4) and student (lr=1e-3); trigger fires on any adapter fine-tune even when the LR is hard-coded ("a fixed LR is one grid point").
   - convention to adopt: the LRs are pinned VERBATIM by task.md's binding reproduction protocol (user instruction takes precedence over the sweep per the tips' General Rule 5, and per the HARD CONSTRAINTS "do not alter hyperparameters") — run exactly at lr=2e-4 (teacher) / lr=1e-3 (student) as the pre-registered grid points; acceptance is judged ONLY by M0's claim criteria (never by loss curves). If M0 returns not-established, Phase 1.25 must re-invoke this tip with realized evidence before settling terminal — but any LR change is blocked by the binding protocol, which maps to termination trigger (b) (no actionable change) with the conflict documented.
2. **multiple-choice-evaluation** — QA_I accuracy is read from free-form generations graded against gold option letters (A–D); trigger fires on any letter-graded MCQ eval.
   - convention to adopt: (i) three-way {CORRECT, INCORRECT, OTHER} verdict only, refusal/off-topic never coerced (the verbatim `llm_judge_prompts.md` prompt is exactly the tip's gold-relative shape (b)); (ii) freeze judge config across all arms (qwen3.8-max, verbatim prompt, temperature 0.0); (iii) persist per-row (question+options, raw generation, judge verdict, parsed-letter diagnostic) for audit; (iv) regex letter parse is DIAGNOSTIC ONLY (format-valid/unsafe-choice diagnostics), never authoritative for accuracy; flag regex-vs-judge disagreement > 5% as suspected parser artifact; (v) judge resource is supplied by task.md (qwen3.8-max + endpoint) — no open item.
   - deviation noted: the tip's all-orientations rotation is NOT applied — QA_I is a fixed 133-item instrument whose option texts are image-grounded ("left/middle/right" of the figure), so option permutation would alter the instrument; the verbatim protocol (greedy decode + judge on the instrument as-is) is binding. Reliability panel (re-judge, flip-rate, OTHER-rate gates) substitutes as the artifact control.

## No-match log
- image (ImageNet preprocessing): no torchvision/ImageNet pipeline — vision input goes through the Qwen3.5 multimodal processor, not T.Compose. Not fired.
- steering-coefficient-tuning / steering-block-selection: no additive intervention / steering anywhere (mechanism scope removed by user override). Not fired.
- General Rule for mechanism/Interpretability: not loaded — behavioral-only validation, no internal-object intervention.
