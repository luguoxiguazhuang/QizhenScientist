#!/bin/bash
# Pass-2 per-seed lenient filter + equalization + re-scan (CPU/judge only).
# usage: run_filter_seed_p2.sh <seed>
set -u
SEED=$1
PY=/REDACTED/miniconda3/envs/subliminal_mm/bin/python
cd /REDACTED/tiaozhanbei/demo/labsafety
RUN_ID="filter_p2_s$SEED"
bash pipeline/stage.sh "$RUN_ID" none $PY pipeline/filter_lenient_pass2.py --seed $SEED --clusters results/clusters.json
exit $?
