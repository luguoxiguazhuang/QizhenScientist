# Experiment Tracker

| Run ID | Milestone | Purpose | System / Variant | Split | Metrics | Priority | Status | Notes |
|--------|-----------|---------|------------------|-------|---------|----------|--------|-------|
| R001 | MP | contamination dedup | QUERIES vs QA_I; anchor data vs QA_I | full | max Jaccard/cosine log | MUST | pending | thresholds 0.5/0.92 |
| R002 | MP | distractor unsafe-coding | qwen3.8-max, option text only | 133×3 distractors | audit agreement ≥ 0.80 | MUST | pending | freeze after ≤1 revision |
| R003 | MP | construct L_loc | 64 safety stems + 64 neutral | full | dedup disjoint from QA_I | MUST | pending | |
| R004 | MP | construct d_safe pairs | 40 safe / 40 unsafe advice | full | dedup disjoint from QA_I | MUST | pending | |
| R005 | MP | construct QA_T | QA_I stems without images | 133 | n/a | MUST | pending | modality control |
| R006 | MP | harness smoke test | 2 QA_I items end-to-end | 2 | record schema ok | MUST | pending | generate→judge→record |
| R007 | M0 | teacher anchor SFT | Qwen3.5-9B CausalLM + LoRA | anchor 4,642 (full) | train loss | MUST | pending | once; adapter cached |
| R008 | M0 | tuned-teacher generation s42 | teacher + adapter | QUERIES 12,000 (full) | completion rate | MUST | pending | grid seed=42 |
| R009 | M0 | base-teacher generation s42 | base teacher | QUERIES 12,000 (full) | completion rate | MUST | pending | grid seed=42 |
| R010 | M0 | filter + equalize + rescan s42 | qwen3.8-max lenient filter | full pools | pass rates; re-scan hits | MUST | pending | stratified equalization |
| R011 | M0 | student SFT treated s42 | multimodal + lang-tower LoRA | equalized pool (full) | train loss | MUST | pending | lr=1e-3 |
| R012 | M0 | student SFT ctrlB s42 | multimodal + lang-tower LoRA | equalized pool (full) | train loss | MUST | pending | lr=1e-3 |
| R013 | M0 | QA_I eval treated s42 | greedy + judge | QA_I 133 (full) | Acc(QA_I) | MUST | pending | blinded judging |
| R014 | M0 | QA_I eval ctrlB s42 | greedy + judge | QA_I 133 (full) | Acc(QA_I) | MUST | pending | |
| R015 | M0 | seed=200 pipeline | as R008–R014 | full | as above | MUST | pending | grid seed=200 |
| R016 | M0 | seed=201 pipeline | as R008–R014 | full | as above | MUST | pending | grid seed=201 |
| R017 | M0 | QA_I eval ctrlA | base student, no fine-tune | QA_I 133 (full) | Acc(QA_I) | MUST | pending | once, deterministic |
| R018 | M0 | re-judge stability | qwen3.8-max 2nd pass | 133×all arms | agreement ≥ 0.85, κ ≥ 0.75 | MUST | pending | |
| R019 | M0 | verdict script | paired + bootstrap + McNemar | all records | verdict.json (4-state) | MUST | pending | gates pre_registered.json |
| R020 | M1 | activation capture + diff | treated/ctrlB/base on L_loc | full | layer-wise effect size | MUST | pending | conditional on M0 |
| R021 | M1 | layer-wise probes | leave-one-seed-out | full | AUC vs permutation | MUST | pending | layer-band selection |
| R022 | M2 | v_c steering dose-response | treated, k∈{−4..+4} | QA_I 133 | ΔAcc, Δunsafe-choice | MUST | pending | + random-dir control |
| R023 | M2 | v_c-zeroing rescue | treated | QA_I 133 | rescue fraction ≥ 50% | MUST | pending | primary rescue |
| R024 | M2 | d_safe steering + geometry | treated + frozen base | QA_I 133 + pairs | erosion/acquisition class | MUST | pending | cosine 0.3/0.5 gates |
| R025 | M3 | divergence scoring | tuned vs base teacher logits | seed-42 pool (full) | KL per example | MUST | pending | prompt-paired |
| R026 | M3 | re-train top-10% removed | student | pool − top-10% | Acc(QA_I) gap | MUST | pending | same recipe/seed |
| R027 | M3 | re-train random-10% removed | student + Ctrl-B N-matched | pool − random-10% | Acc(QA_I) gap | MUST | pending | control |
| R028 | M3 | bridge diagnostic | v_c separation, probe AUC | L_loc | drop vs random-k | NICE | pending | interpretation rule pre-registered |
