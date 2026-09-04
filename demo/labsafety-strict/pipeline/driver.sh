#!/bin/bash
# M0 phenomenon-validation driver — full suite with safe CPU/GPU overlaps.
# GPUs: 4,5,6,7 only (task.md hard constraint). Judge work is CPU/network-bound.
set -u
cd /REDACTED/tiaozhanbei/demo/labsafety
PY=/REDACTED/miniconda3/envs/subliminal_mm/bin/python
log() { echo "[$(date -u +%FT%TZ)] $*"; }

# ---- P1: MP hygiene (CPU/judge, parallel) ----
log "P1: R001 dedup || R002 distractor coding"
bash pipeline/stage.sh R001_dedup_scan none $PY pipeline/p1_dedup.py > runs/_driver_R001.log 2>&1 & W1=$!
bash pipeline/stage.sh R002_distractor_coding none $PY pipeline/p2_distractors.py > runs/_driver_R002.log 2>&1 & W2=$!
wait $W1; S1=$?
wait $W2; S2=$?
[ $S1 -eq 0 ] || { log "R001 dedup FAILED"; exit 1; }
[ $S2 -eq 0 ] || { log "R002 distractor coding FAILED"; exit 1; }
bash pipeline/stage.sh clusters_build none $PY pipeline/build_clusters.py > runs/_driver_clusters.log 2>&1 || { log "clusters FAILED"; exit 1; }
log "P1 done"

# ---- P2: teacher anchor SFT (GPU 4) || Ctrl-A eval (GPUs 5,6,7) ----
log "P2: R007 teacher SFT || R017 ctrlA eval"
bash pipeline/stage.sh R007_teacher_sft 4 $PY pipeline/teacher_sft.py --seed 42 > runs/_driver_R007.log 2>&1 & T1=$!
bash pipeline/run_eval.sh ctrlA 0 R017_eval_ctrlA 5,6,7 > runs/_driver_R017.log 2>&1 & T2=$!
wait $T1; S1=$?
wait $T2; S2=$?
[ $S1 -eq 0 ] || { log "R007 teacher SFT FAILED"; exit 1; }
[ $S2 -eq 0 ] || { log "R017 ctrlA eval FAILED"; exit 1; }
log "P2 done"

# ---- P3: generation seed 42 ----
bash pipeline/run_gen_seed.sh 42 R008_gen_s42 > runs/_driver_gen42.log 2>&1 || { log "gen s42 FAILED"; exit 1; }
log "gen s42 done"

# ---- P4: filter s42 || gen s200 ----
bash pipeline/run_filter_seed.sh 42 > runs/_driver_filter42.log 2>&1 & F1=$!
bash pipeline/run_gen_seed.sh 200 R015_gen_s200 > runs/_driver_gen200.log 2>&1 || { log "gen s200 FAILED"; exit 1; }
wait $F1; [ $? -eq 0 ] || { log "filter s42 FAILED"; exit 1; }
log "gen s200 + filter s42 done"

# ---- P5: filter s200 || gen s201 ----
bash pipeline/run_filter_seed.sh 200 > runs/_driver_filter200.log 2>&1 & F2=$!
bash pipeline/run_gen_seed.sh 201 R016_gen_s201 > runs/_driver_gen201.log 2>&1 || { log "gen s201 FAILED"; exit 1; }
wait $F2; [ $? -eq 0 ] || { log "filter s200 FAILED"; exit 1; }
log "gen s201 + filter s200 done"

# ---- P6: filter s201 || student SFT s42 ----
bash pipeline/run_filter_seed.sh 201 > runs/_driver_filter201.log 2>&1 & F3=$!
bash pipeline/run_student_sft_seed.sh 42 4,5 > runs/_driver_sft42.log 2>&1 || { log "student sft s42 FAILED"; exit 1; }
wait $F3; [ $? -eq 0 ] || { log "filter s201 FAILED"; exit 1; }
log "filter s201 + student sft s42 done"

# ---- P7: eval s42 (treated, ctrlB) ----
bash pipeline/run_eval.sh treated 42 R013_eval_treated_s42 > runs/_driver_eval42t.log 2>&1 || { log "eval treated s42 FAILED"; exit 1; }
bash pipeline/run_eval.sh ctrlb 42 R014_eval_ctrlb_s42 > runs/_driver_eval42b.log 2>&1 || { log "eval ctrlb s42 FAILED"; exit 1; }
log "eval s42 done"

# ---- P8: student SFT s200 + eval s200 ----
bash pipeline/run_student_sft_seed.sh 200 4,5 > runs/_driver_sft200.log 2>&1 || { log "student sft s200 FAILED"; exit 1; }
bash pipeline/run_eval.sh treated 200 R015_eval_treated_s200 > runs/_driver_eval200t.log 2>&1 || { log "eval treated s200 FAILED"; exit 1; }
bash pipeline/run_eval.sh ctrlb 200 R015_eval_ctrlb_s200 > runs/_driver_eval200b.log 2>&1 || { log "eval ctrlb s200 FAILED"; exit 1; }
log "seed 200 done"

# ---- P9: student SFT s201 + eval s201 ----
bash pipeline/run_student_sft_seed.sh 201 4,5 > runs/_driver_sft201.log 2>&1 || { log "student sft s201 FAILED"; exit 1; }
bash pipeline/run_eval.sh treated 201 R016_eval_treated_s201 > runs/_driver_eval201t.log 2>&1 || { log "eval treated s201 FAILED"; exit 1; }
bash pipeline/run_eval.sh ctrlb 201 R016_eval_ctrlb_s201 > runs/_driver_eval201b.log 2>&1 || { log "eval ctrlb s201 FAILED"; exit 1; }
log "seed 201 done"

# ---- P10: re-judge stability + verdict ----
bash pipeline/stage.sh R018_rejudge_stability none $PY pipeline/rejudge.py > runs/_driver_rejudge.log 2>&1 || { log "rejudge FAILED"; exit 1; }
bash pipeline/stage.sh R019_verdict none $PY pipeline/verdict.py > runs/_driver_verdict.log 2>&1 || { log "verdict FAILED"; exit 1; }
log "M0 DRIVER COMPLETE"
