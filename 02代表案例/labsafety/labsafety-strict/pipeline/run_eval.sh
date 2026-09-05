#!/bin/bash
# QA_I eval dispatch (parametric GPUs): one generation shard per GPU, then master judge stage (CPU).
# usage: run_eval.sh <arm> <seed> <run_id> [gpus default 4,5,6,7]
set -u
ARM=$1; SEED=$2; RUN_ID=$3; GPUS=${4:-4,5,6,7}
PY=/REDACTED/miniconda3/envs/subliminal_mm/bin/python
cd /REDACTED/tiaozhanbei/demo/labsafety
IFS=',' read -ra G <<< "$GPUS"
NSHARDS=${#G[@]}
if [ "$ARM" = "ctrlA" ]; then OUTDIR="runs/eval_ctrlA/ctrlA"; else OUTDIR="runs/eval_s$SEED/$ARM"; fi
DIR="runs/$RUN_ID"; mkdir -p "$DIR/logs" "$OUTDIR"
START=$(date -u +%s); START_ISO=$(date -u +%Y-%m-%dT%H:%M:%SZ)
GJSON="[$(echo "$GPUS" | sed 's/,/, /g')]"
cat > "$DIR/cost.json" <<EOF
{"run_id": "$RUN_ID", "status": "running", "started_at": "$START_ISO", "ended_at": null, "gpu_ids": $GJSON, "gpu_provider": "local", "wall_clock_seconds": null, "gpu_seconds": null, "gpu_hours": null}
EOF
PIDS=()
for i in $(seq 0 $((NSHARDS-1))); do
  CUDA_VISIBLE_DEVICES=${G[$i]} nohup $PY pipeline/eval_qai.py --arm $ARM --seed $SEED --nshards $NSHARDS --shard $i --outdir "$OUTDIR" > "$DIR/logs/shard_$i.log" 2>&1 &
  PIDS+=($!)
done
wait "${PIDS[@]}"
RC=$?
if [ $RC -eq 0 ]; then
  $PY pipeline/eval_qai.py --arm $ARM --seed $SEED --shard -1 --outdir "$OUTDIR" > "$DIR/judge.log" 2>&1
  RC=$?
fi
END=$(date -u +%s); WALL=$((END-START)); NG=${#G[@]}
GH=$(python3 -c "print(round($WALL*$NG/3600, 4))")
STATUS=done; [ $RC -ne 0 ] && STATUS=failed
cat > "$DIR/cost.json" <<EOF
{"run_id": "$RUN_ID", "status": "$STATUS", "started_at": "$START_ISO", "ended_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)", "gpu_ids": $GJSON, "gpu_provider": "local", "wall_clock_seconds": $WALL, "gpu_seconds": $((WALL*NG)), "gpu_hours": $GH}
EOF
echo "[eval arm=$ARM seed=$SEED] exit=$RC wall=${WALL}s gpu_hours=$GH"
exit $RC
