# Standalone idea-generation scripts
1.填写.env中的LLM_API_KEY和LLM_BASE_URL。并提供Sciatlas Key。
2. `SciAtlas/` 已随本项目提供。首次运行时脚本使用该本地目录，并仅安装 Python 依赖，不会从 GitHub 拉取 SciAtlas。

```bash
./setup.sh
```

默认安装 CPU 版 PyTorch，不需要 CUDA 或 GPU；如果部署在有 GPU 的机器上，可自行设置 `TORCH_INDEX_URL` 后再安装。
3.填写./input_question.json中要问的问题和描述
4.生成：
```bash
./run_idea.sh                 # default: flash模式：速度快
```

```
FULL=true ./run_idea.sh       # full模式：速度慢，覆盖更广
```

5.flash模式示例是./flash_example/pipeline.输出结果是./flash_example/pipeline/step9_ideas.md
