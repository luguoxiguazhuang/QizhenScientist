# 启真Scientist —— 真机执行与实验迭代层

本仓库是启真智能真机实验体系与启真自动迭代系统的**执行与迭代层实现**，面向 Suzuki–Miyaura 交叉偶联反应的条件优化任务落地。

在由亲电试剂、亲核试剂、配体、碱、溶剂构成的 5731 个离散候选条件中，系统以有限实验预算（默认 40 轮）搜索高产率条件组合：贝叶斯优化器负责收敛性，大模型负责科学判断，条件经技能编排层展开为原子动作协议，再交由真机执行器或历史数据回放产生观测，观测回传后驱动下一轮决策。

---

## 一、复现指南

### 1. 环境

依赖含两个 git 源包，且严格锁定 Python 3.10 / torch 1.13.1，**必须新建独立环境**：

```bash
conda env create -f code/environment.yml   # 创建 trace-submission (Python 3.10)
conda activate trace-submission
```

> `requirements.txt` 中的 `matter-atlas` 与 `olympus` 来自 GitHub 源码安装，需要网络可达 github.com。

### 2. 冒烟测试（约 1 分钟）

先用基线模式验证「环境装对了、数据读得到、优化器能拟合、结果能落盘」这条链路：

```bash
cd <仓库根目录>
python code/scripts/run.py suzuki --controller-mode atlas_baseline --rounds 3 --seeds 100
```

### 3. 配置大模型凭据

`qizhen_scientist` 模式需要 LLM 凭据。复制模板并填写：

```bash
cp code/config/environment.example .env    # 放在仓库根目录
```

```bash
LLM_PROVIDER=openai            # OpenAI 兼容端点填 openai
LLM_API_KEY=<your key>
LLM_BASE_URL=<endpoint>/compatible-mode/v1
LLM_MODEL=<model id>
LLM_ENABLE_THINKING=false
```

> 环境变量**优先级高于** YAML 配置：`LLM_MODEL` / `LLM_BASE_URL` 会覆盖 `code/main/configs/agent_bo_suzuki.yaml` 里的同名项。跑之前建议 `echo $LLM_MODEL $LLM_BASE_URL` 确认。
> 缺少凭据时决策层会记录告警并退回非大模型路径——运行仍会完成，但结果不应计为 `qizhen_scientist` 模式。

### 4. 完整复现

```bash
# 启真Scientist（LLM + 知识先验 + 贝叶斯优化）
python code/scripts/run.py suzuki --controller-mode qizhen_scientist --bayesian_method atlas

# Atlas 基线（纯贝叶斯优化，无 LLM、无知识先验）
python code/scripts/run.py suzuki --controller-mode atlas_baseline   --bayesian_method atlas
```

不带参数时等价于第一条（默认 `qizhen_scientist` + `atlas`）：

```bash
python code/scripts/run.py suzuki
```

**规模提示**：默认 40 轮 × 20 个种子，`qizhen_scientist` 每轮 8 个 LLM 节点。按仓库内已归档运行的实测，单个配置约 **6200 次 LLM 调用、约 100M 输入 token、LLM 累计墙钟约 23 小时**。批量跑请预留时间与配额。每轮结束原子写检查点，中断后重跑同一命令自动续跑（`--no-resume` 可强制重来）。

---

## 二、系统构成与代码位置

项目书与本仓库代码的对应关系：

| 能力 | 代码位置 | 说明 |
| --- | --- | --- |
| **SkillNet 原子技能词表** | `code/main/chem_agent_bo/steps/schema.py` | 封闭动作集合：`take_sample` / `dispense` / `stir` / `heat` / `quench` / `analyze`，`ExperimentStep` 定义单条原子操作的结构 |
| **SkillNet 技能编排** | `code/main/chem_agent_bo/steps/decompose.py` | 条件 → 有序原子技能序列。确定性、无模型参与；工艺常量在 `SUZUKI_DEFAULTS` 显式展开 |
| **跨设备适配** | `code/main/chem_agent_bo/backends/registry.py` | 将 `runtime.execution` 配置解析为具体执行后端；`auto` 模式仅在启动时探测一次 |
| **LabVLA 接口（契约）** | `code/main/chem_agent_bo/backends/base.py` | `ExecutionBackend` Protocol —— LabVLA 驱动的执行器在边界另一侧实现的契约 |
| **LabVLA 接口（客户端）** | `code/main/chem_agent_bo/backends/device.py` | 提交协议、轮询终态、重试与超时；失败直接报错，绝不静默改用回放值 |
| **参考执行器** | `code/scripts/device_stub.py` | 实现同一契约的桩，用于真机就位前打通链路 |
| **观测与来源回传** | `backends/base.py:ExecutionOutcome` | 每条观测带 `observation_origin`，运行级记录 `execution_backend` 与 `history_mode` |
| **全过程轨迹落盘** | `code/main/submission_runner.py` | `trajectory` / `history` / `decision_trace` 三份记录写入 `seed_<n>.pt` |
 **节点级科研评价规范** | `code/main/chem_agent_bo/procedural_skills/` | 9 张技能卡按 `target_nodes` 注入对应决策节点的提示词 |
| **知识先验与作用域过滤** | `code/main/chem_agent_bo/lab/evidence.py` | `EvidenceCard` 15 字段；`applicable()` 按映射度、置信度、变量/节点重合打分选卡 |
| **文献检索与冻结** | `code/main/chem_agent_bo/sciatlas/`、`code/scripts/prepare_sciatlas_evidence.py` | 离线检索 → 泄漏过滤 → 数值涂抹 → 冻结存档；`provenance.py` 做审阅与 SHA-256 门禁 |
| **多节点诊断与归因** | `code/main/chem_agent_bo/agent/decision_engine.py` | 停滞诊断、假设生成、覆盖分析、控制策略、候选重排、语义评估、验证、反思共 8 个结构化输出节点 |
| **单轮编排** | `code/main/chem_agent_bo/runtime/controller.py` | `plan_batch()` 串联决策节点；`reflect_after_result()` 在观测回传后反思 |
| **候选合法性约束** | `code/main/chem_agent_bo/bo/`、`submission_runner.py` | 优化器只在未测过的合法候选上打分；重复或越界候选直接报错终止 |
| **经验结构化留存** | `seed_<n>.pt` 的 `decision_trace` | 每轮的诊断、假设、策略、理由、反思逐条落盘，可事后检索与归因 |

---

## 三、两种决策配置

两种配置共用同一主循环与同一份数据，差异仅在于"谁来决定下一个实验"，从而可直接对比知识与推理带来的增益。

| 配置 | `--controller-mode` | 决策方式 |
| --- | --- | --- |
| **Atlas 基线** | `atlas_baseline` | 纯贝叶斯优化基线。优化器在候选空间上拟合代理模型，按采集函数选取首选条件，全程不调用大模型，也不注入任何知识先验。 |
| **启真Scientist** | `qizhen_scientist` | 优化器负责收敛性，大模型负责科学判断。优化开始前注入领域知识证据；每轮优化器生成候选短名单后，LLM 依次完成停滞诊断、化学假设生成、覆盖度分析、控制策略选择、候选重排、语义合理性与风险评估，并在观测回传后进行反思。 |

知识先验默认取自仓库自带的策展证据卡（`data/evidence_cards/suzuki_evidence_cards.jsonl`，100 张），也可用 `--evidence-cards` 指向一份冻结的检索文献包；后者需通过人工审阅与 SHA-256 校验门禁才会被采用。`atlas_baseline` **拒绝**该参数，以保证基线数值始终是纯规划器参考。

**分工边界**：大模型不生产实验条件，仅在优化器给出的合法候选范围内进行选择与解释。优化器保证搜索不越界、不重复、可收敛；LLM 提供"为什么选它"的科学理由，并将理由结构化落盘，供后续评价与归因使用。

---

## 四、两种执行后端

推荐出的条件如何转换为观测，由 `runtime.execution.backend` 或 `--execution-backend` 决定。

**1. 真机执行（`device`）**

条件先经 SkillNet 技能编排展开为原子动作序列，加料当量、催化剂负载、温度与反应时间等该反应体系固定的工艺常量在此显式写出。

- 编排过程完全确定性、不经模型，同一条件恒得同一协议，因此可比对、可复核、可重放。
- 协议随后跨 LabVLA 接口提交至真机执行器（`POST /tasks` 提交，轮询 `GET /tasks/{id}` 直至终态），由其完成具身操作并回传测得产率。
- 装置不可达时整轮运行**失败**，不会静默改用历史数据填充——将未经测量的数值记为测量结果会污染整条实验轨迹。
- `code/scripts/device_stub.py` 提供实现同一契约的参考执行器。

执行器需实现三个端点：

```
GET  {base_url}/health           -> 200 表示可接受任务
POST {base_url}/tasks            {task, candidate_id, candidate, steps} -> {"task_id": "..."}
GET  {base_url}/tasks/{task_id}  -> {"status": "pending|running|completed|failed",
                                     "yield": <float>, "detail": "..."}
```

**2. 数据回放（`table_lookup`，默认）**

回放已有高通量实验数据集，用于算法迭代、消融对比与批量种子实验。`auto` 模式在启动时探测一次装置，不可达则整场改用回放且仅判定一次——单次运行不会混合"实测"与"回放"两类数值。

---

## 五、单轮执行流

```
① 优化器拟合并给出候选短名单
   bo/atlas_bo.py: suggest_shortlist()
        ↓
② [qizhen_scientist] LLM 决策链（8 个结构化节点）
   runtime/controller.py:77  plan_batch()
     停滞诊断 → 化学假设 → 覆盖分析 → 控制策略 → 候选重排 → 语义评估 → 候选验证
     （各节点实现见 agent/decision_engine.py，技能卡按节点注入）
        ↓
③ SkillNet 编排为原子动作协议（确定性，无模型参与）
   steps/decompose.py:241  build_steps_for_task()
        ↓
④ 跨 LabVLA 接口执行 ／ 数据回放
   backends/device.py: query()   或   backends/table_lookup.py: query()
   submission_runner.py:1652  execution_backend.query(...)
        ↓
⑤ 观测回传：写入代理模型、历史与最优轨迹，标记 observation_origin
        ↓
⑥ [qizhen_scientist] LLM 反思本轮结果
   runtime/controller.py:317  reflect_after_result()
        ↓
⑦ 落盘决策轨迹 → 原子写检查点（中断可续跑）
```

---

## 六、目录结构

```
Qizhen-Scientist/
├── code/
│   ├── scripts/
│   │   ├── run.py                        # 唯一运行入口
│   │   ├── device_stub.py                # LabVLA 接口参考执行器
│   │   └── prepare_sciatlas_evidence.py  # 文献检索与冻结（离线预处理）
│   ├── config/
│   │   ├── config.yaml                   # 启动器默认值、执行后端、知识先验路径
│   │   ├── sciatlas.yaml                 # 文献检索 profile 与屏蔽规则
│   │   └── environment.example           # 环境变量模板
│   ├── main/
│   │   ├── submission_runner.py          # 主循环实现
│   │   ├── oracle.py                     # 结果查询边界定义
│   │   ├── task_registry.py              # 任务元数据
│   │   ├── configs/agent_bo_suzuki.yaml  # 控制器与提示词配置
│   │   └── chem_agent_bo/
│   │       ├── steps/                    # SkillNet：原子技能词表 + 技能编排
│   │       ├── backends/                 # LabVLA 接口 + 数据回放后端
│   │       ├── bo/                       # 贝叶斯优化骨干（5 种）
│   │       ├── agent/                    # LLM 决策节点与结构化输出
│   │       ├── runtime/                  # 单轮编排、批次组合、动作能力策略
│   │       ├── procedural_skills/        # 节点级技能卡（9 张 Markdown）
│   │       ├── lab/                      # 证据卡结构与作用域过滤
│   │       ├── sciatlas/                 # 文献检索、泄漏过滤、审阅门禁
│   │       └── knowledge/                # 知识检索与经验层
│   └── tests/                            # 单元测试（56 项）
├── data/
│   ├── Suzuki/                           # 训练集 29 条、候选池与结果表各 5731 条
│   └── evidence_cards/                   # 策展证据卡 100 张
└── results/                              # 已归档运行结果（见下）
```

> 所有相对路径均以仓库根目录为基准。运行命令请在仓库根目录执行。

---

## 七、数据与产物

**输入**（`data/Suzuki/`）

| 文件 | 内容 |
| --- | --- |
| `suzuki_train.csv` | 初始已标注观测，29 条 |
| `suzuki_test_features.csv` | 候选池，5731 条 |
| `suzuki_test.csv` | 结果表，`table_lookup` 后端据此回放观测 |
| `options.json` | 离散取值元数据 |

**新运行的产物**

```
results/project/<Dataset>/<controller_mode>/<bayesian_method>/seed_<n>/
├── seed_<n>.pt                 # 完整结果载荷
├── checkpoint_seed_<n>.pt      # 断点续跑检查点
└── progress_seed_<n>.json      # 进度
logs/<Dataset>/<controller_mode>/<bayesian_method>/run_<timestamp>.log
```

`seed_<n>.pt` 内含 `trajectory`（每步条件、观测、来源、原子动作协议）、`history`、`decision_trace`（每轮全部决策节点输出）、`metrics`、`llm_usage`。

**已归档结果**（`results/`）

覆盖 4 种配置 × 20 个种子 × 40 轮，共 80 个轨迹文件：

| 配置 | 骨干 | 种子数 |
| --- | --- | --- |
| `qizhen_scientist` | `atlas` / `botorch_qei` | 各 20 |
| `atlas_baseline` | `atlas` / `botorch_qei` | 各 20 |

汇总指标见 `results/summary_metrics.csv`，附录数据见 `results/appendix/data/`。

---

## 八、常用参数

```bash
python code/scripts/run.py suzuki [options]
```

| 参数 | 默认 | 说明 |
| --- | --- | --- |
| `--controller-mode` | `qizhen_scientist` | `qizhen_scientist` 或 `atlas_baseline` |
| `--bayesian_method` | `atlas` | 优化骨干，见第二节表格 |
| `--execution-backend` | `table_lookup` | `device` / `auto` / `table_lookup` |
| `--device-base-url` | 空 | 真机执行器地址 |
| `--evidence-cards` | 配置默认 | 知识先验文件，仅 `qizhen_scientist` 接受 |
| `--evidence-top-k` | `10` | 注入的证据卡数量 |
| `--rounds` | `40` | 每个种子的实验预算 |
| `--seeds` | `100…2000` | 种子列表 |
| `--batch-size` | `1` | 每轮推荐条数 |
| `--no-resume` | 关 | 忽略检查点重跑 |

真机链路联调：

```bash
# 终端 1：启动参考执行器
python code/scripts/device_stub.py --port 8900 --latency-sec 5

# 终端 2：以 device 后端运行
python code/scripts/run.py suzuki --execution-backend device \
    --device-base-url http://127.0.0.1:8900 --rounds 3 --seeds 100
```

运行测试：

```bash
cd code && python -m pytest tests -q
```