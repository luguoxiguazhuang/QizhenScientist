#!/usr/bin/env python3
"""Faithful standalone replica of the mechanic-db MCP server's run_search().

Used because the mcp__mechanic-db__search_papers tool is not exposed in this
execution context; the HTTP protocol (submit -> poll -> write JSON) is copied
verbatim from mcp-servers/mechanic-db/server.py.
"""
import json, os, sys, time
import httpx

BASE_URL = (os.environ.get("MECHANIC_DB_BASE_URL") or "http://mechanist.openkg.cn").rstrip("/")
API_KEY = (os.environ.get("MECHANIC_DB_API_KEY") or "").strip()
TERMINAL_OK = {"succeeded", "completed", "done", "finished"}
TERMINAL_ERR = {"failed", "error", "canceled", "stopped"}
CONCURRENCY_BACKOFF_S = 30

def describe_error(resp):
    try:
        detail = resp.json().get("detail")
    except Exception:
        detail = None
    if detail is None:
        detail = resp.text[:300]
    if not isinstance(detail, str):
        detail = json.dumps(detail, ensure_ascii=False)
    return f"HTTP {resp.status_code}: {detail}"

def retry_after_seconds(resp, default):
    header = resp.headers.get("retry-after", "").strip()
    if header.isdigit():
        return max(1, int(header))
    try:
        seconds = resp.json().get("detail", {}).get("retry_after_seconds")
    except Exception:
        seconds = None
    return max(1, int(seconds)) if isinstance(seconds, (int, float)) else default

def submit(client, headers, payload, deadline):
    attempt = 0
    while True:
        attempt += 1
        resp = client.post(f"{BASE_URL}/search", json=payload, headers=headers, timeout=60)
        if resp.status_code == 202:
            job_id = resp.json().get("job_id")
            if not job_id:
                raise RuntimeError(f"malformed submit response: {resp.text[:500]}")
            return job_id
        if resp.status_code == 401:
            raise RuntimeError("mechanic-db rejected the API key. " + describe_error(resp))
        if resp.status_code == 429:
            wait = retry_after_seconds(resp, CONCURRENCY_BACKOFF_S)
            if time.time() + wait >= deadline:
                raise RuntimeError(f"submission refused until budget ran out after {attempt} attempts: {describe_error(resp)}")
            print(f"[client] submit refused (attempt {attempt}), retrying in {wait}s: {describe_error(resp)}", flush=True)
            time.sleep(wait)
            continue
        raise RuntimeError(f"mechanic-db submit failed: {describe_error(resp)}")

def poll(client, headers, job_id, deadline, interval_s=10):
    while time.time() < deadline:
        resp = client.get(f"{BASE_URL}/jobs/{job_id}", headers=headers, timeout=60)
        if resp.status_code == 429:
            wait = retry_after_seconds(resp, interval_s)
            time.sleep(wait)
            continue
        if resp.status_code != 200:
            raise RuntimeError(f"polling job {job_id} failed: {describe_error(resp)}")
        data = resp.json()
        status = data.get("status", "")
        print(f"[client] job {job_id} status={status}", flush=True)
        if status in TERMINAL_OK:
            return data
        if status in TERMINAL_ERR:
            raise RuntimeError(f"job {job_id} ended as {status}: {data.get('error', data)}")
        time.sleep(interval_s)
    raise TimeoutError(f"polling exceeded budget for job {job_id}")

def main():
    with open(sys.argv[1], "r", encoding="utf-8") as f:
        args = json.load(f)
    output = args["output"]
    headers = {"Authorization": f"Bearer {API_KEY}"} if API_KEY else {}
    timeout_s = args.get("timeout", 1200)
    payload = {
        "top_k": args.get("top_k", 300),
        "temporal_mode": args.get("temporal_mode", "default"),
    }
    decomposed = args.get("decomposed")
    if decomposed is not None:
        payload["decomposed"] = decomposed
        payload["query"] = decomposed.get("original_query") or args.get("query") or ""
    else:
        payload["query"] = args.get("query", "")
    deadline = time.time() + timeout_s
    with httpx.Client(trust_env=False) as client:
        job_id = submit(client, headers, payload, deadline)
        print(f"[client] submitted job_id={job_id}", flush=True)
        result = poll(client, headers, job_id, deadline, args.get("poll_interval", 10))
    if not result.get("papers") and isinstance(result.get("result"), dict):
        result["papers"] = result["result"].get("papers", [])
    result.setdefault("papers", [])
    result["skipped"] = False
    result["tier"] = "registered" if API_KEY else "anonymous"
    os.makedirs(os.path.dirname(os.path.abspath(output)) or ".", exist_ok=True)
    with open(output, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    print(json.dumps({"skipped": False, "tier": result["tier"], "count": len(result["papers"]), "output": output}))

if __name__ == "__main__":
    main()
