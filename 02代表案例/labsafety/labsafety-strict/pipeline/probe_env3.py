import os, re, io, torch, time, warnings
warnings.filterwarnings("ignore")
MODEL = "/REDACTED/models/Qwen3.5-9B"
from transformers import AutoProcessor, AutoModelForImageTextToText
from PIL import Image
import pandas as pd

t0=time.time()
proc = AutoProcessor.from_pretrained(MODEL, trust_remote_code=True)
print("processor:", type(proc).__name__, round(time.time()-t0,1),"s")
m = AutoModelForImageTextToText.from_pretrained(MODEL, dtype=torch.bfloat16, trust_remote_code=True).to("cuda")
print("model:", type(m).__name__, round(time.time()-t0,1),"s")
STUDENT_RE = re.compile(r"^model\.language_model\..*(q_proj|k_proj|v_proj|o_proj|gate_proj|up_proj|down_proj)$")
TEACHER_STYLE = re.compile(r"^model\.layers\..*(q_proj|k_proj|v_proj|o_proj|gate_proj|up_proj|down_proj)$")
allproj = [n for n,_ in m.named_modules() if re.search(r"(q_proj|k_proj|v_proj|o_proj|gate_proj|up_proj|down_proj)$", n)]
ms = [n for n in allproj if STUDENT_RE.match(n)]
print("student-regex matched:", len(ms), "examples:", ms[:2], ms[-2:] if len(ms)>2 else "")
other = [n for n in allproj if not STUDENT_RE.match(n)]
print("other proj paths (should be empty or vision):", other[:5], "... total", len(other))
# prefixes of modules to see structure
prefs = set()
for n,_ in m.named_modules():
    parts=n.split(".")
    if len(parts)>=2: prefs.add(".".join(parts[:2]))
print("top-2 prefixes:", sorted(prefs)[:12])
# load QA_I image + forward
df = pd.read_parquet("/REDACTED/tiaozhanbei/demo/labsafety/data/QA_I-00000-of-00001.parquet")
img = Image.open(io.BytesIO(df.iloc[0]["Decoded Image"]["bytes"])).convert("RGB")
print("image:", img.size)
q = df.iloc[0]["Question"]
messages=[{"role":"user","content":[{"type":"image","image":img},{"type":"text","text":q}]}]
inputs = proc.apply_chat_template(messages, add_generation_prompt=True, enable_thinking=False, return_tensors="pt", return_dict=True)
inputs = {k:(v.to("cuda") if torch.is_tensor(v) else v) for k,v in inputs.items()}
print("input keys:", list(inputs.keys()), {k:(tuple(v.shape) if torch.is_tensor(v) else type(v).__name__) for k,v in inputs.items()})
torch.manual_seed(0)
out = m.generate(**inputs, do_sample=False, max_new_tokens=64)
gen = out[0][inputs["input_ids"].shape[1]:]
print("greedy answer:", repr(proc.decode(gen, skip_special_tokens=True)[:300]))
del m; torch.cuda.empty_cache()
print("PROBE3 DONE", round(time.time()-t0,1),"s")
