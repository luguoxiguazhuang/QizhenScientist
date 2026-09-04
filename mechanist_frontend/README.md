# Mechanist Frontend

Mechanist 项目（github.com/zjunlp/Mechanist）的介绍网页，网址为 http://mechanist.openkg.cn 。

| 目录 | 内容 | 访问路径 |
|---|---|---|
| `site/` | 主站（React）：Home / Case / Skill / Database / Quick Start | `/` |
| `site/docs/` | 文档站：页面外壳 + **正文 Markdown**（`docs/content/`） | `/docs/` |

### 改文档内容

文档站的**目录和正文都从 Markdown 加载**，改内容只需要改这两个文件，不用碰 HTML：

- `site/docs/content/docs.en.md`
- `site/docs/content/docs.zh.md`

侧边栏目录由这两个文件的标题结构推导，不单独维护，所以不会和正文脱节。Markdown 在**构建时**渲染成 HTML（`site/docs/vite-plugin-docs.js`），页面加载时不再解析 Markdown，所以改完要重新 `npm run build`；`npm run dev` 下改完刷新即可。

写作约定（`#` 分组、`## 标题 {#id | 侧边栏标签}`、`> [!NOTE]` 等）完整写在 `site/docs/render.js` 顶部的注释里。两份文件的 `{#id}` 必须一致——语言切换靠它保持阅读位置。

## 一、本地开发

```bash
cd site
npm install
npm run dev
```

- Vite 开发服务运行在 `http://127.0.0.1:5173`，在浏览器打开该链接即可预览。


## 二、远程部署（此部分由 Wang Haoxiong 负责解释）

### 1. 服务器

本网站部署在项目方提供的部署服务器上。该服务器还同时部署了 Mechanist 项目依赖的数据库 Mechanic-DB，以及 Sciatlas 项目的网站和 Sciatlas 数据库。

### 2. 网站修改后，如何更新到 http://mechanist.openkg.cn

1. 第一步：将修改提交到 Github。
2. 第二步：ssh 到 `<DEPLOY_HOST>`。
3. 第三步：执行以下命令（需要 sudo 权限）。

```bash
cd <DEPLOY_ROOT>/mechanist_frontend
git pull
cd site && npm ci && npm run build
sudo rsync -a --delete dist/ /var/www/mechanist/
```

这时就完成了网站的更新，访问 http://mechanist.openkg.cn 即可预览最新版网站。

### 3. Nginx 路由配置

本网站和 Mechanist 项目依赖的数据库 Mechanic-DB（`scientist_database_deploy`，FastAPI :9001）部署在同一台服务器、同一个域名 `mechanist.openkg.cn` 下，由一份 nginx 配置统一编排：

```
                          ┌─ /register /verify /quota /search /jobs/* /api/*  →  FastAPI :9001
http://mechanist.openkg.cn  ┤
                          └─ 其余一切                                        →  /var/www/mechanist（静态）
```

除非你希望为本网站新增后端接口，否则不需要也不应该修改 nginx 配置。

## 三、Database 页数据（此部分由 Cui Zhixiang 负责解释）

`Database` 页展示的是本地 mech-interp 小 Neo4j（bolt 7689）的静态镜像。数据文件已经预先生成好，随仓库一起分发：

```
site/public/database/
├── manifest.json                  高层元信息 + 三棵树的目录
├── trees/*.json                   每个 category 的大节点 + 论文叶子（每个大节点最多 60 篇，按引用数取顶部）
├── history/*.md                   每个大节点的发展史 markdown
└── papers/*.json                  1000+ 篇论文的详细字段（研究问题 / 关键发现 / target model 等）
```

前端组件只走 `fetch('/database/...')`，**不依赖任何后端 / 数据库**——把 `site/dist/` 丢到任何静态托管（Nginx / Vercel / Netlify / S3 / GitHub Pages）都能跑。

如果小库有更新（加了论文 / 新 helper / 变更 venue），重新生成静态数据即可（需要 Python 环境 + `neo4j` 包 + 能访问 7689 的实例）：

```bash
cd site
python3 scripts/build_database_data.py    # 覆盖 public/database/
npm run build                              # 重打包（也会把新数据拷进 dist/）
```

参与二次开发的人**不需要**访问 Neo4j，直接 `npm install && npm run dev` 就能开发（用现有静态数据）。
