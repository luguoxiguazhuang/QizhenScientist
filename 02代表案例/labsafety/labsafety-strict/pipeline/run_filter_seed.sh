#!/bin/bash
# Per-seed lenient filter + equalization + re-scan dispatch (CPU/judge only).
# usage: run_filter_seed.sh <seed>
set -u
SEED=$1
PY=/REDACTED/miniconda3/envs/subliminal_mm/bin/python
cd /REDACTED/tiaozhanbei/demo/labsafety
RUN_ID="filter_s$SEED"
bash pipeline/stage.sh "$RUN_ID" none $PY pipeline/filter_lenient.py --seed $SEED --clusters results/clusters.json
exit $?
