#!/bin/bash
# Per-seed student SFT dispatch: treated on first GPU, ctrlb on second GPU (parallel).
# usage: run_student_sft_seed.sh <seed> [gpus default 4,5]
set -u
SEED=$1; GPUS=${2:-4,5}
PY=/REDACTED/miniconda3/envs/subliminal_mm/bin/python
cd /REDACTED/tiaozhanbei/demo/labsafety
IFS=',' read -ra G <<< "$GPUS"
RUN_ID="student_sft_s$SEED"
DIR="runs/$RUN_ID"; mkdir -p "$DIR"
START=$(date -u +%s); START_ISO=$(date -u +%Y-%m-%dT%H:%M:%SZ)
GJSON="[$(echo "$GPUS" | sed 's/,/, /g')]"
cat > "$DIR/cost.json" <<EOF
{"run_id": "$RUN_ID", "status": "running", "started_at": "$START_ISO", "ended_at": null, "gpu_ids": $GJSON, "gpu_provider": "local", "wall_clock_seconds": null, "gpu_seconds": null, "gpu_hours": null}
EOF
CUDA_VISIBLE_DEVICES=${G[0]} nohup $PY pipeline/student_sft.py --arm treated --seed $SEED \
  --data runs/filter_s$SEED/student_data_treated.json \
  --adapter_out results/adapters/student_treated_s$SEED > "$DIR/treated.log" 2>&1 &
P1=$!
CUDA_VISIBLE_DEVICES=${G[1]} nohup $PY pipeline/student_sft.py --arm ctrlb --seed $SEED \
  --data runs/filter_s$SEED/student_data_ctrlb.json \
  --adapter_out results/adapters/student_ctrlb_s$SEED > "$DIR/ctrlb.log" 2>&1 &
P2=$!
wait $P1 $P2
RC=$?
END=$(date -u +%s); WALL=$((END-START)); NG=${#G[@]}
GH=$(python3 -c "print(round($WALL*$NG/3600, 4))")
STATUS=done; [ $RC -ne 0 ] && STATUS=failed
cat > "$DIR/cost.json" <<EOF
{"run_id": "$RUN_ID", "status": "$STATUS", "started_at": "$START_ISO", "ended_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)", "gpu_ids": $GJSON, "gpu_provider": "local", "wall_clock_seconds": $WALL, "gpu_seconds": $((WALL*NG)), "gpu_hours": $GH}
EOF
echo "[student-sft seed=$SEED] exit=$RC wall=${WALL}s gpu_hours=$GH"
exit $RC
