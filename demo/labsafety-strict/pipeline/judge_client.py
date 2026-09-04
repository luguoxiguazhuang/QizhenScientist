"""Checkpointed, rate-limited, resumable, parallel-safe client for the
qwen3.8-max judge endpoint (reasoning model: parse `content` only) and the
qwen3.7-text-embedding endpoint.

Checkpoint format: one JSON line per completed call in `<ckpt>.jsonl`:
  {"id": ..., "content": ..., "status": "ok"|"error", "attempts": k, "ts": ...}
Resume skips ids already present. Items are never dropped silently: on
exhausted retries they are recorded with status="error" and re-attempted on a
later resume unless `allow_error_terminal` is set.
"""
import json
import os
import random
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

import httpx

from common import JUDGE_API_KEY, JUDGE_BASE_URL, JUDGE_MODEL, EMBED_MODEL, EMBED_DIM

_HEADERS = {"Authorization": f"Bearer {JUDGE_API_KEY}", "Content-Type": "application/json"}


class JudgeClient:
    def __init__(self, checkpoint_path: str, concurrency: int = 48,
                 model: str = JUDGE_MODEL, temperature: float = 0.0,
                 max_tokens: int = 1024, timeout: float = 300.0,
                 max_attempts: int = 10, base_backoff: float = 2.0):
        self.ckpt = checkpoint_path
        self.concurrency = concurrency
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.timeout = timeout
        self.max_attempts = max_attempts
        self.base_backoff = base_backoff
        os.makedirs(os.path.dirname(checkpoint_path), exist_ok=True)
        self._lock = threading.Lock()
        self._tls = threading.local()
        self.done = self._load_done()

    # ---------- checkpoint ----------
    def _load_done(self):
        done = {}
        if os.path.exists(self.ckpt):
            with open(self.ckpt, encoding="utf-8") as f:
                for ln in f:
                    ln = ln.strip()
                    if not ln:
                        continue
                    try:
                        rec = json.loads(ln)
                        if rec.get("status") == "ok":
                            done[rec["id"]] = rec
                    except json.JSONDecodeError:
                        continue
        return done

    def _append(self, rec):
        with self._lock:
            with open(self.ckpt, "a", encoding="utf-8") as f:
                f.write(json.dumps(rec, ensure_ascii=False) + "\n")
                f.flush()

    def _client(self):
        if not hasattr(self._tls, "client"):
            self._tls.client = httpx.Client(trust_env=False, timeout=self.timeout)
        return self._tls.client

    # ---------- calls ----------
    def _one_call(self, item):
        iid, messages = item["id"], item["messages"]
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": self.temperature,
            "stream": False,
        }
        if self.max_tokens:
            payload["max_tokens"] = self.max_tokens
        if item.get("response_format_extra"):
            payload.update(item["response_format_extra"])
        client = self._client()
        last_err = None
        for attempt in range(1, self.max_attempts + 1):
            try:
                r = client.post(f"{JUDGE_BASE_URL}/chat/completions", json=payload, headers=_HEADERS)
                if r.status_code == 200:
                    d = r.json()
                    msg = d["choices"][0]["message"]
                    content = msg.get("content") or ""
                    rec = {"id": iid, "content": content, "status": "ok",
                           "attempts": attempt, "ts": time.time(),
                           "usage": d.get("usage", {})}
                    self._append(rec)
                    self.done[iid] = rec
                    return rec
                last_err = f"HTTP {r.status_code}: {r.text[:200]}"
            except Exception as e:  # noqa: BLE001
                last_err = f"{type(e).__name__}: {str(e)[:200]}"
            sleep_s = min(self.base_backoff * (2 ** (attempt - 1)), 60.0) + random.random() * 1.5
            time.sleep(sleep_s)
        rec = {"id": iid, "content": "", "status": "error", "error": last_err,
               "attempts": self.max_attempts, "ts": time.time()}
        self._append(rec)
        return rec

    def run(self, items, progress_every=200, tag="judge"):
        """items: [{"id": str, "messages": [...]}]. Returns {id: record}."""
        todo = [it for it in items if it["id"] not in self.done]
        print(f"[{tag}] total={len(items)} done={len(items) - len(todo)} todo={len(todo)} "
              f"concurrency={self.concurrency}", flush=True)
        if not todo:
            return self.done
        t0 = time.time()
        finished = 0
        with ThreadPoolExecutor(max_workers=self.concurrency) as ex:
            futs = [ex.submit(self._one_call, it) for it in todo]
            for fu in as_completed(futs):
                fu.result()
                finished += 1
                if finished % progress_every == 0:
                    el = time.time() - t0
                    print(f"[{tag}] {finished}/{len(todo)} in {el:.0f}s "
                          f"({finished / el:.1f}/s)", flush=True)
        n_err = sum(1 for it in todo if self.done.get(it["id"], {}).get("status") != "ok")
        print(f"[{tag}] finished {len(todo)} calls in {time.time() - t0:.0f}s, errors={n_err}", flush=True)
        return self.done


class EmbedClient:
    """Batched, checkpointed embeddings via the endpoint (one .jsonl checkpoint
    of {idx: vector} so partial failures resume)."""

    def __init__(self, checkpoint_path: str, batch_size: int = 10, concurrency: int = 8,
                 timeout: float = 120.0, max_attempts: int = 8):
        self.ckpt = checkpoint_path
        self.batch_size = batch_size
        self.concurrency = concurrency
        self.timeout = timeout
        self.max_attempts = max_attempts
        os.makedirs(os.path.dirname(checkpoint_path), exist_ok=True)
        self._lock = threading.Lock()
        self._tls = threading.local()
        self.done = self._load_done()

    def _load_done(self):
        done = {}
        if os.path.exists(self.ckpt):
            with open(self.ckpt, encoding="utf-8") as f:
                for ln in f:
                    ln = ln.strip()
                    if not ln:
                        continue
                    try:
                        rec = json.loads(ln)
                        done[rec["id"]] = rec["vec"]
                    except (json.JSONDecodeError, KeyError):
                        continue
        return done

    def _client(self):
        if not hasattr(self._tls, "client"):
            self._tls.client = httpx.Client(trust_env=False, timeout=self.timeout)
        return self._tls.client

    def _one_batch(self, batch):
        texts = [t for _, t in batch]
        payload = {"model": EMBED_MODEL, "input": texts, "dimensions": EMBED_DIM}
        client = self._client()
        last_err = None
        for attempt in range(1, self.max_attempts + 1):
            try:
                r = client.post(f"{JUDGE_BASE_URL}/embeddings", json=payload, headers=_HEADERS)
                if r.status_code == 200:
                    d = r.json()
                    vecs = [x["embedding"] for x in sorted(d["data"], key=lambda z: z["index"])]
                    bad_dim = [len(v) for v in vecs if len(v) != EMBED_DIM]
                    if bad_dim and len(batch) > 1:
                        # endpoint anomaly: some batches come back from a larger-dim backend.
                        # Fall back to single-item calls (which return the correct dim).
                        print(f"[embed] batch dim mismatch {bad_dim[:3]}... -> per-item fallback", flush=True)
                        for iid, txt in batch:
                            if iid in self.done:
                                continue
                            self._one_batch([(iid, txt)])
                        return
                    if bad_dim:
                        last_err = f"embedding dim mismatch: got {bad_dim}, expected {EMBED_DIM}"
                        raise ValueError(last_err)
                    with self._lock:
                        with open(self.ckpt, "a", encoding="utf-8") as f:
                            for (iid, _), v in zip(batch, vecs):
                                f.write(json.dumps({"id": iid, "vec": v}) + "\n")
                            f.flush()
                    for (iid, _), v in zip(batch, vecs):
                        self.done[iid] = v
                    return
                last_err = f"HTTP {r.status_code}: {r.text[:200]}"
            except Exception as e:  # noqa: BLE001
                last_err = f"{type(e).__name__}: {str(e)[:200]}"
            time.sleep(min(2.0 * (2 ** (attempt - 1)), 30.0) + random.random())
        raise RuntimeError(f"embedding batch failed after {self.max_attempts} attempts: {last_err}")

    def run(self, items, tag="embed"):
        """items: [(id, text), ...]. Returns {id: vector}."""
        todo = [it for it in items if it[0] not in self.done]
        print(f"[{tag}] total={len(items)} done={len(items) - len(todo)} todo={len(todo)}", flush=True)
        batches = [todo[i:i + self.batch_size] for i in range(0, len(todo), self.batch_size)]
        t0 = time.time()
        if batches:
            with ThreadPoolExecutor(max_workers=self.concurrency) as ex:
                futs = [ex.submit(self._one_batch, b) for b in batches]
                done_b = 0
                for fu in as_completed(futs):
                    fu.result()
                    done_b += 1
                    if done_b % 50 == 0:
                        print(f"[{tag}] batch {done_b}/{len(batches)} {time.time() - t0:.0f}s", flush=True)
        print(f"[{tag}] finished in {time.time() - t0:.0f}s", flush=True)
        missing = [iid for iid, _ in items if iid not in self.done]
        assert not missing, f"embedding checkpoint incomplete: {len(missing)} ids missing (e.g. {missing[:3]})"
        return self.done
