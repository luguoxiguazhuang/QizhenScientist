# Sciatlas idea 生成脚本

## 1. 配置凭据

```bash
cp .env.example .env
```

在 `.env` 中至少填写三项（其余字段都有默认值）：

| 变量 | 说明 |
| --- | --- |
| `SCIATLAS_API_KEY` | SciAtlas 个人 token，留空时 `run_idea.sh` 直接报错退出 |
| `LLM_API_KEY` | LLM 的 API key，留空时同样报错退出 |
| `LLM_BASE_URL` | OpenAI 兼容 endpoint 的基址（需带版本后缀，如 `.../v1`） |

另外确认 `LLM_MODEL` 是你的 endpoint 实际提供的模型名。

## 2. 安装运行环境

```bash
./setup.sh
```

会在 `.runtime/.venv/` 建虚拟环境，并安装 `SciAtlas/sciatlas` 包与工作流依赖。首次执行
`./run_idea.sh` 时若发现环境不存在，也会自动调用 `setup.sh`。

默认安装 CPU 版 PyTorch，不需要 CUDA 或 GPU（工作流只在本地 embedding / reranking 时用到
torch）。部署在有 GPU 的机器上时，可先设置 `TORCH_INDEX_URL` 再安装；国内网络可用
`PYPI_INDEX_URL` 换源，默认已指向清华镜像。

## 3. 填写要研究的问题

编辑 `input_question.json`：

```json
{
  "category": "Chemistry",
  "question": "Are there more color pigments to discover?",
  "description": "背景补充，可留空"
}
```

`question` 必填；`category` 会作为 `--domain` 传给 SciAtlas。若还有额外约束（目标子领域、
材料偏好、实验限制等），写进 `idea.md`——其中以 `#` 开头的行会被当作注释过滤掉。不需要时
保持该文件原样即可。

## 4. 生成

```bash
./run_idea.sh                 # flash 模式（默认）：速度快
FULL=true ./run_idea.sh       # full 模式：速度慢，覆盖更广
```

两种模式的主要差异：

| | flash | full |
| --- | --- | --- |
| 种子论文数 | 1 | 4 |
| 研究图规模上限 | 5 篇 | 30 篇 |
| 跨领域灵感探测 | 1 个领域 | 2 个领域 |
| 新颖性反馈轮数 | 0 | 2 |

## 5. 查看结果

每次运行输出到 `runs/<时间戳>-<flash\|full>/`，其中：

- `step9_ideas.md` —— 最终 idea，正常情况下只需要看这个
- `step1`–`step8_*.json` —— 各阶段中间产物（种子论文、研究图、灵感候选等）
- `summary.json`、`llm_trace.jsonl`、`retrieval_trace.json` —— 运行摘要与调用轨迹

`flash_example/pipeline/` 是一份已生成好的 flash 模式样例输出，可直接对照文件结构，最终结果
见 `flash_example/pipeline/step9_ideas.md`。仓库中另有 9 个化学问题的完整生成结果，位于
`demo/idea_generation_demo/chemstry_question/`。

## 可选环境变量

| 变量 | 作用 | 默认值 |
| --- | --- | --- |
| `ENV_FILE` | 指定凭据文件 | `./.env` |
| `INPUT_FILE` | 指定问题 JSON | `./input_question.json` |
| `IDEA_FILE` | 指定附加说明文件 | `./idea.md` |
| `RUNS_DIR` | 指定输出根目录 | `./runs` |
| `SCIATLAS_TIMEOUT` | KG 请求超时（秒） | `900`（在 `.env` 中设置） |
| `TORCH_INDEX_URL` | PyTorch 安装源 | CPU 轮子源 |
| `PYPI_INDEX_URL` | 额外 PyPI 源 | 清华镜像 |

## 进一步定制

`run_idea.sh` 本质上是 `python -m sciatlas_idea_gen.main` 的封装。需要 PDF 输入、断点续跑、
调整图规模或一次生成多个 idea 时，可直接调用底层 CLI：

```bash
cd SciAtlas && ../.runtime/.venv/bin/python -m sciatlas_idea_gen.main --help
```

（`sciatlas_idea_gen` 未被 pip 安装，作为包导入时工作目录必须是 `SciAtlas/`，这也是
`run_idea.sh` 在调用前先 `cd SciAtlas` 的原因。）

更完整的说明见 `SciAtlas/docs/SciAtlas 操作手册.md` 与 `SciAtlas/README.md`。
