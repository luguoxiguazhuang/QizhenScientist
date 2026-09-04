---
title: Mechanist 文档
lead: Mechanist 是面向大模型机理可解释性研究的自主科研智能体。它以 Claude Code 插件形式运行，可完成从文献调研到实验验证的研究流程。

---

# 总览

## 项目概述：Mechanist 能做什么？ {#overview | 项目概述}
Mechanist 面向大语言模型的**机理可解释性（mechanistic interpretability）**研究。为 Mechanist 指定一个研究方向，它会将研究问题转换为可检验的科学主张（claim，以下简称“主张”），并围绕主张自动完成文献调研、实验、稳健性验证和评审迭代，最终产出完整、可验证的实验报告。

Mechanist 不提供远程计算环境，而是以 Claude Code 插件的形式安装在用户的计算机上。实验需在用户提供的计算环境中运行，研究结果保存在用户本地的项目目录中。

### 适用场景

Mechanist 支持的科研任务包括但不限于以下四类：

- **探索机制**  
  已知模型存在某种行为，进一步定位导致该行为的内部组件。

- **复现论文**  
  研究结论和实验方法均已知，按照论文给出的模型、数据和规模进行复现。

- **验证待确认现象**  
  已提出具体的行为假设，但尚无论文或既有实验确认该现象。

- **开放式发现**  
  仅提供研究方向，由 Mechanist 发现候选现象并进一步研究其机制。

更多研究示例见 [Research 页面](../#/research)。

### 科研闭环

针对每一个科研问题，Mechanist 的运行流水线分为主张定义、实验、验证和迭代四个阶段。

```text
research question
      |
      v
   claim ------> experiment ------> verify ------> iterate ------> findings
      ^                                               |
      |____________ revise and re-run _______________|
```

每个阶段都需要通过检查后才能进入下一阶段。各阶段检查或评审未通过时，流水线会返回相应阶段修订并重新执行。

流水线运行完成后，Mechanist 将每条科学主张的实验结果、验证状态和最终结论汇总到结果文件 `CLAIMS_LEDGER.md` 中，供研究人员审阅。

# 安装与首次运行

## Mechanist 安装教程 {#installation | 安装}

### 1. 安装 Claude Code 和 uv
Mechanist 以 Claude Code 插件形式运行，无需克隆代码仓库。

安装 Claude Code，重启终端后检查版本：

```bash
# 安装 Claude Code；安装后重启终端并检查版本
curl -fsSL https://claude.ai/install.sh | bash
claude --version
```

Mechanist 的 MCP 服务使用 uv 管理 Python 环境。安装 uv 并检查版本：

```bash
# Mechanist 的 MCP 服务使用 uv 管理 Python 环境
curl -LsSf https://astral.sh/uv/install.sh | sh
uv --version
```

### 2. 为 Claude Code 安装 Mechanist 插件 {#plugin}
启动 Claude Code，并在会话中执行：

```text
/plugin marketplace add zjunlp/Mechanist
/plugin install mechanist@mechanist
```

安装完成后，执行 `/reload-plugins` 重新加载插件，然后验证插件和 MCP 服务：

```text
/reload-plugins
/mechanist        # 应列出 /mechanist:auto、/mechanist:msearch、/mechanist:mhistory 等命令
/mcp              # llm-chat 和 mechanic-db 应显示为 connected
```

命令仍未出现时，可尝试重启 Claude Code 再次检查。

本文使用 `/auto`、`/mguide` 等短命令。它们与插件列表中带 `mechanist:` 前缀的命令对应；在 Claude Code 中输入短命令即可调用。

> [!NOTE]
> `/mcp` 中的 `connected` 仅表示服务已经启动，不代表配置的 API key 等各字段有效。

### 3. 配置外部评审模型 {#environment}
Mechanist 使用独立于 Claude 的模型复核候选研究想法、实验设计和结论。评审模型不能使用 Claude 系列模型。

| 变量 | 是否必填 | 默认值或示例 | 作用 |
|---|---|---|---|
| `LLM_API_KEY` | <span class="badge req">required</span> | `sk-...` | 外部评审模型的 API key。 |
| `LLM_MODEL` | <span class="badge opt">optional</span> | `gpt-5.4` | 外部评审模型名称。 |
| `LLM_BASE_URL` | <span class="badge opt">optional</span> | `https://api.openai.com/v1` | OpenAI 兼容服务的根地址。 |

使用 OpenAI 官方 API 时可以保留默认模型和地址。使用 Azure、DeepSeek、Qwen 或第三方代理时，需要填写对应的 OpenAI 兼容模型名和地址。

将变量写入 `~/.bashrc`；使用 zsh 时写入 `~/.zshrc`：

```bash
# --- Mechanist（写入 ~/.bashrc 或 ~/.zshrc）---
export LLM_API_KEY="sk-..."                       # required
export LLM_MODEL="<your_model_name>"              # optional, default: gpt-5.4
export LLM_BASE_URL="<your_base_url>"             # optional, default: official endpoint
```

加载变量并确认 key 非空：

```bash
source ~/.bashrc
echo "$LLM_API_KEY"
```

> [!NOTE]
> Claude Code 只在启动时读取环境变量。修改配置后，需要重新启动 Claude Code。

### 4. 配置 Mechanic-DB key（可选）{#mechainic-db-api}

Mechanic-DB 是 Mechanist 项目构建的学术论文知识图谱，可为文献调研和候选研究想法生成提供支持，并帮助 Mechanist 将研究想法细化为可检验的科学主张。无需注册和配置即可使用，配额为每分钟 2 次、每天 20 次。若需要更高的检索配额，可按下述方法注册并配置 key；注册后的配额为每分钟 20 次、每天 1000 次。

使用邮箱发起注册：

```bash
curl -X POST http://mechanist.openkg.cn/register \
  -H 'Content-Type: application/json' \
  -d '{"email": "you@example.com"}'
```

打开验证邮件中的链接。验证页面会显示一次性的 `sk_...` key，请在关闭页面前保存。

将 key 写入 `~/.bashrc`；使用 zsh 时写入 `~/.zshrc`：

```bash
export MECHANIC_DB_API_KEY="sk_..."
```

加载变量并确认 key 非空：

```bash
source ~/.bashrc
echo "$MECHANIC_DB_API_KEY"
```

### 5. 准备实验 Python 环境（可选） {#experiment-environment}

Mechanist 在启动 Claude Code 时所在的 Python 环境中执行实验。项目不要求环境必须命名为 `scientist`，也不要求使用 conda。

如果当前环境已经安装 PyTorch、NumPy、scikit-learn 等实验依赖，可以跳过本节。缺少基础依赖时，可使用以下命令创建示例环境：

```bash
# 示例：创建名为 scientist 的独立 conda 环境
conda create -n scientist python=3.11 -y
conda activate scientist
pip install -r <(curl -sSL https://raw.githubusercontent.com/zjunlp/Mechanist/main/requirements.txt)
```

实验使用当前环境可见的 GPU。设备选择方式见 [参数参考](#parameters)。

## 首次运行 {#quickstart | 首次运行}
首次运行包括创建项目目录、启动 Claude Code 和通过 `mguide` 提交研究需求。

### 1. 创建项目目录

Mechanist 将研究文件写入启动目录。需要为每个研究问题创建独立目录。

Mechanist 的跨轮记忆机制会将一个项目目录视为同一研究问题。混放不同问题会污染研究记忆，并可能触发保护性检查。

```bash
mkdir -p ~/research/belief-asymmetry   # one research question = one folder
cd ~/research/belief-asymmetry
```

> [!NOTE]
> 可在项目目录中创建 `literature/` 子目录并放入本地 PDF。文献调研阶段会扫描该目录，并优先参考该目录下的文献资料。

### 2. 启动 Claude Code
在项目目录中使用 Opus 4.8 启动 Claude Code：

```bash
cd ~/research/belief-asymmetry
claude --model claude-opus-4-8
```

后续以 `/` 开头的命令均在 Claude Code 会话中执行。

### 3. 提交研究需求

在 Claude Code 会话中调用 `mguide`，并使用自然语言描述任务：

```text
/mguide 复现这篇论文：https://arxiv.org/abs/2506.09009
```

`mguide` 会对用户传入的任务进行分析，并询问无法从请求中确定的信息，例如模型、数据集、权重位置和 GPU 预算等。

确认需求后，`mguide` 在项目根目录生成任务描述文件 `task.md` 并展示其内容。用户确认任务配置后，系统会启动研究流水线。运行过程见 [流水线执行阶段](#pipeline)。

`mguide` 也可处理文献检索和研究历史查询。此类请求不会启动研究流水线：

```text
/mguide 帮我找找大语言模型中稀疏自编码器 feature absorption 方面的论文
/mguide 我想了解 circuit-level 可解释性是怎么一步步走到今天的
```

需要手动编写任务描述文件 `task.md` 并直接运行研究流水线时，见 [流水线执行阶段](#pipeline)。文献命令的完整用法见 [/msearch](#msearch) 和 [/mhistory](#mhistory)。

# 实验流水线设计

本章会使用以下术语：**behavior** 是待研究的模型行为，**mechanism** 是该行为的内部成因，**claim** 是可由实验检验的科学主张，**M0** 是进入机制分析前的行为验证，**gate** 是阶段之间的检查点，**variant** 是只替换一种实验条件的验证实验。完整定义见 [术语表](#glossary)。

## 任务描述：task.md {#taskmd | 任务描述：task.md}
`task.md` 用于描述研究任务。通过 `mguide` 启动时，系统会在项目根目录自动生成该文件。

### `task.md` 内容要求

`task.md` 是自由格式的 Markdown 文件，没有固定 schema。

文件可使用英文或中文。Mechanist 的工作语言（显示语言、生成的文件等）沿用 `task.md` 的语言。

根据实际研究的主题和需要，一份完整的 `task.md` 应当包含以下内容：

| 内容 | 适用情形 | 说明 |
|---|---|---|
| **behavior** | 已经知道或准备验证某种模型行为 | 具体且可证伪的模型输出模式。笼统的研究主题不能替代 behavior。 |
| **topic** | 只有研究方向，尚未确定具体行为 | 用于发现候选行为的研究方向。 |
| **mechanism** | 已经决定使用哪类机制方法 | 指定的方法家族，例如 steering vectors 或 probing。 |
| **model / data** | 需要指定使用的实验资源 | 模型标识、数据集及其路径。 |
| **主张列表 / goal** | 可选 | 待验证的科学主张和本轮研究目标。 |

本地模型和数据集应在 `task.md` 中填写明确路径。远程资源可由 Mechanist 在执行过程中自动下载。

私有资源的访问凭据应配置在启动环境中。`task.md` 只需记录资源标识或本地路径。多个项目可以共用同一模型缓存，避免重复下载。

### 配置 GPU 预算

在 `task.md` 中使用自然语言声明 GPU 时间和并发上限：

```text
你有 8 小时的 GPU 预算。在用满之前，不要因为 GPU 预算而暂停或简化实验。
最多可同时使用 8 张卡中的 4 张。
```

- GPU 预算同时用于限制资源消耗和确定实验规模。
- 可分别指定主实验和 verify 阶段的预算。
- GPU 预算属于硬约束。无法在预算内执行时，流水线停止并记录原因。

### 声明硬约束

不可自动调整的模型、数据或实验要求应明确写入 `task.md`。编排器会识别约束及其适用阶段。

```text
所有实验必须严格使用 Llama-3-8B，不要用 Pythia 2.8B。
验证主张 3 时只用 Pythia 1B 和 410M，暂时不要跑 2.8B。
```

在普通运行模式中，仅列出模型或数据表示资源偏好；使用“必须”“仅使用”“不得替换”等明确措辞时，才会成为不可自动放宽的硬约束。严格复现模式下，列出的模型、数据和实验规模默认都是硬约束。如任务在约束范围内无法完成，流水线将停止并记录原因。

### 配置进展通知

如需接收进度通知，可在 `task.md` 中指定接收地址和通知频率：

```text
把进度更新发到 example@gmail.com，每小时同步一次。
```

通知功能只使用用户已经配置并授权的邮件、webhook 或聊天集成，不负责安装或登录这些服务。除定时通知外，关键状态变化也会触发通知。

未检测到可用的通知服务时，Mechanist 不会发送消息，但仍会将简报写入 `notification/`。投递失败时，已生成的通知文件也会保留，流水线不会中断。

未声明通知要求时不发送。

## 运行模式：两条正交轴 {#run-modes | 运行模式：两条正交轴}
运行模式由两个独立参数组成：`behavior-source` 指定行为的来源及其是否需要验证；`mechanism` 指定机制方法由用户提供还是由系统选择。

### 轴 1：`behavior-source`——行为从哪里来

- **`given`**（默认）：`task.md` 提供已确立的行为。流水线跳过想法生成、新颖性检查和行为存在性验证。
- **`given-validation`**：`task.md` 提供待确认行为。机制研究前执行 M0 门控，检查该效应在不同措辞、随机种子和解码设置下能否复现，并排除混杂因素。
- **`discovery`**：`task.md` 仅提供研究方向。流水线执行文献调研、候选研究想法生成、可行性筛选、初步实验、新颖性与影响力评估以及外部评审。选定行为随后进入 M0 门控。

### 轴 2：`mechanism`——由谁选择可解释性方法

- **`discovery`**（默认）：系统选择 mechanism family，例如 probing、activation patching、SAE 分析或 steering vectors。选择结果和依据写入 `refine-logs/MECHANISM_ROUTING.md`。
- **`given`**：方法由 `task.md` 指定，流水线跳过自动选择。若既未指定方法，也未声明任务仅研究行为，claim 阶段停止并要求补充输入。

两个轴可以组成六种运行模式。不带参数的 `/auto` 等价于 `given` + `discovery`。

`given` + `given` 采用严格资源模式。指定的模型、数据集、数据量和必需实验均为硬约束。发生显存不足时，系统会尝试增加 GPU；仍无法执行则停止。

其他组合允许根据预算调整资源规模。

| behavior-source ↓ / mechanism → | `given`（任务指定方法） | `discovery`（系统选择方法） |
|---|---|---|
| `given`——直接采信，无 M0 | **复现组合**：资源硬约束 | **= 裸 `/auto`**：行为采信，机制自动探索 |
| `given-validation`——先验证（M0） | 先验证现象，再使用任务指定的方法 | 先验证，再由系统探索机制 |
| `discovery`——自主发现 + 想法生成（M0） | 新现象，使用任务指定的方法 | 端到端自动执行 |

> [!SMALL]
> 下文详细说明四种常用组合。另两种组合是 `given-validation` + `given`（先验证行为，再使用指定方法）和 `discovery` + `given`（先发现行为，再使用指定方法）；它们的输入要求可直接从上表确定。

### 组合 1 —— 复现已知结果：`given` + `given`

用于按照指定行为、方法和资源复现已有结论。

```text
/auto — behavior-source: given, mechanism: given
```

`task.md` 必须包含具体行为或科学主张，并指定机制方法；纯行为研究需显式声明不开展机制分析。该组合采用严格资源模式，模型、数据和规模均按不可自动缩减的约束处理。

该模式跳过研究想法生成、新颖性与影响力检查以及 M0。claim 阶段仅提取、拆分或澄清原始主张，不改变其含义。

原始主张会作为 `Original` 字段保存在 `idea-stage/IDEA_REPORT.md`。运行结束后，可在 `CLAIMS_LEDGER.md` 中核对实际使用的模型、数据和规模。

### 组合 2 —— 行为已知、机制未知：`given` + `discovery`

用于研究已确认行为的内部机制。这是 `/auto` 的默认模式。

```text
/auto — behavior-source: given, mechanism: discovery
```

`task.md` 必须包含具体、可证伪的行为。若仅提供研究主题，运行会暂停，要求补充行为或切换到 discovery 模式。即使启用了自动确认，必要输入检查也不会被跳过。

该模式跳过研究想法生成、新颖性与影响力检查以及 M0，直接进入机制研究。

### 组合 3 —— 行为存疑、先验证：`given-validation` + `discovery`

用于验证尚无论文或既有实验支持的具体行为。流水线先执行 M0 门控，确认行为成立后再开展机制研究。

```text
/auto — behavior-source: given-validation, mechanism: discovery
```

`task.md` 必须包含待验证的具体行为，也可附带不完整的验证步骤草稿；方法精炼阶段会补充缺失步骤。

该模式跳过研究想法生成和新颖性检查。M0 使用不同措辞、随机种子和解码设置验证行为，并检查混杂因素。

M0 通过后继续执行机制研究。结果为 `not-established` 时，运行生成负结果报告并结束。

### 组合 4 —— 只有一个方向：`discovery` + `discovery`

用于从研究方向开始发现候选行为，并对选定行为开展完整机制研究。

```text
/auto "LLM belief representations (per the KaBLE benchmark)" — behavior-source: discovery
# 也可以在 task.md 中描述方向后运行：
/auto — behavior-source: discovery
```

研究方向可直接写在命令中，因此 `task.md` 可省略。方向必须包含可识别的问题范围；过于宽泛的输入会触发澄清请求。

正式实验前，流水线会完成文献调研、候选生成、可行性筛选、初步实验和外部评审。选定行为通过 M0 后进入机制研究。

### M0 门控的四种判定

在组合 3 和 4 中，M0 存在性检验会给出以下四种结论：

| 结论 | 含义 | 接下来会发生什么 |
|---|---|---|
| `established` | 行为真实且稳健 | 机制研究正常继续 |
| `conditional` | 真实，但仅在部分条件下成立 | 仅在行为成立的条件范围内继续机制分析 |
| `not-established` | 行为不存在 | 生成负结果报告并结束运行 |
| `inconclusive` | M0 检验有缺陷或统计功效不足 | 修复检验后重新执行 M0；暂不进入机制研究 |

> [!SMALL]
> 组合 1 和 2（`behavior-source: given`）不会执行 M0。行为被直接采信，因此不会产生行为验证结论。

### 运行模式选择

| 任务条件 | 命令 | 预期结果 |
|---|---|---|
| 复现论文：行为和方法均已知 | `/auto — behavior-source: given, mechanism: given` | 按指定模型、数据和规模生成结论 |
| 行为已确立、机制未知（最常见） | `/auto — behavior-source: given, mechanism: discovery` | 选择并检验机制假设 |
| 已提出具体行为，但尚未确认 | `/auto — behavior-source: given-validation` | 行为成立时继续机制研究；不成立时生成负结果报告 |
| 只有研究领域，还没有具体行为 | `/auto "direction" — behavior-source: discovery` | 筛选候选行为并对选定行为开展机制研究 |
| 从开放方向发现新现象，并使用指定方法 | `/auto "direction" — behavior-source: discovery, mechanism: given` | 完成行为验证和机制研究，使用任务中指定的方法 |

## 流水线执行阶段 {#pipeline | 流水线执行阶段}
你也可以跳过 `mguide` 的引导流程，手动编写 `task.md`，再调用 `/auto` 启动流水线。

### 手动启动流水线

在项目根目录准备好 `task.md` 后，调用 `/auto`：

```text
/auto
```

需要指定运行模式时，在同一条命令中传入轴参数：

```text
/auto — behavior-source: given, mechanism: discovery
```

也可以直接在命令中提供研究方向。此时，`task.md` 作为详细背景：

```text
/auto "why is first-person belief accuracy lower than third-person in LLMs"
```

轴参数的含义和组合见 [运行模式](#run-modes)，其他参数见 [参数参考](#parameters)。

运行启动后，阶段目录会随执行进度依次生成。最终结论写入 `CLAIMS_LEDGER.md`。

### 四个执行阶段

流水线依次执行 **claim → experiment → verify → iterate** 四个阶段。完整文件清单见 [产物文件](#artifacts)。

```text
your question  (task.md, or /auto "...")
      |
      v
 1. claim        decide what to test          -> testable claims C1, C2, ...
      |
      v
 2. experiment   run the planned experiments  -> baseline verdict per claim
      |
      v
 3. verify       stress-test every result     -> robustness score per claim
      |
      v
 4. iterate      external review + fixes      -> final status per claim
      |
      v
 findings:  CLAIMS_LEDGER.md
```

### 阶段 1：科学主张定义（claim）

claim 阶段将研究任务转换为编号的可检验主张。随后为每条主张制定实验计划。

该阶段包括文献调研、主张编写和评审精炼。

- **输出：**`idea-stage/IDEA_REPORT.md`、`refine-logs/FINAL_PROPOSAL.md` 和 `refine-logs/EXPERIMENT_PLAN.md`。
- **交互：**`auto-proceed` 控制决策点是否自动确认。默认值 `true` 会采用推荐候选；设置为 `false` 时，可选择接受候选、改用其他候选、重新生成或停止。

### 阶段 2：实验执行（experiment）

experiment 阶段选择可解释性方法并执行实验计划。代码在完整运行前会经过审查和最小规模测试。

该阶段为每条主张生成 `supported` 或 `not-supported` 基线判定。`given-validation` 和 `discovery` 模式会先执行 M0。

- **输出：**`refine-logs/MECHANISM_ROUTING.md`、`refine-logs/EXPERIMENT_RESULTS.md`、`refine-logs/EXPERIMENT_TRACKER.md` 和 `runs/<run-id>/cost.json`。
- **交互：**实验默认自动部署。仅当 `auto-proceed: false` 与 `auto-deploy: false` 同时设置时，才会在部署 GPU 任务前请求确认。参数详情见 [参数参考](#parameters)。

`EXPERIMENT_TRACKER.md` 使用 `pending`、`running`、`done` 和 `failed` 记录实验进度。任务长时间停留在 `running` 时，应从该文件开始排查。

### 阶段 3：稳健性验证（verify）

verify 阶段先审计基线结果的完整性，再通过替换方法、数据集或模型检验结论的稳健性。

robustness 分数是与基线结论一致的有效替换实验所占比例。阴性结论同样可以接受稳健性验证。

- **验证状态：**`PASS`、`FAIL`、`INCONCLUSIVE`、`ZERO_ELIGIBLE_VARIANTS` 或 `INTEGRITY_ONLY`。
- **输出：**`verify/VERIFY_REPORT.md`、`verify/INTEGRITY_AUDIT.md` 和每项主张各自的 `ROBUSTNESS.md`。
- **交互：**部署确认规则与 experiment 阶段相同。

### 阶段 4：评审与迭代（iterate）

iterate 阶段使用外部模型评审项目，并在迭代预算内修复发现的问题。修复可能包括重做验证、重跑实验或修订主张。

评分达到 `target-score` 且不存在验证失败的主张时，流水线提前结束。否则在迭代次数耗尽后结束。

- **输出：**`review-stage/AUTO_REVIEW.md` 和 `review-stage/AUTO_ITERATION_FINAL_REPORT.md`。
- **关闭方式：**设置 `review-loop: false`，流水线在 verify 阶段后以 `truncated-at-verify` 结束。

```text
/auto — review-loop: false
```

最后阶段结束后，可在 `CLAIMS_LEDGER.md` 中查看各项主张的最终状态和未解决问题。

### 运行状态

- 阶段间的 gate 用于确认关键决策。`auto-proceed: true` 时自动采用推荐选项并记录日志；`auto-proceed: false` 时暂停并等待输入，且没有超时机制。
- 上一轮结果未归档、缺少具体 behavior 或触发 round-end decision 时，自动运行会暂停或结束，并写入相应状态。

> [!WARNING]
> `auto-proceed: true` 不会绕过输入和状态检查。上一轮结果未归档时需先运行 `/next-round`。`given` 或 `given-validation` 模式缺少具体 behavior 时，需补充任务定义。

### 提前结束状态

当必要输入缺失、完整性检查失败或结果不足以支持结论时，流水线将停止运行。结束状态会写入 `CLAIMS_LEDGER.md`，各状态的含义如下：

| 状态 | 含义 | 处理方式 |
|---|---|---|
| `ended-phenomenon-not-established` | M0 未确认目标行为，后续阶段不再执行 | 阅读阴性结果报告，或用 `/next-round` 选择其他行为 |
| `ended-phenomenon-inconclusive` | M0 检验无法得出结论 | 根据实验报告修复 M0 检验，然后重新验证同一行为 |
| `ended-needs-decision (<stage>: <reason>)` | 需要用户决策，例如没有可行候选、缺少结果文件、评分器无效或实验计划与方法冲突。 | 在 `CLAIMS_LEDGER.md → Round-End Decision` 中查看原因、已有产物和后续选项。 |
| `halted-at-<stage>` | 自动修复失败，例如 GPU 分配错误、显存不足或调试次数达到上限。 | 根据 `CLAIMS_LEDGER.md → Open Items` 中的 `Halted-stage diagnostics` 定位并修复问题。 |
| `truncated-at-verify` | 设置了 `review-loop: false`，流水线在 verify 后按配置结束。 | 读取 `verify/VERIFY_REPORT.md`；无需恢复运行。 |

> [!SMALL]
> 如果运行未启动，请依次检查任务定义、上一轮是否已归档，以及参数能否正确解析。

# 运行参数

## 参数参考 {#parameters | 参数参考}
本节说明 `/auto` 的参数语法、可用 flag、默认值和运行行为。

### 命令语法

整体形状是：引号里的研究方向 + 分隔符 + 逗号分隔的 `key: value` 选项：

```text
/auto "<direction>" — key: value, key: value, ...
```

- **方向参数可选。**项目根目录存在 `task.md` 时，可以使用 `/auto — key: value` 或 `/auto`。同时提供命令方向和 `task.md` 时，命令文本作为方向，`task.md` 作为详细任务定义。两者均缺失时，运行停止。
- **分隔符**是带空格的长破折号 ` — `，也接受普通的 `--`。第一个分隔符之前是方向，之后全部是选项。
- **键名会归一化。**`auto-proceed`、`auto_proceed` 和 `AUTO_PROCEED` 等价。本文统一使用小写连字符格式。
- `:` 和 `,` 两侧的空格会被忽略；带引号的值原样保留。

下面三条命令完全等价：

```text
/auto "direction" — auto-proceed: false, claim-model: opus, dimensions: method,dataset
/auto "direction" -- auto_proceed: false, claim_model: opus, dimensions: method,dataset
/auto "direction" — AUTO_PROCEED: false, CLAIM_MODEL: opus, DIMENSIONS: method,dataset
```

### 无效参数的处理方式

| 值类型 | 值非法时 | 示例 |
|---|---|---|
| 模型类 flag | **直接终止。**只接受家族别名 `opus`、`sonnet` 和 `haiku`。 | `model: claude-opus-4-8` ✗ |
| 布尔值 | 除 `true`/`false`/`1`/`0`/`yes`/`no` 外一律**直接终止**。 | `auto-proceed: maybe` ✗ |
| 枚举类（`batch-dispatch`、`behavior-source`、`mechanism`） | **记一条 warning 并回退到默认值**，继续运行。 | `mechanism: giv` → `discovery` |
| 未知键名 | 记录 warning 后忽略。已删除的 `mode:` 也按未知键处理。 | `mode: reproduction` → 被忽略 |

> [!SMALL]
> 历史别名：`max-rounds` 在当前版本仍被接受，会静默转换为 `max-iterations`。

### 主要参数一览表

下表中的 flag 均为<span class="badge opt">optional</span>。存在 `task.md` 时，`/auto` 即为完整命令。默认值适用于无人值守运行。

| 参数 | 取值 | 默认 | 效果 |
|---|---|---|---|
| `auto-proceed` | `true\|false` | `true` | 控制决策点是否需要人工确认。`true` 自动采用推荐项；`false` 暂停并无限期等待输入。 |
| `review-loop` | `true\|false` | `true` | 是否在 verify 后执行自动评审和修复。设为 `false` 时以 `truncated-at-verify` 结束。 |
| `resume` | `true\|false` | `false` | 从中断位置恢复；已有完整产物的阶段跳过，仅执行剩余阶段。`false` 会在当前轮次内重新执行阶段并覆盖对应产物，但不会绕过上一轮未归档检查。 |
| `model` | `opus\|sonnet\|haiku` | 未设 | 设置全部流水线阶段的默认模型，可被分阶段参数覆盖。交互会话模型由 `/model` 单独设置。 |
| `claim-model` / `experiment-model` / `verify-model` / `iteration-model` | `opus\|sonnet\|haiku` | 未设 | 设置单个阶段的模型。优先级高于全局 `model`。 |
| `dimensions` | `method,dataset,model` 的子集 | `model` | 设置 verify 使用的替换维度。每个维度生成一个 variant。 |
| `target-claims` | `all\|passed\|failed\|<id>` | `all` | 设置接受完整性审计的主张。指定单个 id 时，该主张同时进入替换实验，不受 `max-verify-claims` 限制。 |
| `max-verify-claims` | 整数 | `1` | 设置通过审计后进入替换实验的主张数量上限。其他目标主张仍接受完整性审计。 |
| `robustness-threshold` | 0–1 | `0.5` | 设置主张判定为 `PASS` 所需的最低 robustness 分数。 |
| `min-variants-for-verdict` | 整数 | `1` | 设置形成 PASS/FAIL 判定所需的有效 variant 数量。数量不足时状态为 `ZERO_ELIGIBLE_VARIANTS`。 |
| `base-repo` | GitHub URL | 未设 | 指定需要复用的代码仓库。详见下文。 |
| `research-domain` | 任意字符串 | `auto` | 限制机制方法选择范围的领域标签，例如 `mechanistic-interpretability` 或 `vision-encoders`。`auto` 从 proposal 推断，无法推断时使用 `general`。 |
| `compact` | `true\|false` | `false` | 生成精简版摘要，并省略每项主张各自的 `ROBUSTNESS.md`。 |
| `code-review` | `true\|false` | `true` | 部署前由外部模型检查实验和 variant 代码。检查包括 ground truth 来源和评分器与答案格式的一致性。未配置评审服务时跳过。 |
| `sanity-first` | `true\|false` | `true` | 全量部署前执行最小实验以检查环境和代码。失败后最多自动调试 3 次，仍失败则停止。 |
| `auto-deploy` | `true\|false` | `true` | 控制全量实验和 variant 的自动部署。仅当该值与 `auto-proceed` 均为 `false` 时请求部署确认。 |
| `max-parallel-runs` | 整数 | `4` | 设置 experiment 和 verify 阶段的最大并行实验数。 |
| `batch-dispatch` | `auto\|queue\|direct` | `auto` | 设置批量实验使用自动调度、队列调度或直接部署。 |
| `ref-paper` | PDF 路径 / arXiv URL / 论文 URL / `false` | `false` | 指定想法生成阶段使用的参考论文。详见下文。 |
| `behavior-source` | `given\|given-validation\|discovery` | `given` | 设置 behavior 的来源及是否先做验证。见 [运行模式](#run-modes)。 |
| `mechanism` | `given\|discovery` | `discovery` | 设置机制方法由 `task.md` 指定（`given`）或由系统选择（`discovery`）。见 [运行模式](#run-modes)。 |
| `max-iterations` | 整数 | `6` | 设置评审阶段的最大自动修复次数。 |
| `max-claim-reentries` | 整数 | `2` | 设置可重新定义主张的最大次数。该次数计入 `max-iterations`。 |
| `target-score` | 1–10 | `6` | 设置评审循环的目标分数。达到分数且没有未解决的失败主张时结束。 |
| `gpu-id` | `auto` / id / 逗号列表 | `auto` | 将实验限制在指定 GPU 上。 |
| `oom-max-gpus` | 整数 / `auto` | `4` | 设置严格复现模式发生 OOM 时可追加的 GPU 上限。 |
| `underpower` | `tag\|stop\|off` | `tag` | 设置低统计功效结果的处理方式：标记、停止或忽略。 |
| `ledger-figures` | `auto\|true\|false` | `auto` | 控制是否在结论报告中生成图表。 |

> [!SMALL]
> variant 数量等于 `max-verify-claims` 与 `dimensions` 所含维度数的乘积。例如，3 项主张使用 3 个维度时，共生成 9 个 variant。

### 指定参考论文：`ref-paper`

使用 `ref-paper` 指定参考论文后，流水线会先生成论文摘要。后续想法生成以该摘要为上下文。

- **arXiv URL**：通过 `/arxiv` 下载 PDF，并读取前 5 页的标题、摘要、引言和方法概览。
- **本地 PDF 路径**——直接读取（前 5 页）。
- **其他论文 URL**——抓取网页并提取内容。

```bash
# 基于 arXiv 论文开展研究
/auto "improve the steering method in this paper" — ref-paper: https://arxiv.org/abs/2405.00001

# 使用本地 PDF
/auto — ref-paper: papers/reference.pdf
```

解析结果写入 `idea-stage/REF_PAPER_SUMMARY.md`。使用 arXiv URL 时，下载的 PDF 保存到 `papers/`。实验开始前可检查摘要是否正确识别论文的方法和限制。

### 在现有代码上扩展：`base-repo`

`base-repo` 用于指定需要复用的代码仓库。适合复现或扩展已公开官方代码的论文：

```bash
# 使用论文的公开代码复现或扩展研究
/auto — ref-paper: https://arxiv.org/abs/2406.04329, base-repo: https://github.com/org/paper-code
```

仓库克隆到项目目录下的 `base_repo/`。后续生成的实验代码在该仓库基础上扩展。

### 提供本地 PDF：`literature/` 目录

文献检索会扫描项目根目录下的两个 PDF 文件夹：

| 文件夹 | 归属 | 行为 |
|---|---|---|
| `literature/` | 用户维护 | 流水线只读。用于存放阅读清单、必引文献和带批注的副本。 |
| `papers/` | 流水线 | 存放自动下载的 arXiv PDF。 |

```bash
mkdir -p literature
cp ~/Downloads/steering-vectors-survey.pdf literature/
# 随后正常运行 /auto
```

> [!SMALL]
> 每轮最多扫描 20 个本地 PDF，每份读取前 3 页。重复论文优先使用 `literature/` 中的副本。流水线不会修改该目录中的文件。

### 分阶段模型覆盖

每个阶段独立按以下优先级解析模型：

1. 分阶段 flag：`<stage>-model: <alias>`
2. 全局 flag：`model: <alias>`
3. 都没设 → 使用该阶段的内置默认模型。

```bash
# 默认使用 sonnet，verify 阶段改用 opus
/auto — model: sonnet, verify-model: opus
```

上述参数不影响交互会话使用的模型。交互模型通过 `/model` 设置。

运行开始时的 `[models]` 行显示每个阶段最终采用的模型，可用于核对覆盖结果。

### `dimensions`：配置压力测试维度

`dimensions` 指定需要替换的实验成分，可选值为 **method**、**dataset** 和 **model**：

```bash
# 默认配置：每项进入替换实验的主张生成 1 个变体
/auto — dimensions: model

# 验证全部维度：每项进入替换实验的主张生成 3 个变体
/auto — dimensions: method,dataset,model
```

默认配置只替换模型，因此每项进入替换实验的主张生成一个 variant。

### `review-loop`：配置自动评审

```bash
# 在 verify 阶段后结束
/auto — review-loop: false
```

设置为 `false` 后，运行在 verify 阶段结束，不再执行自动评审和修复。`CLAIMS_LEDGER.md` 仍会更新，但不会生成 `review-stage/` 下的迭代报告。

若没有结果通过完整性审计，则以 `ended-needs-decision` 结束。

### `auto-proceed`：配置交互方式

```bash
# 在每个决策点请求确认
/auto — auto-proceed: false

# 同时在部署 GPU 任务前请求确认
/auto — auto-proceed: false, auto-deploy: false
```

设置为 `false` 时，流水线在需要用户决策时暂停，且没有超时。默认值 `true` 会自动采用推荐选项。

> [!WARNING]
> `auto-proceed: true` 不会跳过必要的输入检查。上一轮产物未归档或任务缺少具体 behavior 时，流水线仍会暂停。

### `gpu-id`：指定 GPU

```bash
# 将实验、验证变体和修复任务限制在 GPU 4-7
/auto — gpu-id: 4,5,6,7, max-parallel-runs: 2
```

实验仅可使用指定 GPU。发现使用了未指定设备时，流水线以 `halted-at-<stage>` 停止。

默认值 `auto` 不限制设备。纯 CPU 步骤不受该参数影响。

实际设备记录在 `runs/<run-id>/cost.json` 的 `gpu_ids` 字段中。纯 CPU 步骤的该字段可以为空。

### 资源估算

| 操作 | 默认资源或耗时 |
|---|---|
| 文献检索和想法生成 | 不需要 GPU。单次 Mechanic-DB 检索通常需要 3–20 分钟。 |
| discovery 初步实验 | 单个实验通常需要 30 分钟至 4 小时；默认总预算上限为 10 GPU 小时。 |
| verify | 默认验证 1 项主张的 `model` 维度，对应 1 次 variant GPU 运行。 |

实际 GPU 用时记录在 `runs/<run-id>/cost.json`。

# 解读实验结果

## 产物文件 {#artifacts | 产物文件：各阶段留下什么}
流水线将各阶段的输入、结果和状态写入项目目录。本节按生成阶段说明主要产物及其用途。

> [!NOTE]
> 运行结束后，先查看 `CLAIMS_LEDGER.md` 获取各项主张的结论、流水线状态和待处理事项，再查看 `verify/VERIFY_REPORT.md` 获取稳健性验证结果。

```bash
ls CLAIMS_LEDGER.md verify/VERIFY_REPORT.md
```

> [!SMALL]
> `CLAIMS_LEDGER.md` 在所有结束状态下生成。`verify/VERIFY_REPORT.md` 仅在执行 verify 阶段后生成。

### 输入文件

| 文件 | 内容 | 使用时机 |
|---|---|---|
| `task.md` <span class="badge opt">optional</span> | 研究任务和运行配置。完整示例见 [任务描述：`task.md`](#taskmd)。 | 首次运行前或轮次之间。 |

### claim 阶段之后

| 文件 | 内容 | 用途 |
|---|---|---|
| `idea-stage/IDEA_REPORT.md` | 候选研究想法及其评估结果，或从 `task.md` 提取的 behavior 和主张。 | 选择或复核研究问题时。 |
| `idea-stage/REF_PAPER_SUMMARY.md` | `ref-paper` 指定论文的摘要；仅在设置该参数时生成。 | 复核参考论文的解析结果时。 |
| `refine-logs/FINAL_PROPOSAL.md` | 评审后的研究提案。 | 实验执行前复核研究方案时。 |
| `refine-logs/EXPERIMENT_PLAN.md` | 各项主张的实验设计和成功判据。 | 批准实验或处理计划冲突时。 |
| `refine-logs/EXPERIMENT_TRACKER.md` | 各项实验的状态，取值为 `pending`、`running`、`done` 或 `failed`。 | 监控实验进度和定位停滞任务时。 |

### experiment 阶段之后

| 文件 | 内容 | 用途 |
|---|---|---|
| `refine-logs/MECHANISM_ROUTING.md` | 选定的方法家族、2–3 个候选方法及选择依据。 | 复核机制方法的选择依据时。 |
| `refine-logs/EXPERIMENT_RESULTS.md` | 各项主张的统计结果和基线判定。文末说明是否可进入 verify 阶段。 | 查看基线实验结果时。 |
| `runs/<run-id>/cost.json` | 单次运行的 GPU 小时开销和实际使用的 GPU。 | 核算资源消耗或检查设备分配。 |
| `experiment_queue/<timestamp>/` | 批量实验的队列清单、运行信息和摘要。仅在使用实验队列时生成。 | 跟踪批量实验的执行进度。 |

### verify 阶段之后

| 文件 | 内容 | 用途 |
|---|---|---|
| `verify/VERIFY_REPORT.md` | 各项主张的验证状态和汇总结果。 | verify 阶段结束后。 |
| `verify/INTEGRITY_AUDIT.md` | 原始实验和各替换实验的完整性审计结果。 | 排查 `INCONCLUSIVE` 或 `ZERO_ELIGIBLE_VARIANTS` 时。 |
| `verify/<claim>/PLAN.md` | 该项主张的替换实验配置及其选择依据。 | 检查验证设计。 |
| `verify/<claim>/ROBUSTNESS.md` | 单项主张的替换实验记录、一致性结果和最终分数。 | 检查判定依据。 |
| `verify/<claim>/variants/…` | 各替换实验的配置、相对基线的代码差异、结果和判定。 | 分析与基线不一致的实验。 |
| `verify/<claim>/main_experiment_audit/` | 基线实验的完整性审计。 | 分析 `INCONCLUSIVE` 状态。 |
| `verify/<claim>/variant_audit/` | 替换实验的完整性审计。 | 分析被排除的变体。 |

### iterate 阶段之后

| 文件 | 内容 | 用途 |
|---|---|---|
| `review-stage/AUTO_REVIEW.md` | 每轮评分、结论、问题和修复动作。 | 审查迭代过程。 |
| `review-stage/REVIEW_STATE.json` | 已使用的迭代与主张改写次数、最新评分、结论和终止原因。 | 检查修复预算或恢复中断的评审循环。 |
| `review-stage/REVIEWER_MEMORY.md` | 跨轮保留的未解决问题。 | 跟踪持续存在的评审意见。 |
| `review-stage/AUTO_ITERATION_FINAL_REPORT.md` | 各项主张的修订、否定或范围收窄记录，以及未解决事项。 | 查看 iterate 阶段结果。 |

### 项目根目录的全程文件

| 文件 | 内容 | 用途 |
|---|---|---|
| `CLAIMS_LEDGER.md` | 各项主张使用的数据、方法、基线判定、robustness、评审结果和 `final_status`。同时记录证据路径、GPU 用时和待处理事项。 | 优先从此文件查看运行状态和最终结论。 |
| `claims_ledger.json` | 台账的机器可读版本。 | 供脚本读取。 |
| `research_memory.json` | 跨轮次保留的研究结论和已尝试方向。 | 规划下一轮研究时。 |
| `figures/` | 按主张组织的 PNG、PDF、Markdown 和 LaTeX 图表，索引见 `figures/INDEX.md`。 | 获取论文或演示文稿所需图表。 |
| `rounds/round_<N>/` | 执行 `/next-round` 时创建的已完成轮次归档。 | 查看历史轮次时。 |

主要产物按运行顺序依次为 `task.md`、`EXPERIMENT_PLAN.md`、`EXPERIMENT_RESULTS.md` 和 `VERIFY_REPORT.md`。最终状态汇总在 `CLAIMS_LEDGER.md` 中。

## 验证与判定 {#verification | 验证与判定：读懂结果}
experiment 阶段结束后，Mechanist 通过替换实验和完整性审计验证各项主张，并由独立评审模型（默认 `gpt-5.4`）生成判定。

### 验证报告

- **`verify/VERIFY_REPORT.md`**：汇总各项主张的验证结果和后续处理方式。
- **`verify/INTEGRITY_AUDIT.md`**：汇总各项主张的原始实验审计和变体审计，包括判定及问题摘要。
- **`verify/<claim_dir>/ROBUSTNESS.md`**：记录单项主张的 robustness、各验证维度的结果和诊断原因。
- **`verify/<claim_dir>/variants/<tag>/`**：保存单次替换实验的配置差异、结果和判定。
- **`verify/<claim_dir>/main_experiment_audit/`** 与 **`variant_audit/`**：保存基线实验和替换实验的完整审计报告。

### 替换实验（swap variant）

每项主张（编号为 `C1`、`C2` 等）先由基线实验检验，并得到 `supported` 或 `not-supported` 结论。

验证阶段使用变体（variant）重复实验。每个变体仅替换方法、数据集或模型中的一个维度。变体结论与基线一致，表示该项主张在对应维度上具有稳健性。

除被替换的维度外，超参数和随机种子等条件保持不变。

验证也适用于基线结论为否定的主张。否定结论在替换实验中保持一致时，同样可判定为 `PASS`。

验证期间不会修改主张。替换方法时，候选方法限于同一 mechanism 家族。

### 选择替换维度：`dimensions` 参数

默认配置仅替换 `model` 维度，因此每项进入替换实验的主张运行一个变体。`/auto-verify` 不指定主张时，会对全部目标主张执行完整性审计；其中默认只有优先级最高的一项进入替换实验。指定单项主张时，只处理该主张，并直接对它运行替换实验。

```bash
# 默认只替换模型，每项进入替换实验的主张生成 1 个变体
/auto-verify C1

# 只替换方法，每项进入替换实验的主张生成 1 个变体
/auto-verify C1 — dimensions: method

# 替换两个维度，每项进入替换实验的主张生成 2 个变体
/auto-verify C1 — dimensions: method,dataset
```

> [!SMALL]
> 命令执行前会输出主张、维度、变体数量和预计 GPU 用时。执行后生成 `verify/VERIFY_REPORT.md` 和对应的 `verify/C1_<slug>/` 目录。

报告只将实际验证的维度计入支持证据。

默认每轮仅对一项主张运行替换实验（`— max-verify-claims: 1`）。其余目标主张只执行完整性审计，并记录为 `INTEGRITY_ONLY`。可使用 `/auto-verify <id> — resume: true` 为指定主张补充替换实验。

### 稳健性分数计算示例

Robustness 是 0–1 之间的分数，表示通过完整性审计的变体中，与基线结论一致的比例。该分数记录在 `ROBUSTNESS.md` 和汇总报告中。

```text
robustness = #pass / N_eligible

# N_eligible：完整性审计结果为 PASS 或 WARN 的变体数
# #pass：结论与基线实验一致的有效变体数
# robustness 不低于阈值时，主张的验证状态为 PASS（默认阈值为 0.5）
```

例如，C1 的基线结论为 `supported`，三个变体均通过完整性审计：

- **换方法**：结论为 `supported`，记为 **pass**。
- **换数据集**：结论为 `supported`，记为 **pass**。
- **换模型**：结论为 `not-supported`，记为 **fail**。

此时 `robustness = 2 / 3 ≈ 0.67`，高于默认阈值 0.5，因此状态为 `PASS`。报告同时指出 model 维度未通过验证。

未通过完整性审计的变体不参与计算。如果没有变体通过审计，状态为 `ZERO_ELIGIBLE_VARIANTS`。

| N_eligible | 阈值 0.5 下 PASS 需要什么 |
|---|---|
| 1 | 分数只能是 0 或 1；只有 1/1 才 PASS（默认情形） |
| 2 | 2 个里 1 个一致即可（0.5 ≥ 0.5） |
| 3 | 3 个里至少 2 个（0.667 通过，0.333 不通过） |

> [!SMALL]
> 可通过 `— robustness-threshold` 调整阈值。各项主张独立计算，不进行跨主张平均。

### 五种结论

每项完成验证的主张在 `VERIFY_REPORT.md` 中具有以下五种状态之一：

| 状态 | 含义 | 后续处理 |
|---|---|---|
| **PASS** | 足够比例的可信变体与基线结论一致，适用于支持和否定两种基线结论。 | 核对主张文本与数据后继续后续阶段。 |
| **FAIL** | 可信变体与基线结论的一致比例低于阈值。`ROBUSTNESS.md` 记录不一致的维度。 | 评审循环复核证据后收窄或改写主张。 |
| **INCONCLUSIVE** | 基线实验未通过完整性审计，因此不执行变体实验。 | 修复并重跑基线实验。 |
| **ZERO_ELIGIBLE_VARIANTS** | 原始实验通过审计，但所有变体均未通过审计，因此 `N_eligible = 0`。原因记录在 `zero_eligible_reason` 和 `variant_audit/`。 | 修复变体后重新验证，不重跑基线。也可删除失败的变体目录，再执行 `/auto-verify <claim-id>`。 |
| **INTEGRITY_ONLY** | 主张通过完整性审计但未执行替换实验，原因记录在 `stage2_skip_reason`。 | 该主张写入 Open Items，可使用 `/auto-verify <claim-id> — resume: true` 补充验证。 |

> [!NOTE]
> 五种状态均属于有效的验证结果。`FAIL` 表示结论对部分条件敏感；`INCONCLUSIVE` 表示现有实验无法提供有效判定。

### 完整性审计结果（PASS / WARN / FAIL）

每项主张接受评测方法和 mechanism 调参两项完整性审计。审计仅检查实验过程，不判断主张是否成立。

审计结果分为 `PASS`、`WARN` 和 `FAIL`。这些名称只表示实验过程是否完整，不是主张的验证状态。完整报告位于 `EXPERIMENT_AUDIT.md` 和 `MECHANISM_AUDIT.md`。

- **Ground truth 来源**：模型输出作为标签但未标记为 proxy 时判定为 `FAIL`。
- **分数归一化**：指标分母依赖预测结果本身时判定为 `FAIL`。
- **结果文件一致性**：主张引用的路径、字段或数值不存在或不一致时判定为 `FAIL`。
- **死代码**：已定义的指标函数未被调用时判定为 `WARN`。
- **覆盖范围**：结论声明的覆盖范围超过实际测试范围时判定为 `WARN`。
- **评测类型**：记录为 `real_gt`、`synthetic_proxy`、`self_supervised_proxy`、`simulation_only` 或 `human_eval`，不参与通过判定。

第二项审计针对 mechanism 调参。对于 steering 干预，系数扫描必须覆盖至少 3 个数量级并包含 `α=0`。各扫描点需记录独立能力指标，最终系数应位于可用区间内。

直接采用其他论文的固定系数判为 `FAIL`。扫描范围不足或缺少随机方向对照判为 `WARN`。不包含 mechanism 干预的主张记为 `N/A`。

基线审计为 `FAIL` 时，主张判定为 `INCONCLUSIVE`，不执行变体实验。变体审计为 `FAIL` 时，该变体不参与 robustness 计算。`WARN` 不排除证据，但会在结论中标记。

### 评审与修复循环

每轮评审由独立模型检查实验结果，并为未解决的主张指定修复动作。流水线完成修复后进入下一轮评审。

评审过程记录在 `review-stage/AUTO_REVIEW.md` 和 `review-stage/REVIEWER_MEMORY.md`。

评审循环最多执行 6 次修复和 2 次主张改写。每项主张最多重做 2 次主实验。连续两轮未产生修改时，循环终止。

完成评审需同时满足以下条件：评分不低于 `target-score`（默认 6），评审结论为 `ready` 或 `almost`，且不存在验证状态为 `FAIL`、`INCONCLUSIVE` 或 `ZERO_ELIGIBLE_VARIANTS` 的主张。未解决事项写入最终报告的 Open Items。

如需在验证后结束运行，可向 `/auto` 传入 `review-loop: false`：

```text
/auto "in-context learning induction heads" — review-loop: false
```

> [!SMALL]
> 运行将以 `truncated-at-verify` 状态结束，`verify/VERIFY_REPORT.md` 作为最终验证报告，不生成 `review-stage/` 下的迭代报告。评审循环可后续补充执行。

> [!WARNING]
> **验证依赖外部评审模型。**`LLM_MODEL` 未设置时使用默认值 `gpt-5.4`；`LLM_API_KEY` 未配置或无效时，评审步骤将报错并中止。服务暂时不可用时，相关结论标记为 `[pending external review]`。配置方法见 [环境变量](#environment)。

> [!SMALL]
> 问题定位入口：验证问题从 `verify/VERIFY_REPORT.md` 开始，评审问题从 `review-stage/AUTO_REVIEW.md` 开始。

# 高级控制流

## 多轮研究：/next-round {#next-round | 多轮研究：/next-round}
每次运行构成一个轮次。`/next-round` 归档当前轮次，并生成下一轮的 `task.md` 草稿。

### 三种命令形式

```text
/next-round new-behavior          # explore a brand-new phenomenon next round
/next-round new-mechanism B1      # keep behavior B1, try an untried mechanism direction
/next-round                       # no argument: reads memory, recommends, asks you to confirm
```

- `new-behavior`：研究新的现象。当前轮次的数据和缓存随产物一并归档。
- `new-mechanism <behavior-id>`：继续研究指定 behavior，并更换 mechanism 方向。数据和缓存保留在根目录供下一轮复用。省略 id 时使用最近的 behavior。
- 不带参数：根据已有结论推荐下一步，并请求确认。

无参数模式按上一轮状态生成建议：

| 上一轮状态 | 建议 |
|---|---|
| `not-established` | 使用 `new-behavior` 研究新现象。 |
| `inconclusive` | 使用 `behavior-source: given-validation` 重新验证原行为。 |
| `established` / `conditional`，且仍有未尝试机制 | 使用 `new-mechanism`。 |
| 所有机制方向均已有结论 | 使用 `new-behavior`。 |
| `ended-needs-decision` | 按报告中的修复要求继续同一研究。 |

### 示例与输出

```text
/next-round new-mechanism B1
```

命令按以下顺序执行：

1. 输出归档计划，列出移入归档和保留在根目录的文件。
2. 将当前轮次产物移入 `rounds/round_<N>/`。
3. 在项目根目录生成下一轮的 `task.md` 草稿。
4. 输出归档路径和下一步操作。

> [!SMALL]
> `research_memory.json`、`rounds/`、`notification/`、当前 `task.md` 和项目配置保留在根目录。旧版 `task.md` 的快照写入归档。目标归档目录已存在且非空时，命令将停止，不修改文件。

### 强制重做已有定论的工作：`retry-settled`

默认情况下，后续轮次不会重复已有定论的 behavior 或 mechanism family。如需重新执行，可在 `task.md` 中添加：

```bash
# task.md
family: Steering Vectors
retry-settled: true
```

> [!SMALL]
> 设置后，`/auto` 将重新执行固定指定的已解决条目。未设置时，全自动模式改选未尝试条目并记录日志，交互模式请求确认。

> [!WARNING]
> 上一轮产物尚未归档时，`/auto` 会在写入文件前停止，包括全自动模式。此时可运行 `/next-round`，或使用 `resume: true` 继续上一轮未完成阶段。只有通过这项检查、开始执行当前轮次后，`resume: false` 才会重新生成当前轮次的阶段产物；它不会绕过归档保护。

## 批量生成想法：/hypothesis-batch {#hypothesis-batch | 批量想法：/hypothesis-batch}

`/hypothesis-batch` 围绕指定主题生成候选研究想法，并将十项入选想法展开为可独立评审的研究方案。该命令不执行实验，适合用于确定研究问题。

### 最小示例

```text
/hypothesis-batch "LLM beliefs"
```

> [!SMALL]
> 结果写入 `idea-stage/IDEA_REPORT.md` 和 `claims/` 目录。

### 候选研究想法筛选流程

候选生成阶段强调研究方向的覆盖范围，避免生成同一框架的重复方案。

| 步骤 | 发生了什么 |
|---|---|
| **文献综述** | `/research-lit` 汇总子方向、开放问题和结构性空白。 |
| **候选生成** | 分三轮生成约 30 项研究想法，分别覆盖文献空白、未使用的机理方向和前两轮未覆盖的现象类别。 |
| **新颖性检查** | 删除已有公开工作直接覆盖的候选，并为保留项记录最接近的三项工作。 |
| **影响力评分** | 根据研究问题的重要性评分，不作为单独淘汰条件。 |
| **外部评审** | 评估实验设计能否回答对应研究问题。 |
| **候选筛选** | 删除存在致命设计缺陷的候选，其余按影响力、评审分和新颖性排序，保留 10 项。 |
| **方案展开** | 为 10 个候选分别生成独立目录和完整方案。 |

### 输出产物

```text
idea-stage/
  RESEARCH_LIT.md          # 原始检索记录
  LANDSCAPE.md             # 领域综述
  IDEA_REPORT.md           # 候选研究想法、排序和筛选结果
claims/
  01_<name>/
    FINAL_PROPOSAL.md
    EXPERIMENT_PLAN.md
    claim.json             # 可独立评审的自包含研究方案
  02_<name>/
  …
  10_<name>/
```

候选研究想法的淘汰原因记录在 `IDEA_REPORT.md`。每项入选想法对应的研究提案、实验计划和结构化数据保存在其候选目录中。

> [!NOTE]
> 排序仅用于候选研究想法的筛选，不构成实验结论。候选研究想法中的行为假设需在流水线中通过 M0 gate 验证。见 [运行模式](#run-modes)。

### 把研究方案转为一次运行

选择候选目录后，可将其中的 `FINAL_PROPOSAL.md` 作为新工作目录中 `task.md` 的初稿，或交由 `mguide` 生成 `task.md`。随后按 [首次运行](#quickstart) 执行流水线。

# 文献命令

## 一次性文献检索：/msearch {#msearch | 文献检索：/msearch}
`/msearch` 检索已配置的文献来源，并生成一份合并报告。支持的数据源包括 Zotero、Obsidian、本地 PDF、Web、arXiv 和 Mechanic-DB。未配置的数据源会被跳过。

### 用法与常用参数

```text
/msearch "sparse autoencoder feature absorption in large language models"
# 可选参数写在长破折号之后：
/msearch "..." — arxiv download: true, max download: 10
/msearch "..." — extra: semantic-scholar, deepxiv
/msearch "..." — paper library: ~/my_papers/
```

> [!SMALL]
> 结果保存在 `msearch/<slug>/`。重复检索同一问题时复用该目录。

### 输出文件

- `LANDSCAPE.md`：主要阅读报告，包含论文表格、综合叙述、尚未解决的结构性空白及历史上未成功的研究方向。
- `RESEARCH_LIT.md`：原始检索记录，包括各论文的摘要和来源。

### 两个本地 PDF 文件夹

| 文件夹 | 归属 | 行为 |
|---|---|---|
| `literature/` | 人工维护 | 检索过程只读，不写入或删除文件。 |
| `papers/` | 流水线（机器管理） | 自动下载的落盘处，随时可以清空。 |

两个目录包含同一论文时，优先使用 `literature/` 中的版本。

> [!SMALL]
> `/msearch` 产物不作为流水线输入。流水线会在运行期间独立完成所需的文献综述。

## 领域发展史：/mhistory {#mhistory | 领域发展史：/mhistory}
`/mhistory` 生成指定主题的发展史，覆盖经典工作和近期研究。报告篇幅为 2500–4500 词。

### 用法

```text
/mhistory "the evolution of circuit-level interpretability"
```

> [!SMALL]
> 输出文件为项目根目录下的 `development_history.md`。报告按时期组织，并在结尾列出争议和开放问题。参考文献区分数据库与 Web 来源。

命令通常需要数分钟至约 20 分钟。Mechanic-DB 不可用时，报告改用 Web 来源并注明数据源状态。

# 研究方法参考

以下内容说明 Mechanist 如何选择研究方向、方法家族并检查实验规范。首次运行不要求预先掌握这些内容；只需选择运行模式即可。命令配置见 [参数参考](#parameters)。

## 机制方法与数据约束 {#mechanisms | 机制方法与数据约束}
流水线根据任务确定研究现象、研究方向和方法家族。如需固定方法，可在 `task.md` 中声明。

机制主张要求因果证据。仅识别与行为相关的组件不足以支持机制结论；还需通过消融、放大或其他干预验证行为是否按预测方向变化。behavior 与 mechanism 的定义见 [术语表](#glossary)。

### 行为发现（Behavior Discovery）

`behavior-source: discovery` 模式先从开放式研究方向中筛选候选现象。候选来源包括：

1. **高风险领域迁移**：在科学、医学、语言演化、多智能体社会科学或创造力等领域检验已知现象，并收紧前提或后果范围。
2. **人类科学类比**：检验心理学或神经科学发现是否适用于 LLM。大脑与 LLM 的对比通常需要 EEG 数据。
3. **跨模态迁移**：在图像、视频或多模态模型上检验文本模型中的已知现象。
4. **既有计算机科学结论复验**：在当前模型上重新检验早期计算机科学结论。
5. **成立条件与来源分析**：分析现象随规模、checkpoint、prompt 格式、语言或难度的变化，并区分训练期成因和推理期成因。
6. **元分析**：从已有结果中提炼 scaling law、Densing Law 等规律，并确定适用边界。

候选现象需同时满足以下五项标准：

| 标准 | 要求 |
|---|---|
| **real** | 能在真实数据和指标上复现，而非单条 prompt 的孤例。 |
| **non-obvious** | 结果并非模型研究者可以直接预期。 |
| **specific** | 能表述为可证伪、可量化的行为假设。 |
| **robust** | 更换 prompt、随机种子或解码参数后仍然存在。 |
| **tractable** | 可在当前模型、数据和 GPU 预算范围内完成。 |

> [!SMALL]
> 发现阶段优先使用已有的权威数据集。已有明确结论的现象默认不会在后续轮次重复提出。设置 `retry-settled: true` 可重新执行此类现象。

### 六类研究方向

现象确定后，流水线从六类研究方向中选择实验目标。选定方向、排除项和理由记录在 `refine-logs/EXPERIMENT_PLAN.md` 的 `mechanism_strategy:` 块中：

1. **Location（定位）**：使用相关性方法对候选层、注意力头、神经元或特征方向排序。定位结果用于提出机制假设，不单独构成因果证据。
2. **Causal Intervention（因果干预）**：通过消融（ablate）、替换（patch）或引导（steer）检验候选组件是否因果影响目标行为。
3. **Tuning & Editing（调优与编辑）**：使用 steering 向量、task 向量、权重编辑或定向微调改变模型行为，以下游任务收益作为主要指标。
4. **Formation Tracing（形成溯源）**：比较训练检查点并分析训练数据影响，用于研究组件的形成阶段和来源。
5. **Unit Interpretation（单元解释）**：将神经元、特征或方向映射为可描述概念，例如使用 SAE 字典分解或模型辅助标注。
6. **Decision Auditing（决策审计）**：追踪具体决策依赖的内部证据，并结合领域知识判断该证据是否有效。

流水线根据主张选择满足证据要求的最短策略链：

| 策略 | 链条 | 主张形式 |
|---|---|---|
| 机制证据 | Location → Causal Intervention | "X 特异性地因果驱动行为 B。" |
| 能力/编辑 | Location → Tuning & Editing | "调 X 能提升任务 T。" |
| 完整叙事 | Location → Causal Intervention → Formation Tracing | "X 驱动 B，且在阶段 S 由数据 D 形成。" |
| 解释模型 | Location → Unit Interpretation | "单元 X 编码概念 C。" |
| 决策可靠性 | Location → Unit Interpretation → Decision Auditing | "决策 D 依赖 C——有效 / 虚假 / 新发现。" |

> [!NOTE]
> **因果干预的证据要求。**因果结论需同时报告 sign（行为按预测方向变化）、dose-response（一定范围内干预强度与效应对应）和 specificity（对照组件无同类效应，且无关行为不受影响）。缺少任一项时，不将结果表述为已成立的因果机制。

> [!SMALL]
> 机制主张只预设组件类型，不预设具体层、注意力头、神经元或特征。`task.md` 中明确指定的方向优先于自动选择。

### 11 个方法家族

具体方法按所使用的信号分为 11 个家族。`refine-logs/MECHANISM_ROUTING.md` 使用下表中的家族名称。

> [!NOTE]
> 代码生成前，流水线提出候选家族和成本估计。自动模式采用推荐项；`auto-proceed: false` 时等待用户选择。`task.md` 中明确指定的方法优先。

如需指定方法，可在 `task.md` 中添加自由文本 pin：

```bash
# 以下自由文本可写在 task.md 的任意位置
mechanism direction: Location
family: Causal Attribution
```

> [!SMALL]
> 系统可识别 “activation patching” 和 “SAE” 等常见方法名。无法识别的方法名会导致运行暂停。重新使用已有结论的方法家族时，还需设置 `retry-settled: true`。

| 家族 | 回答什么问题 | 信号 | 大致成本 | 何时适用 |
|---|---|---|---|---|
| Magnitude Analysis | 哪些组件具有较大的权重或激活？ | 权重范数、激活统计量 | 低；无需反向传播或训练 | 用于初步筛选；数值大小不等同于下游因果影响。 |
| Vocabulary Projection | 隐藏状态对应哪些词表语义？ | 输出词表矩阵投影后的 token 分数 | 低；无需训练或标签 | 快速解释 residual stream、注意力头或神经元；不适合直接解释 FFN 或 attention 子层内部状态。 |
| Gradient Detection | 哪些内部对象对目标标量具有一阶敏感性？ | 梯度范数、梯度乘输入、积分梯度 | 中；需要若干次反向传播 | 在因果实验前缩小候选范围；结果属于局部近似。 |
| Probing | 属性能否从指定层的表示中解码？ | 探针分类器准确率 | 中；需要标签和探针训练 | 比较不同层的可解码信息；仍需因果实验验证机制假设。 |
| Causal Attribution | 组件是否对目标行为具有因果必要性或充分性？ | patching 或 ablation 后的行为变化 | 中至高 | 用于支持因果结论；通常先使用低成本方法筛选候选组件。 |
| Circuit Discovery | 哪个由注意力头+MLP 组成的最小子图共同产生该行为？ | 边的重要性（基于 patching 的剪枝或梯度边评分）、留出数据上的忠实度 | 中到高（搜索空间是边） | 当主张关心*组件之间如何通信*的端到端机制时；结果依赖任务分布和忠实度指标。 |
| Feature Dictionary Learning | 指定位置包含哪些稀疏特征？ | SAE、transcoder、crosscoder 或 ICA 特征 | 训练字典时高，复用字典时低 | 在神经元多义性影响分析时使用；默认优先查找预训练 SAE。 |
| Representation & Parameter Analysis | 表示或参数方向能否控制目标行为？ | steering 向量、task 向量等线性方向 | 中 | 检验方向的充分性；需监测强干预造成的分布偏移。 |
| SHAP | 每个输入特征对预测贡献多少？ | Shapley 值，其总和恰好等于预测减去基线 | 因模型而异：树模型可精确算，其他用采样或摊销近似 | 跨模型可比的输入级重要性（XGBoost 类模型的事实标准）；相关性方法，掩盖交互效应。 |
| Neural Feature Learning | 训练过程如何形成特征？ | Neural Feature Matrix 与梯度外积的对齐程度 | 中至高；需要逐样本 Jacobian | 研究特征学习过程及其与核方法或无限宽度理论的关系。 |
| Multi-Modal Interpretability | 哪些语义概念与视觉模型单元相关？ | 激活图像与文本嵌入的相似度 | 中 | 为视觉或多模态单元生成概念标签。 |

> [!SMALL]
> 方法家族可组合使用。常见顺序是先筛选候选组件，再解码其表示，最后进行因果验证。必要时可继续执行 Circuit Discovery 或 Feature Dictionary Learning。

### 数据完整性约束

所有实验（包括 M0 现象验证）均应用以下数据规则，无需额外配置：

1. **数据来源优先级**：依次选择现有数据集、经过重新标注或变换的现有数据集，以及自建数据集。
2. **无泄漏的数据划分**：显式划分 train、validation 和 test，先去重，再按组或实体切分。探针、方向或分类器不得使用训练数据进行最终评估。
3. **标签与目标一致**：标签必须直接反映目标行为。来自其他模型的输出只能作为明确标记的代理标签。
4. **样本量下限**：`task.md` 指定样本量时按指定值执行，否则采用下表下限。样本量按过滤后的有效样本和独立来源条目计算。

| 实验类型 | 下限 | 例子 |
|---|---|---|
| 推理时的探索/干预 | > 50 条样本 | 组件定位；ablate / patch / steer |
| 调优/编辑（凡是涉及训练的） | 百级规模（≥ 约 100） | 微调、权重编辑、需要学习的 steering |

> [!SMALL]
> 否定结论若来自不足计划规模一半的运行，将标记为 `suspected_under_power`，不作为确定结论。见 [验证与判定](#verification)。

### 实验规范检查

生成实验代码前，流水线根据已知问题清单检查实验计划。以下两类检查较为常见：

> [!WARNING]
> **steering 系数扫描。**系数过小可能无法产生可测效应，过大则可能导致表示偏离分布。流水线同时记录目标指标和能力指标，并选择能力损失处于允许范围内的最小有效值。层、位置、方向或模型变化后重新扫描。

> [!WARNING]
> **干预 block 扫描。**单个 block 的效应可能被下游层削弱，过多 block 则可能使表示偏离分布。流水线会扫描 block 的数量和位置。不同深度的模型不复用固定层号。

> [!SMALL]
> 系统根据计划中的参数和配置自动选择适用的检查项。具体记录见 `refine-logs/EXPERIMENT_TIPS.md`。


# 参考

## 术语表 {#glossary | 关键术语}
以下术语会出现在 `task.md`、命令参数、运行报告和主张台账中。为与产物字段保持一致，部分术语保留英文形式。

| 术语 | 含义 |
|---|---|
| **behavior** | 模型在指定条件下可观察、可证伪的表现，描述模型的行为而非成因。 |
| **mechanism** | 对 behavior 内部成因的描述，例如相关层、注意力头、神经元或激活方向。 |
| **claim** | 可由实验检验的科学主张，编号为 C1、C2 等。 |
| **M0 gate** | 机制分析前执行的行为验证。行为不存在时，运行提前结束并生成阴性结果报告。 |
| **gate** | 阶段之间的检查点。检查通过后进入下一阶段；不通过时暂停、修订或提前结束。 |
| **variant** | 在基线实验的基础上只替换方法、数据集或模型之一的验证实验。 |
| **robustness** | 通过审计的变体中，与基线结论一致的比例。取值范围为 0–1。 |
| **verify 判定** | 主张在验证阶段得到的状态。各状态的定义见 [五种结论](#五种结论)。 |
| **task.md** | 项目目录中的纯文本研究说明，是流水线的主要输入。 |
| **claims ledger** | 科学主张的汇总记录。可读版本为 `CLAIMS_LEDGER.md`。 |
| **research memory** | 跨轮次保存已有结论和已尝试方向的状态。详见 [多轮研究](#next-round)。 |
| **external reviewer** | 非 Claude 系的独立评审模型，默认为 `gpt-5.4`，通过 `LLM_API_KEY` 配置。见 [环境变量](#environment)。 |
| **Mechanic-DB** | Mechanist 使用的云端论文检索服务。 |

## 实验隔离 {#isolation | 实验隔离}

并行运行多个实验时，可通过提示约束和权限规则限制各实验的读取范围。

### 提示约束

```text
不要读取其他实验目录。不要从以往的运行中借用数据、实验设计、分组方式或其他信息。
```

orchestrator 会将该指令加入各子 agent 的提示。该方式依赖模型遵循指令，不提供强制隔离。

### 权限规则

在当前实验目录中创建 `.claude/settings.local.json`，拒绝读取指定目录：

```text
<project-dir>/
└── exp/
    └── .claude/
        └── settings.local.json     ← 只影响从 exp/ 启动的会话
```

```json
{
  "permissions": {
    "deny": [
      "Read(/absolute/path/to/exp1/**)",
      "Read(/absolute/path/to/exp2/**)",
      "Read(/absolute/path/to/other_old_exp/**)"
    ]
  }
}
```

- 路径必须是**绝对路径**，并以 `/**` 结尾以覆盖其下所有内容。
- 每个需要隔离的实验目录均需单独配置该文件。
- 该文件只影响从这个目录启动的 Claude Code 会话，不会波及其他项目。

> [!WARNING]
> 权限规则不等同于系统级沙箱。拒绝 `Read` 不会阻止通过 `Bash(cat …)`、`Grep` 或 `Glob` 访问文件。需要严格隔离时，应在不同机器或不同系统用户下运行各轮实验。

## 本地开发 {#development | 本地开发}

本节适用于需要修改技能提示词、智能体定义或 MCP 服务代码的贡献者。仅使用 Mechanist 运行实验时，无需执行本节步骤。

> [!NOTE]
> **本地开发必须先 clone Mechanist 仓库。**插件市场安装只适合直接使用 Mechanist，不提供用于修改和加载本地源码的工作目录。clone 完成后，使用 `--plugin-dir` 将 Claude Code 指向仓库路径。

开始前，先完成 [安装](#installation) 和 [环境变量配置](#environment)。随后 clone 仓库，并在仓库旁创建独立的实验目录：

```bash
git clone https://github.com/zjunlp/Mechanist.git

mkdir exp && cd exp

# 从本地仓库加载插件
claude --model claude-opus-4-8 --plugin-dir ../Mechanist
```

```text
<dir>/
├── Mechanist/   # 本地插件源码
└── exp/         # 实验工作目录
    └── task.md
```

> [!WARNING]
> `--plugin-dir` 相对于 shell 的当前目录解析。路径解析失败时，Claude Code 仍会启动，但不会加载插件。

从 IDE、桌面快捷方式、alias 或包装脚本启动时，建议使用绝对路径：

```bash
claude --model claude-opus-4-8 --plugin-dir /absolute/path/to/Mechanist
```

对 Mechanist 插件源码进行修改后，不同类型的修改具有不同的生效时间：

| 修改类型 | 生效方式 |
|---|---|
| `skills/`、`agents/`、斜杠命令、提示词文本 | 在会话中执行 `/reload-plugins`。 |
| MCP / 辅助服务的 Python 代码（`mcp-servers/`） | **重启 Claude Code。**`/reload-plugins` 不会重启已在运行的进程。 |
| 插件清单（`plugin.json`）或 MCP 配置 | **重启 Claude Code。** |
| 环境变量（`LLM_API_KEY` 等） | 修改启动 Claude Code 的 shell 环境后重启 Claude Code。运行中的服务不会重新读取变量。 |
