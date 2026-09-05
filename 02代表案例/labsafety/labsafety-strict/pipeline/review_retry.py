"""Code-review retry with extended timeout (reasoning model needs long reads)."""
import httpx
import time

BASE = "https://redacted.invalid/compatible-mode/v1"
KEY = "REDACTED_API_KEY"
prompt = open("refine-logs/code_review_prompt_exp.txt", encoding="utf-8").read()
payload = {"model": "qwen3.8-max", "messages": [{"role": "user", "content": prompt}],
           "temperature": 0.2, "stream": False}
H = {"Authorization": f"Bearer {KEY}", "Content-Type": "application/json"}
deadline = time.time() + 5400
last = None
ok = False
with httpx.Client(trust_env=False) as c:
    while time.time() < deadline:
        try:
            r = c.post(BASE + "/chat/completions", json=payload, headers=H, timeout=1700)
            if r.status_code == 200:
                d = r.json()
                content = d["choices"][0]["message"].get("content") or ""
                open("refine-logs/code_review_response_exp.txt", "w", encoding="utf-8").write(content)
                print("OK wrote", len(content), "chars")
                ok = True
                break
            last = f"HTTP {r.status_code}: {r.text[:200]}"
            print("retry:", last, flush=True)
            time.sleep(30)
        except Exception as e:
            last = f"{type(e).__name__}: {e}"
            print("retry:", last, flush=True)
            time.sleep(30)
if not ok:
    print("FAILED:", last)
