#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUNTIME_DIR="$ROOT_DIR/.runtime"
REPO_DIR="$ROOT_DIR/SciAtlas"
VENV_DIR="$RUNTIME_DIR/.venv"

command -v python3 >/dev/null || { echo "python3 is required" >&2; exit 1; }
command -v jq >/dev/null || { echo "jq is required" >&2; exit 1; }

mkdir -p "$RUNTIME_DIR"
[[ -d "$REPO_DIR" ]] || {
  echo "Missing local SciAtlas checkout: $REPO_DIR" >&2
  exit 1
}

python3 -m venv "$VENV_DIR"
"$VENV_DIR/bin/python" -m pip install --upgrade pip
"$VENV_DIR/bin/python" -m pip install -e "$REPO_DIR/sciatlas"
# The workflows only need PyTorch for local embedding/reranking. Use the CPU
# wheel explicitly; the default mirror resolves recent torch releases to CUDA
# 13 packages, which are unnecessary for Flash mode and consume several GB.
"$VENV_DIR/bin/python" -m pip install \
  --index-url "${TORCH_INDEX_URL:-https://download.pytorch.org/whl/cpu}" \
  --extra-index-url "${PYPI_INDEX_URL:-https://pypi.tuna.tsinghua.edu.cn/simple}" \
  "torch==2.6.0+cpu"
sed '/^[[:space:]]*torch[<=>]/d' "$REPO_DIR/requirements-workflows.txt" > "$RUNTIME_DIR/requirements-workflows-cpu.txt"
sed -i "s#^-r requirements.txt#-r $REPO_DIR/requirements.txt#" "$RUNTIME_DIR/requirements-workflows-cpu.txt"
"$VENV_DIR/bin/python" -m pip install -r "$RUNTIME_DIR/requirements-workflows-cpu.txt"
# httpx discovers SOCKS proxy settings from the environment. Install the
# optional transport so local SOCKS-based development proxies do not make the
# OpenAI-compatible Qwen client fail before its first request.
"$VENV_DIR/bin/python" -m pip install "httpx[socks]"

if [[ ! -f "$ROOT_DIR/.env" ]]; then
  echo "Missing $ROOT_DIR/.env" >&2
  exit 1
fi
echo "Setup complete. Fill SCIATLAS_API_KEY and LLM_API_KEY in .env, then run ./run_idea.sh."
