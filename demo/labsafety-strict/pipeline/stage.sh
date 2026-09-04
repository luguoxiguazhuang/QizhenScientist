#!/bin/bash
# Generic stage dispatcher: wraps a command with cost.json bookkeeping.
# usage: stage.sh <run_id> <gpu_ids_csv_or_none> <cmd...>
set -u
RUN_ID=$1; GPUS=$2; shift 2
DIR="runs/$RUN_ID"; mkdir -p "$DIR"
START=$(date -u +%s); START_ISO=$(date -u +%Y-%m-%dT%H:%M:%SZ)
if [ "$GPUS" = "none" ] || [ -z "$GPUS" ]; then NGPU=0; GPU_JSON="[]"; else
  NGPU=$(echo "$GPUS" | tr ',' '\n' | grep -c .)
  GPU_JSON="[$(echo "$GPUS" | sed 's/,/, /g')]"
fi
cat > "$DIR/cost.json" <<EOF
{"run_id": "$RUN_ID", "status": "running", "started_at": "$START_ISO", "ended_at": null, "gpu_ids": $GPU_JSON, "gpu_provider": "local", "wall_clock_seconds": null, "gpu_seconds": null, "gpu_hours": null}
EOF
echo "[stage $RUN_ID] start gpus=$GPUS cmd: $*"
if [ "$NGPU" -gt 0 ]; then
  CUDA_VISIBLE_DEVICES="$GPUS" "$@" > "$DIR/run.log" 2>&1
else
  "$@" > "$DIR/run.log" 2>&1
fi
RC=$?
END=$(date -u +%s); WALL=$((END-START))
GH=$(python3 -c "print(round($WALL*$NGPU/3600, 4))")
STATUS=done; [ $RC -ne 0 ] && STATUS=failed
cat > "$DIR/cost.json" <<EOF
{"run_id": "$RUN_ID", "status": "$STATUS", "started_at": "$START_ISO", "ended_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)", "gpu_ids": $GPU_JSON, "gpu_provider": "local", "wall_clock_seconds": $WALL, "gpu_seconds": $((WALL*NGPU)), "gpu_hours": $GH}
EOF
echo "[stage $RUN_ID] exit=$RC wall=${WALL}s gpu_hours=$GH status=$STATUS"
exit $RC
