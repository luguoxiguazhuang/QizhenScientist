# 前端部署说明

本目录包含启真 Scientist 前端，以及在线“生成化学研究假设”所需的 Node/Vite API。生成接口会按请求启动 `idea_generation_scripts/run_idea.sh`，因此不能只把静态 `dist/` 目录交给 nginx。

## 新服务器部署

### 1. 安装系统依赖

以下命令适用于 Debian/Ubuntu。Node.js 需要满足 `20.19+`（或 `22.12+`），Python 需要 `3.10+`，并需要 `git`、`jq` 和可用的网络连接。

```bash
sudo apt-get update
sudo apt-get install -y git jq python3 python3-venv
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
git clone git@github.com:luguoxiguazhuang/QizhenScientist.git
cd QizhenScientist
```

### 2. 配置 SciAtlas

复制模板并编辑服务端配置。部署人员只需要填写 SciAtlas Key；模板已经包含 SciAtlas 地址和 `qwen3.8-max` 默认模型：

```bash
cp idea_generation_scripts/SciAtlas/.env.example idea_generation_scripts/.env
$EDITOR idea_generation_scripts/.env
```

在 `.env` 中填写 `SCIATLAS_API_KEY`。`SCIATLAS_API_BASE_URL` 保持为 `http://sciatlas.openkg.cn`，`LLM_MODEL` 保持为 `qwen3.8-max`。不需要在服务器 `.env` 中填写 `LLM_API_KEY` 或 `LLM_BASE_URL`：用户打开前端窗口后输入自己的 Qwen API Key 和 base URL，服务端只在该次请求中使用。

### 3. 构建并启动前端/API

```bash
cd frontend/site
npm ci
npm run build
npm run preview -- --host 0.0.0.0 --port 4173
```

Vite preview 同时提供页面和 `/api/generate-idea` 接口。生产环境建议用 `systemd`、`supervisord` 或容器保持该 Node 进程运行，并在反向代理中转发 4173 端口。开发调试时可改用：

```bash
npm run dev -- --host 0.0.0.0 --port 5173
```

首次 `npm run build` 会自动执行 `idea_generation_scripts/setup.sh`，创建 `.runtime/.venv` 并安装 CPU 版依赖；也可以提前手动执行该脚本。若服务器有 GPU，按 `setup.sh` 中的 `TORCH_INDEX_URL` 说明替换 PyTorch 安装源。

### 4. 查看运行日志

保持启动 Node/Vite 的终端即可看到每个请求的日志，包括任务开始、`Step 1` 到 `Step 9`、警告、错误、取消和最终状态。后端不会打印 API Key 或完整模型响应。也可以在另一终端查看进程：

```bash
ps -ef | rg 'vite|run_idea|sciatlas_idea_gen'
```

生成流程的阶段产物、临时配置和日志只在请求运行期间写入独立的 `/tmp/qizhen-idea-*/` 目录。成功、失败或用户取消后，服务端会读取需要展示的 Markdown 并自动删除该目录；不同用户的请求使用不同目录，互不覆盖。直接运行 `idea_generation_scripts/run_idea.sh` 时仍会按 CLI 约定把产物保存到 `runs/`。

### 5. Flash 流程和进度

前端固定使用 Flash 工作流，共 9 个步骤。Step 5（radius gate）和 Step 8（inspiration selection）在 Flash 中是压缩后的确定性实现，但仍会生成对应产物，因此进度条仍显示 `1 / 9` 到 `9 / 9`。Step 9 是模型生成最终 idea 的阶段，可能因模型服务响应慢而持续较久；终端日志可用于判断它是在等待模型还是已经报错。
