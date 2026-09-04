# Standalone idea-generation scripts
1.填写.env中的LLM_API_KEY和LLM_BASE_URL。并提供Sciatlas Key。
2.首次点击前端“生成”、运行 `./run_idea.sh` 或执行前端 `npm run build` 时，会自动创建本地 Python 环境并安装依赖；也可以提前运行 `./setup.sh`。

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
