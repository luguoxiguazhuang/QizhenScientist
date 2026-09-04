"""Probe: model classes, LoRA target module names, chat template, processor."""
import os, json, re, torch, time

MODEL = "/REDACTED/models/Qwen3.5-9B"
t0 = time.time()
print("== tokenizer / processor ==")
from transformers import AutoTokenizer, AutoProcessor, AutoModelForCausalLM
tok = AutoTokenizer.from_pretrained(MODEL, trust_remote_code=True)
print("tokenizer ok; chat_template has enable_thinking:", "enable_thinking" in (tok.chat_template or ""))
msgs = [{"role": "user", "content": "What is 1+1?"}]
for etk in (False,):
    ids = tok.apply_chat_template(msgs, add_generation_prompt=True, enable_thinking=etk, return_tensors=None)
    s = tok.decode(ids)
    print("template sample (enable_thinking=False):", repr(s[:200]))
try:
    proc = AutoProcessor.from_pretrained(MODEL, trust_remote_code=True)
    print("processor ok:", type(proc).__name__)
except Exception as e:
    print("processor FAIL:", type(e).__name__, str(e)[:200])

print("== AutoModelForCausalLM load ==")
import warnings; warnings.filterwarnings("ignore")
m = AutoModelForCausalLM.from_pretrained(MODEL, torch_dtype=torch.bfloat16, trust_remote_code=True)
m = m.to("cuda")
print("loaded in", round(time.time()-t0,1), "s; class:", type(m).__name__)
names = [n for n,_ in m.named_modules()]
qkv = [n for n in names if re.search(r"(q_proj|k_proj|v_proj|o_proj|gate_proj|up_proj|down_proj)$", n)]
TEACHER_RE = re.compile(r"^model\.layers\..*(q_proj|k_proj|v_proj|o_proj|gate_proj|up_proj|down_proj)$")
matched = [n for n in qkv if TEACHER_RE.match(n)]
print("total proj modules:", len(qkv), "| teacher-regex matched:", len(matched))
print("examples:", matched[:3], "...", matched[-2:] if len(matched)>3 else "")
unmatched = [n for n in qkv if not TEACHER_RE.match(n)]
print("unmatched examples:", unmatched[:5])
# generate test with sampling protocol
inp = tok.apply_chat_template([{"role":"user","content":"Say exactly: probe-ok"}], add_generation_prompt=True, enable_thinking=False, return_tensors="pt").to("cuda")
torch.manual_seed(42)
out = m.generate(inp, do_sample=True, temperature=1.0, top_p=1.0, top_k=0, max_new_tokens=32)
print("gen sample:", repr(tok.decode(out[0][inp.shape[1]:], skip_special_tokens=True)[:120]))
del m; torch.cuda.empty_cache()
print("== causal LM probe done ==")
