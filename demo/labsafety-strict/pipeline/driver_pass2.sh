#!/bin/bash
# Pass-2 M0 driver: re-runs ONLY the stages invalidated by the pre-registered
# inconclusive fixes (equalize -> rescan/drop -> student SFT -> eval for all 3
# seeds; then reliability re-judge and verdict). Reused verbatim: teacher
# adapter, all generations (runs/gen_s*), pass-1 filter judge labels, Ctrl-A
# eval (81.2%), distractor coding, clusters. GPUs 4,5,6,7 only.
set -u
cd /REDACTED/tiaozhanbei/demo/labsafety
PY=/REDACTED/miniconda3/envs/subliminal_mm/bin/python
log() { echo "[$(date -u +%FT%TZ)] $*"; }

# ---- F1: pass-2 filter s42 (coarser length strata + drop-and-reverify rescan) ----
bash pipeline/run_filter_seed_p2.sh 42 > runs/_driver_p2_filter42.log 2>&1 || { log "filter_p2 s42 FAILED"; exit 1; }
log "filter_p2 s42 done"

# ---- F2/S1: SFT s42 (GPUs 4,5) || filters s200+s201 (CPU/judge, sequential) ----
bash pipeline/run_student_sft_seed_p2.sh 42 4,5 > runs/_driver_p2_sft42.log 2>&1 & S1=$!
( bash pipeline/run_filter_seed_p2.sh 200 > runs/_driver_p2_filter200.log 2>&1 && \
  bash pipeline/run_filter_seed_p2.sh 201 > runs/_driver_p2_filter201.log 2>&1 ) & F1=$!
wait $F1; [ $? -eq 0 ] || { log "filter_p2 s200/s201 FAILED"; exit 1; }
log "filter_p2 s200+s201 done"

# ---- S2: SFT s200 (4,5) || SFT s201 (6,7) ----
wait $S1; [ $? -eq 0 ] || { log "student sft p2 s42 FAILED"; exit 1; }
log "student sft p2 s42 done"
bash pipeline/run_student_sft_seed_p2.sh 200 4,5 > runs/_driver_p2_sft200.log 2>&1 & S2=$!
bash pipeline/run_student_sft_seed_p2.sh 201 6,7 > runs/_driver_p2_sft201.log 2>&1 & S3=$!
wait $S2; [ $? -eq 0 ] || { log "student sft p2 s200 FAILED"; exit 1; }
wait $S3; [ $? -eq 0 ] || { log "student sft p2 s201 FAILED"; exit 1; }
log "student sft p2 s200+s201 done"

# ---- E: QA_I evals (4 shards on GPUs 4,5,6,7), sequential per arm ----
for spec in "treated 42 R035_eval_p2_treated_s42" "ctrlb 42 R036_eval_p2_ctrlb_s42" \
            "treated 200 R037_eval_p2_treated_s200" "ctrlb 200 R038_eval_p2_ctrlb_s200" \
            "treated 201 R039_eval_p2_treated_s201" "ctrlb 201 R040_eval_p2_ctrlb_s201"; do
  set -- $spec
  bash pipeline/run_eval.sh "$1" "$2" "$3" 4,5,6,7 > "runs/_driver_p2_eval_$1$2.log" 2>&1 || { log "eval $1 s$2 FAILED"; exit 1; }
  log "eval $1 s$2 done"
done

# ---- R/V: reliability re-judge panel + verdict ----
bash pipeline/stage.sh R041_rejudge_p2 none $PY pipeline/rejudge_pass2.py > runs/_driver_p2_rejudge.log 2>&1 || { log "rejudge_p2 FAILED"; exit 1; }
bash pipeline/stage.sh R042_verdict_p2 none $PY pipeline/verdict_pass2.py > runs/_driver_p2_verdict.log 2>&1 || { log "verdict_p2 FAILED"; exit 1; }
log "PASS-2 DRIVER COMPLETE"
