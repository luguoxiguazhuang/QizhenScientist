import os, re, torch, time, warnings
warnings.filterwarnings("ignore")
MODEL = "/REDACTED/models/Qwen3.5-9B"
from transformers import AutoTokenizer, AutoModelForCausalLM
tok = AutoTokenizer.from_pretrained(MODEL, trust_remote_code=True)
m = AutoModelForCausalLM.from_pretrained(MODEL, torch_dtype=torch.bfloat16, trust_remote_code=True).to("cuda")
# what attention module classes exist and their proj children
import torch.nn as nn
from collections import Counter
cls_counter = Counter()
child_by_cls = {}
for name, mod in m.named_modules():
    cn = type(mod).__name__
    if "Attention" in cn or "attention" in name.split(".")[-1] or cn in ("Mamba",):
        kids = [k for k,_ in mod.named_children()]
        key = cn
        if key not in child_by_cls:
            child_by_cls[key] = kids
        cls_counter[key]+=1
for k,v in cls_counter.items(): print(k, "x", v, "children:", child_by_cls[k])
# distinct leaf proj names
leaf = Counter(n.split(".")[-1] for n,_ in m.named_modules() if n.endswith(("_proj","linear","in_proj")))
print("leaf proj-ish names:", dict(leaf))
# generate test (fixed)
ids = tok.apply_chat_template([{"role":"user","content":"Say exactly: probe-ok"}], add_generation_prompt=True, enable_thinking=False)
inp = torch.tensor([ids]).to("cuda")
torch.manual_seed(42)
out = m.generate(inp, do_sample=True, temperature=1.0, top_p=1.0, top_k=0, max_new_tokens=32)
print("sampled gen:", repr(tok.decode(out[0][inp.shape[1]:], skip_special_tokens=True)[:100]))
out2 = m.generate(inp, do_sample=False, max_new_tokens=32)
print("greedy gen:", repr(tok.decode(out2[0][inp.shape[1]:], skip_special_tokens=True)[:100]))
print("eos token id:", tok.eos_token_id, "| special:", {k:v for k,v in tok.special_tokens_map.items()})
del m; torch.cuda.empty_cache()
print("PROBE2 DONE")
