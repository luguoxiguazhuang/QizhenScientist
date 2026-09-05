#!/usr/bin/env python3
"""Replica of the llm-chat MCP `chat` tool: OpenAI-compatible call to the
configured reviewer endpoint (LLM_BASE_URL / LLM_MODEL / LLM_API_KEY env).
Usage: python3 reviewer_call.py <prompt_file> <output_file> [temperature]
The response `content` field (final answer of the reasoning model) is written
to the output file; reasoning_content is discarded.
"""
import json, os, sys, time
import httpx

BASE_URL = os.environ.get("LLM_BASE_URL", "https://api.openai.com/v1").rstrip("/")
API_KEY = os.environ.get("LLM_API_KEY", "")
MODEL = os.environ.get("LLM_MODEL", "qwen3.8-max")

def main():
    prompt_file, out_file = sys.argv[1], sys.argv[2]
    temperature = float(sys.argv[3]) if len(sys.argv) > 3 else 0.7
    system = sys.argv[4] if len(sys.argv) > 4 else None
    prompt = open(prompt_file, encoding="utf-8").read()
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})
    payload = {
        "model": MODEL,
        "messages": messages,
        "temperature": temperature,
        "stream": False,
    }
    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
    deadline = time.time() + 1200
    last_err = None
    with httpx.Client(trust_env=False) as client:
        while time.time() < deadline:
            try:
                resp = client.post(f"{BASE_URL}/chat/completions", json=payload, headers=headers, timeout=600)
                if resp.status_code == 200:
                    data = resp.json()
                    content = data["choices"][0]["message"].get("content") or ""
                    open(out_file, "w", encoding="utf-8").write(content)
                    print(f"OK wrote {len(content)} chars to {out_file}")
                    return
                last_err = f"HTTP {resp.status_code}: {resp.text[:300]}"
                print(f"retry after: {last_err}", flush=True)
                time.sleep(20)
            except Exception as e:
                last_err = f"{type(e).__name__}: {e}"
                print(f"retry after: {last_err}", flush=True)
                time.sleep(20)
    print(f"FAILED: {last_err}")
    sys.exit(1)

if __name__ == "__main__":
    main()
