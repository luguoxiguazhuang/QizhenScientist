import io, torch, time, warnings
warnings.filterwarnings("ignore")
MODEL = "/REDACTED/models/Qwen3.5-9B"
from transformers import AutoProcessor, AutoModelForImageTextToText
from PIL import Image
import pandas as pd
t0=time.time()
proc = AutoProcessor.from_pretrained(MODEL, trust_remote_code=True)
m = AutoModelForImageTextToText.from_pretrained(MODEL, dtype=torch.bfloat16, trust_remote_code=True).to("cuda")
df = pd.read_parquet("/REDACTED/tiaozhanbei/demo/labsafety/data/QA_I-00000-of-00001.parquet")
img = Image.open(io.BytesIO(df.iloc[0]["Decoded Image"]["bytes"])).convert("RGB")
q = df.iloc[0]["Question"]
messages=[{"role":"user","content":[{"type":"image","image":img},{"type":"text","text":q}]}]
inputs = proc.apply_chat_template(messages, add_generation_prompt=True, enable_thinking=False,
                                  tokenize=True, return_dict=True, return_tensors="pt")
inputs = {k:(v.to("cuda") if torch.is_tensor(v) else v) for k,v in inputs.items()}
print("input keys:", {k:(tuple(v.shape) if torch.is_tensor(v) else type(v).__name__) for k,v in inputs.items()})
t1=time.time()
out = m.generate(**inputs, do_sample=False, max_new_tokens=256)
gen = out[0][inputs["input_ids"].shape[1]:]
ans = proc.decode(gen, skip_special_tokens=True)
print("greedy answer (%.1fs):" % (time.time()-t1), repr(ans[:400]))
# batch of 2 with different image sizes
img2 = Image.open(io.BytesIO(df.iloc[1]["Decoded Image"]["bytes"])).convert("RGB")
msgs2=[[{"role":"user","content":[{"type":"image","image":img},{"type":"text","text":q}]}],
       [{"role":"user","content":[{"type":"image","image":img2},{"type":"text","text":df.iloc[1]["Question"]}]}]]
try:
    in2 = proc.apply_chat_template(msgs2, add_generation_prompt=True, enable_thinking=False, tokenize=True, return_dict=True, return_tensors="pt", padding=True)
    print("batch-2 ok:", {k:(tuple(v.shape) if torch.is_tensor(v) else None) for k,v in in2.items()})
except Exception as e:
    print("batch-2 FAIL:", type(e).__name__, str(e)[:200])
print("PROBE4 DONE", round(time.time()-t0,1),"s")
