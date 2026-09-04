#!/bin/bash
# Per-seed generation dispatch (parametric GPUs).
# usage: run_gen_seed.sh <seed> <run_id> [gpus default 4,5,6,7]
# First two GPUs run treated shards 0/1 (nshards=2); last two run ctrlb shards 0/1.
set -u
SEED=$1; RUN_ID=$2; GPUS=${3:-4,5,6,7}
PY=/REDACTED/miniconda3/envs/subliminal_mm/bin/python
cd /REDACTED/tiaozhanbei/demo/labsafety
IFS=',' read -ra G <<< "$GPUS"
DIR="runs/$RUN_ID"; mkdir -p "$DIR/logs" "runs/gen_s$SEED/treated" "runs/gen_s$SEED/ctrlb"
START=$(date -u +%s); START_ISO=$(date -u +%Y-%m-%dT%H:%M:%SZ)
GJSON="[$(echo "$GPUS" | sed 's/,/, /g')]"
cat > "$DIR/cost.json" <<EOF
{"run_id": "$RUN_ID", "status": "running", "started_at": "$START_ISO", "ended_at": null, "gpu_ids": $GJSON, "gpu_provider": "local", "wall_clock_seconds": null, "gpu_seconds": null, "gpu_hours": null}
EOF
CUDA_VISIBLE_DEVICES=${G[0]} nohup $PY pipeline/generate.py --arm treated --seed $SEED --nshards 2 --shard 0 --outdir runs/gen_s$SEED/treated > "$DIR/logs/treated_0.log" 2>&1 &
P1=$!
CUDA_VISIBLE_DEVICES=${G[1]} nohup $PY pipeline/generate.py --arm treated --seed $SEED --nshards 2 --shard 1 --outdir runs/gen_s$SEED/treated > "$DIR/logs/treated_1.log" 2>&1 &
P2=$!
CUDA_VISIBLE_DEVICES=${G[2]} nohup $PY pipeline/generate.py --arm ctrlb --seed $SEED --nshards 2 --shard 0 --outdir runs/gen_s$SEED/ctrlb > "$DIR/logs/ctrlb_0.log" 2>&1 &
P3=$!
CUDA_VISIBLE_DEVICES=${G[3]} nohup $PY pipeline/generate.py --arm ctrlb --seed $SEED --nshards 2 --shard 1 --outdir runs/gen_s$SEED/ctrlb > "$DIR/logs/ctrlb_1.log" 2>&1 &
P4=$!
wait $P1 $P2 $P3 $P4
RC=$?
END=$(date -u +%s); WALL=$((END-START)); NG=${#G[@]}
GH=$(python3 -c "print(round($WALL*$NG/3600, 4))")
STATUS=done; [ $RC -ne 0 ] && STATUS=failed
cat > "$DIR/cost.json" <<EOF
{"run_id": "$RUN_ID", "status": "$STATUS", "started_at": "$START_ISO", "ended_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)", "gpu_ids": $GJSON, "gpu_provider": "local", "wall_clock_seconds": $WALL, "gpu_seconds": $((WALL*NG)), "gpu_hours": $GH}
EOF
echo "[gen seed=$SEED] exit=$RC wall=${WALL}s gpu_hours=$GH"
exit $RC
