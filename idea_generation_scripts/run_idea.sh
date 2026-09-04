#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${ENV_FILE:-$ROOT_DIR/.env}"
INPUT_FILE="${INPUT_FILE:-$ROOT_DIR/input_question.json}"
IDEA_FILE="${IDEA_FILE:-$ROOT_DIR/idea.md}"
MODE_VALUE="${FULL:-false}"

[[ -f "$ENV_FILE" ]] || { echo "Missing .env; run ./setup.sh first." >&2; exit 1; }
[[ -f "$INPUT_FILE" ]] || { echo "Missing input JSON: $INPUT_FILE" >&2; exit 1; }
[[ -f "$IDEA_FILE" ]] || { echo "Missing idea.md: $IDEA_FILE" >&2; exit 1; }

set -a
source "$ENV_FILE"
set +a

[[ -n "${SCIATLAS_API_KEY:-}" ]] || { echo "SCIATLAS_API_KEY is empty in .env" >&2; exit 1; }
[[ -n "${LLM_API_KEY:-}" ]] || { echo "LLM_API_KEY is empty in .env" >&2; exit 1; }

case "${MODE_VALUE,,}" in
  true|1|yes|full) WORKFLOW=full ;;
  false|0|no|flash) WORKFLOW=flash ;;
  *) echo "FULL must be true or false (received: $MODE_VALUE)" >&2; exit 1 ;;
esac

command -v jq >/dev/null || { echo "jq is required" >&2; exit 1; }
PYTHON="$ROOT_DIR/.runtime/.venv/bin/python"
REPO_DIR="$ROOT_DIR/SciAtlas"
[[ -x "$PYTHON" && -d "$REPO_DIR" ]] || { echo "Run ./setup.sh first." >&2; exit 1; }

QUESTION_TEXT="$(jq -r '.question // empty' "$INPUT_FILE")"
DESCRIPTION_TEXT="$(jq -r '.description // empty' "$INPUT_FILE")"
CATEGORY_TEXT="$(jq -r '.category // empty' "$INPUT_FILE")"
[[ -n "$QUESTION_TEXT" ]] || { echo "input JSON must contain a non-empty question" >&2; exit 1; }

EXTRA_TEXT="$(sed '/^#/d' "$IDEA_FILE" | sed '/^[[:space:]]*$/d')"
TOPIC="Research question: $QUESTION_TEXT"
[[ -n "$CATEGORY_TEXT" ]] && TOPIC+=$'\nTarget category: '"$CATEGORY_TEXT"
[[ -n "$DESCRIPTION_TEXT" ]] && TOPIC+=$'\nContext: '"$DESCRIPTION_TEXT"
[[ -n "$EXTRA_TEXT" ]] && TOPIC+=$'\nAdditional instructions: '"$EXTRA_TEXT"

STAMP="$(date +%Y%m%d-%H%M%S)"
RUNS_ROOT="${RUNS_DIR:-$ROOT_DIR/runs}"
OUTPUT_DIR="$RUNS_ROOT/${STAMP}-${WORKFLOW}"
mkdir -p "$OUTPUT_DIR"

cd "$REPO_DIR"
exec "$PYTHON" -m sciatlas_idea_gen.main "$TOPIC" \
  --workflow "$WORKFLOW" \
  --domain "${CATEGORY_TEXT:-}" \
  --output-dir "$OUTPUT_DIR" \
  --timeout "${SCIATLAS_TIMEOUT:-900}"
