#!/bin/bash
# Pass-2 resume driver (after the BPE boundary-mask fix).
# Re-runs: treated SFT s42 (retry w/ boundary fallback) -> SFT s200/s201 ->
# 6 QA_I evals -> re-judge panel -> verdict. Waits for the original driver to
# exit and for the orphaned filter subshell (s200, then s201) to finish each
# seed's pool before consuming GPUs for that seed's SFT. GPUs 4,5,6,7 only.
set -u
cd /REDACTED/tiaozhanbei/demo/labsafety
PY=/REDACTED/miniconda3/envs/subliminal_mm/bin/python
log() { echo "[$(date -u +%FT%TZ)] $*"; }

OLD_DRIVER_PID=${1:-}
if [ -n "$OLD_DRIVER_PID" ]; then
  while kill -0 "$OLD_DRIVER_PID" 2>/dev/null; do sleep 20; done
  log "old driver exited"
fi
# ensure no stray student_sft from pass-2 attempt 1 remains
while pgrep -f "pipeline/student_sft.py" > /dev/null; do sleep 20; done
log "no stray student_sft processes"

# ---- treated s42 retry (boundary fallback), GPU 4 ----
bash pipeline/stage.sh R032_student_sft_p2_s42_treated_retry 4 $PY pipeline/student_sft.py \
  --arm treated --seed 42 --data runs/filter_p2_s42/student_data_treated.json \
  --adapter_out results/adapters/student_treated_s42 --boundary_fallback \
  > runs/_driver_p2_sft42_retry.log 2>&1 || { log "student sft p2 s42 treated retry FAILED"; exit 1; }
log "student sft p2 s42 treated retry done"

# ---- SFT s200 (4,5) || SFT s201 (6,7), each gated on its filter completion ----
while [ ! -f runs/filter_p2_s200/filter_stats.json ]; do sleep 30; done
log "filter_p2 s200 complete"
bash pipeline/run_student_sft_seed_p2.sh 200 4,5 > runs/_driver_p2_sft200.log 2>&1 & S2=$!
( while [ ! -f runs/filter_p2_s201/filter_stats.json ]; do sleep 30; done
  log "filter_p2 s201 complete"
  bash pipeline/run_student_sft_seed_p2.sh 201 6,7 > runs/_driver_p2_sft201.log 2>&1 ) & S3=$!
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
log "PASS-2 RESUME DRIVER COMPLETE"
