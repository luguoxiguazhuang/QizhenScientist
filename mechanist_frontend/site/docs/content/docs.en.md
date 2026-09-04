---
eyebrow: Claude Code Plugin
title: Mechanist Documentation
lead: Mechanist is an autonomous research agent for large-model mechanistic interpretability. It runs as a Claude Code plugin and supports the research workflow from literature review through experimental verification.
---

# Overview

## What Mechanist Does {#overview | Overview}
Mechanist is designed for **mechanistic interpretability** research on large language models. Give it a research direction and it turns the question into testable scientific claims, then conducts literature review, experiments, robustness verification, and review-driven iteration. The result is a complete, auditable experimental report.

Mechanist does not provide a remote compute environment. It is installed as a Claude Code plugin on your computer, runs experiments in the compute environment you provide, and saves all research outputs in the local project directory.

### Example Use Cases

Mechanist supports, but is not limited to, the following types of research:

- **Explore a mechanism**  
  Start from a known model behavior and locate the internal components that cause it.

- **Reproduce a paper**  
  Re-run a known result and method using the models, data, and scale specified by the paper.

- **Validate a suspected phenomenon**  
  Test a concrete behavioral hypothesis that has not yet been confirmed by a paper or prior experiment.

- **Open-ended discovery**  
  Provide only a research direction; Mechanist identifies a candidate phenomenon and investigates its mechanism.

See more examples on the [Research page](../#/research).

### Research Loop

For each research question, Mechanist runs four stages: claim definition, experiment, verification, and iteration.

```text
research question
      |
      v
   claim ------> experiment ------> verify ------> iterate ------> findings
      ^                                               |
      |____________ revise and re-run _______________|
```

Each stage must pass its checks before the next stage begins. If a check or review fails, the pipeline returns to the relevant stage, revises the work, and runs it again.

When the pipeline finishes, Mechanist summarizes each claim's experimental result, verification status, and final conclusion in `CLAIMS_LEDGER.md`.

# Installation and First Run

## Install Mechanist {#installation | Installation}

### 1. Install Claude Code and uv
Mechanist runs as a Claude Code plugin. Normal use does not require cloning the repository.

Install Claude Code, restart the terminal, and verify the installation:

```bash
# Install Claude Code; restart the terminal before checking the version
curl -fsSL https://claude.ai/install.sh | bash
claude --version
```

Mechanist's MCP services use uv to manage their Python environments. Install uv and check its version:

```bash
# Mechanist MCP services use uv to manage Python environments
curl -LsSf https://astral.sh/uv/install.sh | sh
uv --version
```

### 2. Install the Mechanist plugin {#plugin}
Start Claude Code and run:

```text
/plugin marketplace add zjunlp/Mechanist
/plugin install mechanist@mechanist
```

After installation, run `/reload-plugins`, then verify the plugin and MCP services:

```text
/reload-plugins
/mechanist        # should list /mechanist:auto, /mechanist:msearch, /mechanist:mhistory, ...
/mcp              # llm-chat and mechanic-db should be connected
```

If the commands still do not appear, restart Claude Code and check again.

The short command forms used in this manual, such as `/auto` and `/mguide`, correspond to the commands shown with the `mechanist:` plugin prefix.

> [!NOTE]
> A `connected` status in `/mcp` means only that the service started. It does not confirm that an API key or other configuration value is valid.

### 3. Configure the external reviewer {#environment}
Mechanist uses a model independent of Claude to review research ideas, experiment designs, and conclusions. Do not use a Claude-family model as the reviewer.

| Variable | Required | Default or example | Purpose |
|---|---|---|---|
| `LLM_API_KEY` | <span class="badge req">required</span> | `sk-...` | API key for the external reviewer. |
| `LLM_MODEL` | <span class="badge opt">optional</span> | `gpt-5.4` | Reviewer model name. |
| `LLM_BASE_URL` | <span class="badge opt">optional</span> | `https://api.openai.com/v1` | Root URL of an OpenAI-compatible service. |

Keep the default model and URL when using the official OpenAI API. For Azure, DeepSeek, Qwen, or a third-party proxy, set the corresponding OpenAI-compatible model name and base URL.

Add the variables to `~/.bashrc`, or to `~/.zshrc` when using zsh:

```bash
# --- Mechanist (add to ~/.bashrc or ~/.zshrc) ---
export LLM_API_KEY="sk-..."                       # required
export LLM_MODEL="<your_model_name>"              # optional, default: gpt-5.4
export LLM_BASE_URL="<your_base_url>"             # optional, default: official endpoint
```

Load the variables and confirm that the key is non-empty:

```bash
source ~/.bashrc
echo "$LLM_API_KEY"
```

> [!NOTE]
> Claude Code reads environment variables only at startup. Restart Claude Code after changing this configuration.

### 4. Configure a Mechanic-DB key (optional) {#mechainic-db-api}
Mechanic-DB is the academic-paper knowledge graph built for Mechanist. It supports literature review and candidate-idea generation, and helps refine research ideas into testable scientific claims. It works without registration at a quota of 2 requests per minute and 20 per day. Register only if you need the higher quota of 20 requests per minute and 1,000 per day.

Register with your email address:

```bash
curl -X POST http://mechanist.openkg.cn/register \
  -H 'Content-Type: application/json' \
  -d '{"email": "you@example.com"}'
```

Open the link in the verification email. The verification page displays a one-time `sk_...` key; save it before closing the page.

Add the key to your shell configuration:

```bash
export MECHANIC_DB_API_KEY="sk_..."
```

Then load the variable and verify that it is non-empty:

```bash
source ~/.bashrc
echo "$MECHANIC_DB_API_KEY"
```

### 5. Prepare an experiment environment (optional) {#experiment-environment}
Mechanist runs experiments in the Python environment from which Claude Code was started. The environment does not have to be named `scientist`, and conda is not required.

Skip this section if the current environment already contains PyTorch, NumPy, scikit-learn, and the other dependencies needed by your experiments. Otherwise, the following commands create an example environment:

```bash
# Example: a dedicated conda environment named scientist
conda create -n scientist python=3.11 -y
conda activate scientist
pip install -r <(curl -sSL https://raw.githubusercontent.com/zjunlp/Mechanist/main/requirements.txt)
```

Experiments use the GPUs visible to the current environment. See [Parameter Reference](#parameters) for device selection.

## First Run {#quickstart | First run}
A first run consists of creating a project directory, starting Claude Code, and submitting the research request through `mguide`.

### 1. Create a project directory
Mechanist writes research files into its startup directory. Create a separate directory for each research question.

Cross-round memory treats one project directory as one research question. Mixing unrelated questions contaminates that memory and may trigger protective checks.

```bash
mkdir -p ~/research/belief-asymmetry   # one research question = one folder
cd ~/research/belief-asymmetry
```

> [!NOTE]
> You may create a `literature/` directory inside the project and place local PDFs there. The literature-review stage scans this directory and prioritizes those papers.

### 2. Start Claude Code
Start Claude Code with Opus 4.8 from the project directory:

```bash
cd ~/research/belief-asymmetry
claude --model claude-opus-4-8
```

All commands beginning with `/` in the rest of this manual are run inside the Claude Code session.

### 3. Submit a research request
Call `mguide` in the Claude Code session and describe the task in natural language:

```text
/mguide Reproduce this paper: https://arxiv.org/abs/2506.09009
```

`mguide` analyzes the request and asks for information it cannot infer, such as models, datasets, weight locations, and the GPU budget.

After the requirements are confirmed, `mguide` writes `task.md` in the project root and shows it for review. Once you approve the task configuration, it starts the research pipeline. See [Pipeline Execution](#pipeline).

`mguide` can also handle literature searches and research-history questions. These requests do not start the research pipeline:

```text
/mguide Find papers on sparse autoencoder feature absorption in large language models
/mguide Explain how circuit-level interpretability developed over time
```

To write `task.md` and start the pipeline manually, see [Pipeline Execution](#pipeline). For the full literature-command syntax, see [/msearch](#msearch) and [/mhistory](#mhistory).

# Pipeline Design

This chapter uses the following terms: a **behavior** is the observable model behavior under study; a **mechanism** is its internal cause; a **claim** is a testable scientific statement; **M0** is the behavior validation performed before mechanism analysis; a **gate** is a checkpoint between stages; and a **variant** is a verification experiment that changes only one experimental condition. See the [Glossary](#glossary) for complete definitions.

## Task Description: task.md {#taskmd | Task description: task.md}
`task.md` describes the research task. When the run starts through `mguide`, the file is generated automatically in the project root.

### Content requirements
`task.md` is free-form Markdown and has no fixed schema. Headings such as `## Behavior` and `## Resources` organize the content but are not mandatory fields.

The file may be written in English or Chinese. Mechanist uses the language of `task.md` for its interface text and generated files.

| Content | When it applies | Description |
|---|---|---|
| **behavior** | You know, or want to validate, a model behavior | A concrete, falsifiable model-output pattern. A broad topic is not a substitute for a behavior. |
| **topic** | You have only a direction, not a specific behavior | The research direction from which candidate behaviors should be discovered. |
| **family** | You have already chosen a mechanism method | The requested method family, such as steering vectors or probing. |
| **model / data** | You are reproducing a paper or must pin resources | Model identifiers, datasets, and their paths. |
| **claim list / goal** | Optional | Scientific claims to test and the objective of this round. |

> [!NOTE]
> A behavior describes a measurable phenomenon; a mechanism describes its internal cause. See the [Glossary](#glossary).

Local models and datasets should be specified with explicit paths. Remote resources may be downloaded by the pipeline.

Configure credentials for private resources in the startup environment. Record only the resource identifier or local path in `task.md`. Multiple projects may share the same model cache.

In ordinary modes, `Resources` expresses preferences and the pipeline may adjust experiment scale to fit the budget. In strict reproduction mode, the listed model, data, and scale become non-negotiable constraints. See [Run Modes](#run-modes).

### Configure a GPU budget
Declare GPU time and concurrency limits in natural language:

```text
You have an 8-hour GPU budget. Do not pause or simplify the experiments because
of the GPU budget until it is exhausted.
Use at most 4 of the 8 available GPUs concurrently.
```

- The GPU budget limits resource consumption and determines experiment scale.
- Separate budgets may be given for the main experiment and verify stage.
- A GPU budget is a hard constraint. If the task cannot run within it, the pipeline stops and records the reason.

### Declare hard constraints
State any model, data, or experimental requirement that must not be adjusted:

```text
All experiments must use Llama-3-8B. Do not substitute Pythia 2.8B.
When verifying claim 3, use only Pythia 1B and 410M; do not run 2.8B yet.
```

In ordinary modes, merely listing a model or dataset expresses a preference. Explicit wording such as “must,” “only,” or “do not substitute” creates a hard constraint. In strict reproduction mode, all listed models, data, and experiment scales are hard constraints. If the task cannot finish within them, the pipeline stops and records the reason.

### Configure progress notifications
To request progress notifications, state a destination and cadence in `task.md`:

```text
Send progress updates to example@gmail.com once per hour.
```

Notifications use only email, webhook, or chat integrations that you have already configured and authorized. Mechanist does not install or authenticate these services.

If no delivery service is available, Mechanist saves the briefing under `notification/` without sending it. Delivery failures do not interrupt the pipeline. No notification is produced unless the task opts in.

## Run Modes: Two Orthogonal Axes {#run-modes | Run modes}
A run mode is defined by two independent parameters: `behavior-source` controls where the behavior comes from and whether it must be validated; `mechanism` controls whether the method is supplied by the user or selected by the system.

### Axis 1: `behavior-source` — where the behavior comes from

- **`given`** (default): `task.md` provides an established behavior. The pipeline skips research-idea generation, novelty checks, and behavior-existence validation.
- **`given-validation`**: `task.md` provides a behavior that still needs confirmation. Before mechanism research, the M0 gate checks whether the effect reproduces across paraphrases, random seeds, and decoding settings while ruling out confounds.
- **`discovery`**: `task.md` provides only a research direction. The pipeline performs literature review, candidate research-idea generation, feasibility screening, pilot experiments, novelty and impact assessment, and external review. The selected behavior then enters M0.

### Axis 2: `mechanism` — who selects the interpretability method

- **`discovery`** (default): the system selects a mechanism family, such as probing, activation patching, SAE analysis, or steering vectors. The choice and rationale are written to `refine-logs/MECHANISM_ROUTING.md`.
- **`given`**: the method is specified in `task.md`, so automatic method selection is skipped. If no method is specified and the task does not explicitly declare behavioral-only research, the claim stage stops and requests the missing input.

The two axes produce six valid run modes. Bare `/auto` is equivalent to `given` + `discovery`.

The `given` + `given` combination uses strict resources. Specified models, datasets, data volume, and required experiments are hard constraints. If an out-of-memory error occurs, the system tries to add GPUs and stops if the requirements still cannot be met.

Other combinations may adjust resource scale to fit the budget.

| behavior-source ↓ / mechanism → | `given` (task specifies method) | `discovery` (system selects method) |
|---|---|---|
| `given` — trusted, no M0 | **Reproduction combination**: strict resources | **= bare `/auto`**: trusted behavior, automatic mechanism exploration |
| `given-validation` — validate first (M0) | Validate the behavior, then use the specified method | Validate, then let the system explore the mechanism |
| `discovery` — autonomous discovery + idea generation (M0) | Discover a behavior, then use the specified method | Fully autonomous execution |

> [!SMALL]
> Four common combinations are described below. The other two are `given-validation` + `given` and `discovery` + `given`; their input requirements follow directly from the table.

### Combination 1 — Reproduce a known result: `given` + `given`

Use this combination to reproduce an existing result with specified behavior, method, and resources.

```text
/auto — behavior-source: given, mechanism: given
```

`task.md` must contain a concrete behavior or scientific claim and specify the mechanism method. For behavioral-only research, explicitly state that mechanism analysis is not required. Models, data, and scale are treated as constraints that cannot be reduced automatically.

This mode skips research-idea generation, novelty and impact checks, and M0. The claim stage only extracts, splits, or clarifies the original claims without changing their meaning.

Original claims are stored in the `Original` field of `idea-stage/IDEA_REPORT.md`. After the run, check `CLAIMS_LEDGER.md` for the models, data, and scale actually used.

### Combination 2 — Known behavior, unknown mechanism: `given` + `discovery`

Use this combination to investigate the internal mechanism of an established behavior. It is the default `/auto` mode.

```text
/auto — behavior-source: given, mechanism: discovery
```

`task.md` must contain a concrete, falsifiable behavior. If it contains only a research topic, the run pauses and asks for a behavior or a switch to discovery mode. Automatic confirmation never bypasses required-input checks.

This mode skips research-idea generation, novelty and impact checks, and M0, then proceeds directly to mechanism research.

### Combination 3 — Suspected behavior, validate first: `given-validation` + `discovery`

Use this combination for a concrete behavior not yet supported by a paper or prior experiment. The M0 gate validates the behavior before mechanism research begins.

```text
/auto — behavior-source: given-validation, mechanism: discovery
```

`task.md` must contain the behavior to validate. It may also include a partial verification outline; method refinement fills in missing steps.

This mode skips research-idea generation and novelty checks. M0 tests different phrasings, random seeds, and decoding settings and checks for confounds.

If M0 passes, mechanism research continues. If the result is `not-established`, the run writes a negative-result report and ends.

### Combination 4 — Only a direction: `discovery` + `discovery`

Use this combination to discover a candidate behavior from a research direction and then investigate its mechanism.

```text
/auto "LLM belief representations (per the KaBLE benchmark)" — behavior-source: discovery
# Alternatively, describe the direction in task.md:
/auto — behavior-source: discovery
```

The direction may be supplied directly in the command, so `task.md` is optional. It must define a recognizable problem scope; an overly broad input triggers a clarification request.

Before the main experiment, the pipeline completes literature review, candidate generation, feasibility screening, pilot experiments, and external review. The selected behavior enters mechanism research only after passing M0.

### Four M0 Verdicts

In combinations 3 and 4, the M0 existence check produces one of four verdicts:

| Verdict | Meaning | What happens next |
|---|---|---|
| `established` | The behavior is real and robust | Mechanism research continues |
| `conditional` | The behavior exists only under some conditions | Mechanism analysis continues only within those conditions |
| `not-established` | The behavior does not exist | A negative-result report is generated and the run ends |
| `inconclusive` | The M0 test is flawed or underpowered | Repair and rerun M0 before mechanism research |

> [!SMALL]
> Combinations 1 and 2 use `behavior-source: given` and do not run M0. The behavior is accepted without producing a behavior-validation verdict.

### Run Mode Guide

| Task condition | Command | Expected result |
|---|---|---|
| Reproduce a paper; behavior and method are known | `/auto — behavior-source: given, mechanism: given` | Conclusions use the specified models, data, and scale |
| Behavior is established; mechanism is unknown | `/auto — behavior-source: given, mechanism: discovery` | Select and test a mechanism hypothesis |
| A specific behavior is proposed but unconfirmed | `/auto — behavior-source: given-validation` | Continue to mechanism research if established; otherwise produce a negative-result report |
| Only a research area is known | `/auto "direction" — behavior-source: discovery` | Screen candidate behaviors and investigate the selected one |
| Discover a new phenomenon but use a specified method | `/auto "direction" — behavior-source: discovery, mechanism: given` | Validate the behavior and conduct mechanism research with the specified method |

## Pipeline Execution {#pipeline | Pipeline execution}
You can skip `mguide`, write `task.md` yourself, and call `/auto` to start the pipeline.

### Start the pipeline manually
After preparing `task.md` in the project root, call:

```text
/auto
```

To select a run mode, pass the two axis parameters in the same command:

```text
/auto — behavior-source: given, mechanism: discovery
```

You may also provide the research direction directly in the command. In that case, `task.md` supplies the detailed background:

```text
/auto "why is first-person belief accuracy lower than third-person in LLMs"
```

See [Run Modes](#run-modes) for the two axes and [Parameter Reference](#parameters) for other options.

One `/auto`, four stages — **claim → experiment → verify → iterate** — each documented below: what it does, files it leaves (full list in [Artifacts](#artifacts)), whether it pauses.

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

> [!SMALL]
> Throughout the run, `CLAIMS_LEDGER.md` at your project root is kept up to date after every stage — open it at any moment to see where each claim currently stands.

### Stage 1 — claim: decide what to test

**What it does for you:** it turns your research direction (or `task.md`) into a set of concrete, testable claims — C1, C2, … — plus a refined method proposal and a per-claim experiment plan, before any serious GPU time is spent.

- **What you will observe:** literature review followed by claim writing and review-driven refinement. See [Run Modes](#run-modes) for how discovery and given inputs differ. The `idea-stage/` and `refine-logs/` directories are created.
- **Files left behind:** `idea-stage/IDEA_REPORT.md` (the ranked ideas / captured claims), `refine-logs/FINAL_PROPOSAL.md` (the method), `refine-logs/EXPERIMENT_PLAN.md` (the plan) — details in [Artifacts](#artifacts).
- **Does it pause?** By default, no — the top-ranked idea is accepted with a log line and the run continues. With `auto-proceed: false`, the run stops here and asks you: approve / switch to idea #N / re-run / stop.

```text
/auto "attention sinks in small transformers" — auto-proceed: false
```

> [!SMALL]
> Expected result: after the claim stage finishes, the run pauses with a question in your console — approve / switch &lt;N&gt; / re-run / stop — and `idea-stage/IDEA_REPORT.md` is on disk so you can read the candidate research ideas before answering. It waits for you indefinitely.

### Stage 2 — experiment: run the planned experiments

**What it does for you:** it picks an interpretability method, implements the code, runs every milestone in the plan, and gives each claim a first (baseline) verdict — supported or not-supported.

- **What you will observe:** `given-validation`/`discovery` runs the M0 existence check first (see [Run Modes](#run-modes)). Then: method selection → code writing → external code review (default `gpt-5.4`) → sanity run → full GPU jobs. Watch progress in `refine-logs/EXPERIMENT_TRACKER.md` (`pending → running → done`).
- **Files left behind:** `refine-logs/MECHANISM_ROUTING.md` (which method was chosen and why), `refine-logs/EXPERIMENT_RESULTS.md` (per-claim results and verdicts), the updated `EXPERIMENT_TRACKER.md`, and one `runs/<run-id>/cost.json` per GPU run — see [Artifacts](#artifacts).
- **Does it pause?** By default, no. It asks for permission before launching the GPU jobs only when you set BOTH `auto-proceed: false` and `auto-deploy: false`; every other combination deploys and just logs a line.

```bash
cat refine-logs/EXPERIMENT_TRACKER.md
```

> [!SMALL]
> Expected result: a status table with one row per experiment run. While the stage is active you will see `running` entries turn into `done` (or `failed`) as jobs finish; a row stuck at `running` far past its estimated time is your cue to investigate.

### Stage 3 — verify: stress-test every result

**What it does for you:** it checks whether each conclusion still holds when exactly one ingredient is swapped — a different method, a different dataset, a different model — and gives every claim a **robustness score**: the fraction of clean swap runs that agree with the original result. A robustly confirmed *negative* counts as a PASS too.

- **What you will observe:** every claim's original result is integrity-audited first, then swap runs launch for the claims that pass the audit (default 1 claim × 1 swap on the `model` axis = 1 run). Each claim ends `PASS` / `FAIL` / `INCONCLUSIVE` / `ZERO_ELIGIBLE_VARIANTS` / `INTEGRITY_ONLY` — see [Verification](#verification).
- **Files left behind:** `verify/VERIFY_REPORT.md` (per-claim verdicts and the cross-claim summary), `verify/INTEGRITY_AUDIT.md` (what the audits found), and one `ROBUSTNESS.md` per claim — see [Artifacts](#artifacts).
- **Does it pause?** Same rule as the experiment stage: it only asks before deploying the swap runs when both `auto-proceed: false` and `auto-deploy: false`.

### Stage 4 — iterate: external review with a fix budget

**What it does for you:** an external reviewer — deliberately a non-Claude model, default `gpt-5.4` — grades the whole project like a top-conference reviewer, and the run then spends a bounded budget fixing what the reviewer flags: re-running broken checks, re-running experiments, or (rarely) rewriting a claim.

- **What you will observe:** rounds of reviewer score (1–10) + verdict + minimum fix per unresolved claim, then the fixes execute. Stops at `target-score` with no claim failing, or when `max-iterations` (default 6) is used up — budget exhaustion is a *normal* ending, leftovers go under Open Items.
- **Files left behind:** `review-stage/AUTO_REVIEW.md` (the round-by-round review log) and `review-stage/AUTO_ITERATION_FINAL_REPORT.md` (the story of what changed per claim) — see [Artifacts](#artifacts).
- **Does it pause?** By default, no. And you can skip this stage entirely with `review-loop: false`.

```text
/auto — review-loop: false
```

> [!SMALL]
> Expected result: the run ends right after the verify stage — no `review-stage/` folder is created, and `CLAIMS_LEDGER.md` shows the pipeline status `truncated-at-verify`.

**When the last stage ends**, the run stamps each claim's final status into `CLAIMS_LEDGER.md` along with the journey summary and Open Items, and — unless disabled — renders publication-ready figures into `figures/`.

> [!WARNING]
> **A "fully automatic" run can still stop to protect you.** Even with the default `auto-proceed: true`, the run will pause and wait if: a previous round's results are still un-archived (run `/next-round` to archive them first), or you used `behavior-source: given` / `given-validation` but `task.md` only names a topic instead of a concrete behavior (it asks you to spell the behavior out rather than inventing one). Conversely, if you use `auto-proceed: false`, remember every question waits for you **indefinitely** — never combine it with an unattended overnight run.

### Why did my run stop early?

The run never fabricates data or lowers its standards to push past a problem — it prefers to stop and tell you. Every ending stamps its status into `CLAIMS_LEDGER.md`, so look there first. The status you see maps to one of these:

| Symptom (status you see) | Meaning | What you should do |
|---|---|---|
| `ended-phenomenon-not-established` | The early "does this behavior exist?" check found it does not. Verify and iterate were skipped. This is a **valid negative finding**, not a failure. | Read the negative-result report in `refine-logs/EXPERIMENT_RESULTS.md`; pick a new behavior via `/next-round`. (The sibling status `ended-phenomenon-inconclusive` means the check itself could not decide — fix the check described in the report and re-run.) |
| `ended-needs-decision (<stage>: <reason>)` | The run hit a question only you can answer — e.g. no viable idea survived filtering, no usable result landed on disk, the scorer turned out invalid, or the plan and the chosen method conflict. These stops fire even in full-auto; nothing is fabricated to get past them. | Not a crash. Open `CLAIMS_LEDGER.md → Round-End Decision`: it states the root cause, which partial files to inspect, and 2–4 concrete options for your next run. |
| `halted-at-<stage>` | Something genuinely broke and could not be fixed automatically — e.g. a GPU job landed on the wrong device, an out-of-memory could not be resolved, or automatic debugging ran out of attempts. | Read the "Halted-stage diagnostics" line in `CLAIMS_LEDGER.md → Open Items` — it points at the exact file explaining what failed. Fix the cause, then re-run. |
| `truncated-at-verify` | You ran with `review-loop: false`, so the run ended after verify by design. | Read `verify/VERIFY_REPORT.md`; nothing to fix. |

> [!SMALL]
> If `/auto` refuses to *start* at all (no report is written), the cause is one of: no research direction given — write a `task.md` or pass one inline; a previous round's results are still un-archived — run `/next-round`; or a flag value it could not parse — see [Parameters](#parameters).

# Run Parameters

## Parameter Reference {#parameters | Parameter reference}
Everything you can put after the dash on the `/auto` command line: the syntax rules, a complete flag table, and copy-paste examples — each with the result you should see, so you can confirm the flag actually took effect.

### Command Syntax

The general shape is a quoted research direction, then a separator, then comma-separated `key: value` pairs:

```text
/auto "<direction>" — key: value, key: value, ...
```

- **The direction is optional.** If a `task.md` file exists in the project root, you can run bare `/auto — key: value` (or just `/auto`) and `task.md` becomes the sole source of the research direction. If you pass both, the quoted text is the direction and `task.md` is treated as the authoritative detailed context. If neither exists, the run stops immediately — the pipeline never invents a topic for you.
- **The separator** is ` — ` (em dash with spaces); plain `--` is also accepted. Everything before the first separator is the direction; everything after is options.
- **Key names are normalized**: `auto-proceed`, `auto_proceed` and `AUTO_PROCEED` are the same key — write whichever you like. This manual uses the lowercase-with-hyphens form throughout.
- Whitespace around `:` and `,` is ignored; quoted values keep their content verbatim.

These three commands are exactly equivalent:

```text
/auto "direction" — auto-proceed: false, claim-model: opus, dimensions: method,dataset
/auto "direction" -- auto_proceed: false, claim_model: opus, dimensions: method,dataset
/auto "direction" — AUTO_PROCEED: false, CLAIM_MODEL: opus, DIMENSIONS: method,dataset
```

### Invalid Parameter Handling

| Value type | On a bad value | Example |
|---|---|---|
| Model flags | **Hard stop.** Only the family aliases `opus` / `sonnet` / `haiku` (case-insensitive) are legal. A specific version ID stops the run with `[arg-parse] ... not a family alias`. | `model: claude-opus-4-8` ✗ |
| Booleans | **Hard stop** unless the value is `true`/`false`/`1`/`0`/`yes`/`no`. | `auto-proceed: maybe` ✗ |
| Enums (`batch-dispatch`, `behavior-source`, `mechanism`) | **Warn and fall back** to the default; the run continues. | `mechanism: giv` → `discovery` |
| Unknown keys | Logged as `[arg-parse] unknown key: <name> — ignoring`; the run continues. The removed old `mode:` flag now counts as unknown (its meaning moved to [`behavior-source` × `mechanism`](#run-modes)). | `mode: reproduction` → ignored |

> [!SMALL]
> Legacy alias: `max-rounds` is still accepted for one release and silently normalized to `max-iterations`.

### Main Parameters

All flags below are <span class="badge opt">optional</span> — bare `/auto` with a `task.md` is a complete command. Defaults are tuned for a hands-off overnight run.

| Flag | Values | Default | What you get |
|---|---|---|---|
| `auto-proceed` | `true\|false` | `true` | Master human-in-the-loop switch. `true`: decision points silently take the recommended option — you come back to finished results. `false`: every decision point asks you and **waits indefinitely** (no timeout). Strictly binary — there is no "ask, then proceed after a timeout" mode. |
| `review-loop` | `true\|false` | `true` | `false` stops the run right after verify: no automatic reviewer scoring, no automatic fixes. You still get the finished `CLAIMS_LEDGER.md`, and the run report shows the status `truncated-at-verify`. |
| `resume` | `true\|false` | `false` | Resume from an interruption by skipping stages whose complete artifacts already exist. `false` reruns stages and replaces their artifacts within the current round, but never bypasses the guard for unarchived outputs from a previous round. |
| `model` | `opus\|sonnet\|haiku` | unset | Run every stage of the pipeline on a cheaper or stronger model family, unless a per-stage flag overrides it. Your interactive session's own model is untouched (change that with `/model`). |
| `claim-model` / `experiment-model` / `verify-model` / `iteration-model` | `opus\|sonnet\|haiku` | unset | Run just that one stage on a cheaper or stronger model (aliases `opus`\|`sonnet`\|`haiku` only); beats the global `model`. See [the model subsection below](#parameters). |
| `dimensions` | subset of `method,dataset,model` | `model` | Which swap axes verify runs — exactly one variant per listed axis, so this **is** the variant count per claim and your main cost lever. The default single axis = 1 variant, so robustness is 0 or 1 and any single disagreeing variant means FAIL; `method,dataset,model` = 3 variants = full stress test. |
| `target-claims` | `all\|passed\|failed\|<id>` | `all` | Which claims verify stress-tests. `passed`/`failed` filter by baseline verdict (a robust *negative* is also worth checking); a bare id like `C2` = single-claim mode, which bypasses the `max-verify-claims` cap. |
| `max-verify-claims` | int | `1` | Cap on how many claims proceed into the swap tests (top-K by importance). Every claim is still integrity-audited; those over the cap end as `INTEGRITY_ONLY` with no robustness verdict — run `/auto-verify <id> — resume: true` later to swap-test them. |
| `robustness-threshold` | 0–1 | `0.5` | A claim PASSes verify iff its robustness score ≥ this. Use `0.67` for publication-grade strictness, `0.33` for exploration. |
| `min-variants-for-verdict` | int | `1` | Minimum integrity-clean variants required before any PASS/FAIL appears in your ledger; below it the claim gets the distinct state `ZERO_ELIGIBLE_VARIANTS`. Raise to 2–3 for stricter projects. |
| `base-repo` | GitHub URL | unset | Repo cloned into your project before any experiment code is written — the run builds on existing code instead of starting from scratch. See below. |
| `research-domain` | free string | `auto` | Domain tag constraining which mechanism methods are considered (e.g. `mechanistic-interpretability`, `vision-encoders`). `auto` infers it from your proposal; an ambiguous inference silently falls back to `general` and never asks you, even in interactive mode. |
| `compact` | `true\|false` | `false` | Slimmer artifacts for you to read: adds compact summaries (`IDEA_CANDIDATES.md`, `EXPERIMENT_LOG.md`) and skips per-claim `ROBUSTNESS.md` entirely — the same verdicts live in `verify/VERIFY_REPORT.md`. |
| `code-review` | `true\|false` | `true` | An external reviewer model (default `gpt-5.4`) checks experiment and variant code before anything is deployed — 7 checks, two of them CRITICAL: ground truth must come from the dataset (not another model's outputs), and the scorer must match the answer format. If the reviewer service is not configured, the review is silently skipped and never blocks your run. |
| `sanity-first` | `true\|false` | `true` | Run the smallest, cheapest experiment first to catch setup bugs before the full suite burns GPU hours. A failing sanity run gets up to 3 automatic debug attempts, then the run stops and reports — it never continues on a broken setup. |
| `auto-deploy` | `true\|false` | `true` | Standing approval for launching the full experiment/variant suites. Only the combination `auto-proceed: false` + `auto-deploy: false` actually shows you a deploy prompt (approve / narrow scope / abort). |
| `max-parallel-runs` | int | `4` | Maximum number of experiments running at the same time during the experiment and verify stages. Lower it to share a busy machine, raise it to finish faster. |
| `batch-dispatch` | `auto\|queue\|direct` | `auto` | How batches of experiments are launched. `auto`: ≤5 ad-hoc runs launch directly; ≥10 runs, dependencies, or grid sweeps go through the batch queue (with OOM retry and GPU gating). `queue` forces the queue; `direct` forces direct launch (debug-only — you'll see a warning when it overrides the queue rule). |
| `ref-paper` | PDF path / arXiv URL / paper URL / `false` | `false` | Reference paper the run summarizes FIRST; all idea generation then builds on it. See below. |
| `behavior-source` | `given\|given-validation\|discovery` | `given` | Where the studied behavior comes from and whether it is first validated experimentally — one of the two run-mode axes; full semantics in [Run Modes](#run-modes). |
| `mechanism` | `given\|discovery` | `discovery` | Who picks the mechanism method: you (`given`, named in `task.md`) or the run itself. See [Run Modes](#run-modes). |
| `max-iterations` | int | `6` | Hard cap on automatic fix actions during the review-and-fix stage. New claims created along the way inherit the same budget — never a fresh allocation, so the run cannot loop forever. |
| `max-claim-reentries` | int | `2` | Sub-budget (within `max-iterations`) for going all the way back to rewriting claims, so the reviewer cannot endlessly demand claim rewrites instead of fixing experiments. |
| `target-score` | 1–10 | `6` | Early-stop bar for the review loop: it stops when the reviewer score ≥ this AND the verdict is ready/almost AND no claim is still FAIL / INCONCLUSIVE / ZERO_ELIGIBLE_VARIANTS — all three required. |
| `gpu-id` | `auto` / id / comma list | `auto` | Restricts every experiment / variant / fix run to the listed GPUs — for sharing a machine with colleagues. The run also double-checks itself afterwards; see below. |
| `oom-max-gpus` | int / `auto` | `4` | Strict-reproduction runs only: when a run hits out-of-memory, up to this many free GPUs are added automatically (with sharding/offload) before the run HALTS. Your experiment is never silently scaled down. Ignored outside the `given`+`given` combo. |
| `underpower` | `tag\|stop\|off` | `tag` | Non-strict runs: guard against a scaled-down run's weak/negative result being read as a real refutation. `tag` annotates the claim `[suspected under-power: ...]` in your ledger and continues; `stop` ends the round as `ended-needs-decision` even in full-auto; `off` disables the check. |
| `ledger-figures` | `auto\|true\|false` | `auto` | Whether the final `CLAIMS_LEDGER.md` gets per-claim publication plots and tables embedded (via `/paper-figure`). `auto`: only claims with plottable data; `true`: force every non-deferred claim (also when the run halts early); `false`: none. Figure failures never stop the run. |

> [!SMALL]
> Cost intuition: the defaults give `max-verify-claims` 1 × `dimensions` 1 = 1 variant run per pass, plus up to 6 automatic fix actions; `— max-verify-claims: 3, dimensions: method,dataset,model` takes that to 9. GPU-hours are recorded per run in `runs/<run-id>/cost.json`.

### Specify a Reference Paper: `ref-paper`

Summarized **before** anything else; later ideation builds on that summary. Three input forms:

- **arXiv URL** — the PDF is downloaded for you (via the bundled `/arxiv` skill) and its first 5 pages (title, abstract, intro, method overview) are read.
- **Local PDF path** — read directly (first 5 pages).
- **Any other paper URL** — fetched and extracted from the web page.

```bash
# build on an arXiv paper
/auto "improve the steering method in this paper" — ref-paper: https://arxiv.org/abs/2405.00001

# local PDF
/auto — ref-paper: papers/reference.pdf
```

> [!SMALL]
> Expected result: `idea-stage/REF_PAPER_SUMMARY.md` appears in your project, containing the paper summary; for an arXiv link, the downloaded PDF also lands in `papers/`. Open the summary and check the paper was understood correctly — if it is off, everything downstream inherits the misreading.

### Extend an Existing Codebase: `base-repo`

Clones the repo into your project first, scans it for existing experiment scripts/model code/data loaders, and **reuses as much as possible** — only missing pieces get written. Ideal when official code is public:

```bash
# "improve this paper using its own codebase"
/auto — ref-paper: https://arxiv.org/abs/2406.04329, base-repo: https://github.com/org/paper-code
```

> [!SMALL]
> Expected result: before any experiment code is written, the repo appears as `base_repo/` in your project, and the generated experiment code imports from and extends it instead of re-implementing what already exists.

### Provide Local PDFs: `literature/`

The literature-search step scans two local PDF folders in your project root. They look similar but have opposite ownership:

| Folder | Owner | Behavior |
|---|---|---|
| `literature/` | You (user-curated) | **Read-only to the pipeline** — never auto-written or deleted. Drop your reading list, must-cite references and annotated copies here; they are always considered. |
| `papers/` | The pipeline (machine-managed) | Auto-download target for arXiv PDFs (only when arXiv download is enabled, or when `ref-paper` is an arXiv URL). Regenerable scratch — safe to delete and re-fetch. |

```bash
mkdir -p literature
cp ~/Downloads/steering-vectors-survey.pdf literature/
# then run /auto as usual
```

> [!SMALL]
> Expected result: your PDFs are read during the literature search of every round and are never modified, moved or deleted. When the same paper (matched by normalized title) also sits in `papers/`, your `literature/` copy wins. At most 20 local PDFs are scanned per search (first 3 pages each), prioritized by filename relevance — so name your files descriptively.

### Per-stage model overrides

Each stage resolves its model independently, by priority:

1. Per-stage flag: `<stage>-model: <alias>`
2. Global flag: `model: <alias>`
3. Neither set → that stage's built-in default model applies.

```bash
# everything on sonnet (cheap), except verify upgraded to opus
/auto — model: sonnet, verify-model: opus
```

> [!SMALL]
> Expected result: at the start of the run the console prints one line like `[models] claim=... experiment=... verify=... iteration=...`, showing which model each stage resolved to and where each choice came from — check it to confirm your overrides took. Your interactive session's own model is never affected by these flags (change it with `/model`).

### `dimensions`: Configure Stress-Test Dimensions

One swap per listed axis — **method** (same mechanism family), **dataset**, or **model**:

```bash
# fast + cheap (default): 1 variant per claim
/auto — dimensions: model

# full rigor: 3 variants per claim
/auto — dimensions: method,dataset,model
```

> [!SMALL]
> Expected result: with the default `dimensions: model`, each verified claim shows exactly one variant run, so its robustness in `CLAIMS_LEDGER.md` is either 0 or 1.

### `review-loop`: Configure Automatic Review

```bash
# stop after verify; inspect results yourself instead of letting the reviewer iterate
/auto — review-loop: false
```

Expected result: run ends right after verify, status `truncated-at-verify` — no reviewer scoring, no auto-fixes; `CLAIMS_LEDGER.md` still finalized. Side effect: "all baselines/variants integrity-broken" situations, normally auto-repaired, instead end the round as `ended-needs-decision`.

### `auto-proceed`: Configure Interaction

```bash
# interactive: every decision point asks you and waits (do NOT use for overnight runs)
/auto — auto-proceed: false

# interactive + pause right before GPUs are burned
/auto — auto-proceed: false, auto-deploy: false
```

`false`: asks at every decision point (claim selection, mechanism-family choice, deployment, fix checkpoints, settled-pin conflict, behavior re-validation, under-power question) and blocks **indefinitely** — no timeout. `true` (default): all silently take the recommended option.

> [!WARNING]
> `auto-proceed: true` never bypasses required inputs or state checks. If outputs from a previous round have not been archived, run `/next-round` first. If a `given` or `given-validation` task lacks a concrete behavior, complete the task definition before continuing.

### `gpu-id`: Select GPUs

```bash
# restrict every run (experiments, verify variants, fixes) to GPUs 4-7
/auto — gpu-id: 4,5,6,7, max-parallel-runs: 2
```

Expected result: experiments see only the listed GPUs; actual devices used are recorded in `runs/<run-id>/cost.json` (field `gpu_ids`). Self-audited after each stage — a run landing on an **unrequested** device halts loudly (`halted-at-<stage>`), never just a warning. Empty `gpu_ids` (CPU-only steps) is fine. Default `auto` = no pinning, check skipped.

### Resource Estimates

| Operation | Typical default resource or duration |
|---|---|
| Literature search and research-idea generation | No GPU required. A Mechanic-DB search usually takes 3–20 minutes. |
| Discovery pilot experiments | A single experiment usually takes 30 minutes to 4 hours; the default total budget is 10 GPU-hours. |
| verify | By default, one claim is tested on the `model` dimension, producing one variant GPU run. |

Actual GPU time is recorded in `runs/<run-id>/cost.json`.

# Understanding Results

## Artifact Files {#artifacts | Artifact files by stage}
Everything a run learns is written into ordinary files inside your project folder — you never need to scroll back through the console. This section lists every file by the stage that produces it: what you will find inside, and when it is worth opening.

> [!NOTE]
> **Read these first, in this order:** ① `CLAIMS_LEDGER.md` — the one-file answer to "what did this run conclude, claim by claim", plus how the run went and the Open Items you may still need to act on; ② `verify/VERIFY_REPORT.md` — how robust each conclusion proved under stress-testing.

```bash
ls CLAIMS_LEDGER.md verify/VERIFY_REPORT.md
```

> [!SMALL]
> Expected result: after any finished run, both paths print without a "No such file" error (`verify/VERIFY_REPORT.md` exists once the verify stage has run; a run that ended before verify — e.g. a negative phenomenon finding — still leaves the first one).

### Input File

| File | What's inside | Open it when |
|---|---|---|
| `task.md` <span class="badge opt">optional</span> | The research task and run configuration. See [Task Description](#taskmd). | Before a first run or between rounds. |

### After the claim stage

| File | What you'll find inside | Open it when |
|---|---|---|
| `idea-stage/IDEA_REPORT.md` | Candidate research ideas and their assessments, or the behavior and claims extracted from `task.md`. | When selecting or reviewing the research question. |
| `idea-stage/REF_PAPER_SUMMARY.md` | A summary of the reference paper you supplied via `ref-paper` (only present when you set that flag). | To check your paper was understood correctly. |
| `refine-logs/FINAL_PROPOSAL.md` | The research proposal after review and refinement. | To understand the chosen approach before the experiments run. |
| `refine-logs/EXPERIMENT_PLAN.md` | One milestone per claim: dataset, split and data provenance, planned sample sizes, models, and success criteria. | Before approving experiments; and this is the file **you edit** if the run stops with a plan-conflict decision (the report will point you here). |
| `refine-logs/EXPERIMENT_TRACKER.md` | A run-by-run status table; statuses flip in place `pending → running → done` (or `failed`) as the run proceeds. | While experiments run — your live progress view, and the place to spot a hung job. |

### After the experiment stage

| File | What you'll find inside | Open it when |
|---|---|---|
| `refine-logs/MECHANISM_ROUTING.md` | Which interpretability method family was chosen for your question, the 2–3 candidates that were considered, and the reasoning. | To see which method your results rest on and why it was picked. |
| `refine-logs/EXPERIMENT_RESULTS.md` | Per-claim results: key statistics, a one-line headline, and the baseline verdict (supported / not-supported). If the early behavior check failed, the negative-result report lives here too. Ends with a `Ready for /auto-verify: YES/NO` line. | Right after the experiment stage — the first real numbers of the run. |
| `runs/<run-id>/cost.json` | Per-run GPU-hour cost and which GPUs the job actually used. | Cost audits, or confirming a job ran on the GPUs you asked for. |
| `experiment_queue/<timestamp>/` | Only for large batched runs: the queue manifest (`manifest.json`) plus `run_meta.txt` and `summary.md`. The live `queue_state.json` stays on the execution host under `~/.mechanist_queue/runs/<timestamp>/` and is polled over ssh (paths recorded in `run_meta.txt`). | To watch a long batch of experiments work through the queue. |

### After the verify stage

| File | What you'll find inside | Open it when |
|---|---|---|
| `verify/VERIFY_REPORT.md` | The per-claim robustness verdicts (`PASS / FAIL / INCONCLUSIVE / ZERO_ELIGIBLE_VARIANTS / INTEGRITY_ONLY`), which claims were audited but not swap-tested, and a cross-claim summary. | After verify — the answer to "which conclusions survived stress-testing". |
| `verify/INTEGRITY_AUDIT.md` | What the honesty audits found — on the original results and on each swap run. | Whenever a claim came back `INCONCLUSIVE` or `ZERO_ELIGIBLE_VARIANTS` — this file explains why. |
| `verify/<claim>/PLAN.md` | Which swap variants were chosen for this claim and why each is a fair test of it. | Judging whether the swaps actually stress the claim you care about. |
| `verify/<claim>/ROBUSTNESS.md` | One claim's full robustness story: which swaps ran, which agreed with the original result, and the resulting score. | Digging into one specific claim's verdict. |
| `verify/<claim>/variants/…` | Each swap run's config, the exact code diff from the original experiment, and its result and verdict files. | Inspecting a swap run that disagreed with the original result. |
| `verify/<claim>/main_experiment_audit/` | The full integrity findings on the **original experiment**: `EXPERIMENT_AUDIT.md` (evaluation methodology) and `MECHANISM_AUDIT.md` (intervention rigor), each with a `.json` twin carrying the verdict. | A claim came back `INCONCLUSIVE` — this is where the reason is. |
| `verify/<claim>/variant_audit/` | The same pair of audits, run on this claim's **swap variants** — this is what decides which variants count toward the robustness score. | A claim came back `ZERO_ELIGIBLE_VARIANTS`, or you want to know why a variant was excluded. |

### After the iterate stage

| File | What you'll find inside | Open it when |
|---|---|---|
| `review-stage/AUTO_REVIEW.md` | The round-by-round review log: each round's score, verdict, flagged problems, and the fixes taken. | To follow how the review loop unfolded. |
| `review-stage/REVIEW_STATE.json` | The loop's machine state after each round: iterations and claim re-entries consumed, the latest score and verdict, and the stop reason. | Checking how much fix budget was actually spent, or before resuming an interrupted loop. |
| `review-stage/REVIEWER_MEMORY.md` | The reviewer's append-only suspicion list — concerns carried across rounds so nothing gets quietly dropped. | To see what the reviewer kept doubting. |
| `review-stage/AUTO_ITERATION_FINAL_REPORT.md` | The narrative of what happened to each claim during review — what changed, what was falsified, what was narrowed — with unresolved claims listed at the end. | After iteration ends. |

### Whole-run files at the project root

| File | What you'll find inside | Open it when |
|---|---|---|
| `CLAIMS_LEDGER.md` | One summary row plus one detailed section per claim: statement, data actually used, method, baseline verdict, robustness, post-review outcome, final status, and pointers to every supporting file; then the run's pipeline status, a per-stage journey summary with GPU-hours, and Open Items (anything still needing your action). Updated after every stage and written on **every** ending, normal or not; a machine-readable twin lives in `claims_ledger.json`. This is the **single terminal report** of the run — everything a former pipeline report used to carry is folded into it. | **First, always** — during the run for live status, and after it for the conclusions. |
| `claims_ledger.json` | The machine-readable source of truth behind `CLAIMS_LEDGER.md` — always English, stable schema. | Scripts, or re-rendering the human view. |
| `research_memory.json` | Cross-round memory: which behaviors are settled, which mechanism directions were tried, and which remain untried. See [Multi-Round Research](#next-round). | Planning your next round. |
| `figures/` | Publication-ready figures and tables rendered from the results, one folder per claim (PNG + PDF for images, Markdown + LaTeX for tables), with `figures/INDEX.md` as the catalog. | Grabbing figures for a paper or slides. |
| `rounds/round_<N>/` | Archived copies of each finished round, created when you run `/next-round`. | Reviewing past rounds. |

The files chain together naturally: your `task.md` becomes a plan (`EXPERIMENT_PLAN.md`), the plan becomes results (`EXPERIMENT_RESULTS.md`), results get stress-tested (`verify/VERIFY_REPORT.md`) and reviewed (`review-stage/`), everything accumulates in `CLAIMS_LEDGER.md`, and the conclusions carry over to your next round through `research_memory.json`.

## Verification and Verdicts {#verification | Verification and verdicts}
After the experiments of a run finish, Mechanist stress-tests every claim before anything reaches a paper: each claim is re-tested under deliberate changes, its evidence is integrity-checked, and an independent reviewer model (default `gpt-5.4`) issues every verdict. You don't have to drive any of this — your job is to read the reports it leaves behind. This section shows you where they are and what each field means.

### Verification Reports

- **`verify/VERIFY_REPORT.md`** — the top-level result. One row per claim: the original (baseline) verdict, two integrity columns, how many trustworthy variants ran, the robustness score, the final state, and a next-step note — plus a section listing which claims were picked for swap testing and which the cap left out. A timestamped copy is kept beside it.
- **`verify/INTEGRITY_AUDIT.md`** — the roll-up of both audit rounds in one file: a per-claim section for the original experiments and one for the variants, each with its verdict and the offending finding in one line.
- **`verify/<claim_dir>/ROBUSTNESS.md`** — the per-claim deep dive: the robustness number, one outcome line per tested dimension, an interpretation paragraph, and (when there is no verdict) a diagnostic reason field.
- **`verify/<claim_dir>/variants/<tag>/`** — one folder per re-test, with `DIFF.md` (one paragraph: what changed vs the original), `result.json` (raw metrics) and `verdict.json` (agree/disagree with the baseline, plus integrity fields).
- **`verify/<claim_dir>/main_experiment_audit/`** and **`variant_audit/`** — the full integrity findings (`EXPERIMENT_AUDIT.md`, `MECHANISM_AUDIT.md`), with file-and-line evidence. Open these when a claim ends without a verdict.

### Swap Variants

Every claim (a single testable statement, labeled `C1`, `C2`, …) was first tested by one **baseline** experiment: a specific method + dataset + model combination that produced a verdict — "supported" or "not-supported". But one experiment could be a fluke. Verification re-runs the experiment as **variants**: each variant swaps exactly **one** ingredient — a different method, OR a different dataset, OR a different model — and freezes everything else (same hyperparameters, same seeds). If the changed version reaches the **same conclusion** the baseline did, your claim is robust on that axis.

Two things worth knowing: (1) **all** claims are verified by default, including rejected ones — a rejection that survives every swap is also a PASS ("robustly negative", a publishable result); (2) the claim statement is **frozen** during verification — its wording is never rewritten mid-flight. Method swaps stay within the same mechanism family (one probing technique for another; swapping probing for causal attribution would answer a different question).

### Select Swap Dimensions: `dimensions`

By default, all target claims receive an integrity audit, but only the highest-priority claim enters the swap test. That claim gets one variant on the `model` axis. Passing a claim ID processes that claim directly; use `dimensions` to change the swap axes:

```bash
# default: the model axis only, 1 variant per claim
/auto-verify C1

# only the method axis: 1 variant per claim
/auto-verify C1 — dimensions: method

# two axes: 2 variants per claim
/auto-verify C1 — dimensions: method,dataset
```

> [!SMALL]
> Expected result: the console first prints a target summary (which claims, which dimensions, how many claims get swap-tested, expected variant runs, estimated GPU-hours); when the run finishes, `verify/VERIFY_REPORT.md` appears (plus one `verify/C1_<slug>/` folder), and its table lists exactly the dimensions you passed — with `— dimensions: method`, C1 has a single variant row.

An axis you did not run is a **scope gap**, not a positive signal — the report always lists which dimensions were actually tested. By default only 1 claim is swap-tested per pass (`— max-verify-claims: 1`; every other claim is still integrity-audited and reported as *INTEGRITY_ONLY*, to be swap-tested later with `/auto-verify <id> — resume: true`), so a default pass means 1 claim × the `model` axis = 1 GPU experiment run; `— max-verify-claims: 3, dimensions: method,dataset,model` makes it 9.

### Robustness Calculation Example

Robustness is a per-claim number between 0 and 1: the fraction of **trustworthy** variants that reached the same conclusion as the baseline. You'll find it in `ROBUSTNESS.md` and in the report's summary table.

```text
robustness = #pass / N_eligible

# N_eligible = variants whose own integrity audit passed (or only warned)
# #pass      = eligible variants whose conclusion AGREES with the baseline
# claim PASSes iff robustness >= threshold (default 0.5)
```

Worked example. Claim C1's baseline said "supported". Verification ran all three axes (`— dimensions: method,dataset,model`) and all 3 variants passed their integrity audit, so `N_eligible = 3`:

- **Method swap**: the variant also supports the claim → agrees with baseline → counts as **pass**.
- **Dataset swap**: also supports → **pass**.
- **Model swap**: on the different model the effect vanishes; the variant says "not supported" → disagrees → **fail**.

So `#pass = 2`, `N_eligible = 3`, and `robustness = 2 / 3 ≈ 0.67`. Since `0.67 ≥ 0.5` (the default threshold), C1's final state is **PASS** — and the report notes that the **model** dimension is the fragile one. Counter-example: if only 1 of 3 had agreed, `robustness = 1 / 3 ≈ 0.33 < 0.5` → **FAIL**.

Now the integrity twist. Suppose the model-swap variant's eval script turned out to divide scores by the model's own maximum — its integrity audit FAILs. That variant is removed from **both the top and the bottom** of the fraction: if the remaining two both agree, `robustness = 2 / 2 = 1.0`, **not** 2/3. Why symmetric removal? A broken variant means "we don't know what it would have said", not "it disagreed" — counting it as a 0 in the numerator while keeping the denominator would unfairly bias the score toward FAIL. If **all** variants fail integrity, `N_eligible = 0` and no score exists at all (state ZERO_ELIGIBLE_VARIANTS, below). If exactly one survives, a verdict IS issued (`1/1 = 1.0` → PASS, or `0/1 = 0` → FAIL) — real, but thin evidence, and the report says how many variants it rests on.

| N_eligible | What it takes to PASS at threshold 0.5 |
|---|---|
| 1 | robustness is 0 or 1; only 1/1 passes (the default) |
| 2 | 1 of 2 suffices (0.5 ≥ 0.5) |
| 3 | need at least 2 of 3 (0.667 passes, 0.333 does not) |

> [!SMALL]
> The threshold is tunable: `— robustness-threshold: 0.67` forces unanimity at N=3 (since 2/3 ≈ 0.667 < 0.67); `0.33` lets a single agreeing variant of 3 suffice. Claims are always reported independently — there is no cross-claim averaging, ever.

### The five verdicts

Every verified claim ends in exactly one of five states in `VERIFY_REPORT.md`. Read this table before panicking about any of them — the run's own review loop handles the follow-up automatically:

| What the report says | What it means for your claim | What happens next |
|---|---|---|
| **PASS** | The original conclusion held up under enough swaps. Direction-agnostic: "supported and stayed supported" and "rejected and stayed rejected" both count. | Nothing for you to do — the run only re-checks that the claim wording matches the numbers, then moves on toward the paper. |
| **FAIL** | The variants ran cleanly but disagreed with the baseline — the conclusion is fragile (e.g. it flips when you change the model). This is a real scientific finding, not a bug; `ROBUSTNESS.md` names the fragile dimension. | The review loop first double-checks the disagreeing evidence's integrity fields; only if the divergence proves real does it narrow or rewrite the claim (rewrites are budget-capped). No knob needed from you. |
| **INCONCLUSIVE** | The **original experiment's own** methodology or mechanism tuning was flagged, so variants were never run — computing robustness around a broken anchor would be meaningless. The report's `inconclusive_reason` field names which check flagged it; details are in `main_experiment_audit/`. | The review loop repairs the main experiment's scripts and re-runs it (at most 2 attempts per claim). The claim's wording is never touched at this stage. If repairs run out, the claim lands in Open Items as "requires manual main-experiment repair". |
| **ZERO_ELIGIBLE_VARIANTS** | The baseline is fine. Variants **did run**, but every single one's own integrity check flagged it, so `N_eligible = 0` and no robustness can be computed. The report's `zero_eligible_reason` field gives the breakdown; details are in `variant_audit/`. | The review loop fixes only the variant scripts and re-verifies — the already-clean baseline is never re-run. If you want to intervene yourself, delete the bad folder under `verify/<claim_dir>/variants/` and run `/auto-verify <claim-id>` again. |
| **INTEGRITY_ONLY** | The claim passed its integrity audit but never entered the swap tests — it was not among the `max-verify-claims` top-K picked by importance, or you ran `/auto-verify — swap-variants: false` (audit-only mode). No robustness score, so neither PASS nor FAIL; the report's `stage2_skip_reason` field says which of the two skipped it. | The review loop takes no action on it — the claim is listed under Open Items instead. Swap-test it later with `/auto-verify <claim-id> — resume: true` (the audit already done is reused). |

**INCONCLUSIVE vs ZERO_ELIGIBLE_VARIANTS, at a glance.** Both mean "no verdict", but they point in opposite directions: INCONCLUSIVE = the problem is in the **original** experiment (read `main_experiment_audit/`; variants never ran). ZERO_ELIGIBLE_VARIANTS = the original is clean, the problem is in the **re-tests** (read `variant_audit/`). A claim never carries both reason fields at once.

> [!NOTE]
> **All five verdicts are valid outcomes.** The stated goal is "objective correctness, not maximizing PASS". A FAIL that reveals a model-dependent effect, or an INCONCLUSIVE that catches a broken eval script before it reaches a paper, is the system working — not failing.

### Integrity Audit Results (PASS / WARN / FAIL)

Two integrity audits guard every claim, and their verdicts appear as **PASS / WARN / FAIL fields** in `VERIFY_REPORT.md`, in each variant's `verdict.json` (`integrity_status`, `integrity_breakdown`), and in full in `EXPERIMENT_AUDIT.md` / `MECHANISM_AUDIT.md`. They judge the **process**, never whether your hypothesis is true. The first audit checks the evaluation itself:

- **Ground truth provenance** — FAIL if the "correct answers" were derived from the model's own outputs without being labeled a proxy (grading your own answer key).
- **Score normalization** — FAIL if any metric is divided by a denominator computed from the predictions themselves (guaranteed-inflated, suspiciously-near-1.0 scores).
- **Result file existence** — FAIL if the numbers the claim cites don't actually exist at the stated paths and keys (phantom results).
- **Dead code** — WARN if a metric function is defined but never called (it looks implemented but never actually ran).
- **Scope** — WARN if wording like "comprehensive / extensive / robust" exceeds the actual number of scenes or seeds tested.
- **Evaluation type** — an informational label (`real_gt | synthetic_proxy | self_supervised_proxy | simulation_only | human_eval`), not a pass/fail.

The second audit checks **mechanism tuning**: if your claim uses a steering-style intervention (adding `α × direction` to a model's internal activations), it verifies that the coefficient α was actually tuned **on this model** — swept over ≥ 3 orders of magnitude including α=0, with an independent capability metric (e.g. perplexity) logged at every point so output collapse can't masquerade as "the behavior appeared", α locked in the middle of a usable plateau, and the sampled text at that α actually reading coherently. A single hardcoded α copied from another paper is a FAIL; a thin sweep or missing random-direction control is a WARN. Claims with no mechanism intervention (pure dataset evaluation) get **N/A**, which counts as pass — non-mechanistic claims are never penalized.

**How the fields affect your results:** a FAIL on the **baseline** makes the claim INCONCLUSIVE before any GPU is spent on variants. A FAIL on a **variant** removes that variant from the robustness fraction (both numerator and denominator). A WARN lets the evidence count but attaches a visible tag to the verdict (e.g. `[INTEGRITY: WARN]`). Every verdict is issued by the independent reviewer model, not by the agent that ran the experiments.

### Review and Repair Loop

Each round: the independent reviewer reads the whole project, **scores it 1–10** (NeurIPS/ICML-reviewer level), names the minimum fix per unresolved claim; the run implements the fixes, re-runs what changed, reviewer looks again. Watch it in `review-stage/AUTO_REVIEW.md` (one entry per round, verbatim reviewer comments) and `review-stage/REVIEWER_MEMORY.md` (running list of concerns).

The loop is **bounded**: at most 6 fix actions in total, at most 2 claim rewrites, at most 2 main-experiment repair attempts per stubborn claim, and a stall guard that ends the loop after two consecutive rounds that changed nothing. It declares success only when three things hold at once: score ≥ `target-score` (default 6), the reviewer's verdict is "ready" or "almost", and no claim is still FAIL / INCONCLUSIVE / ZERO_ELIGIBLE_VARIANTS. Whatever remains unfinished when a budget runs out is handed to you in `review-stage/AUTO_ITERATION_FINAL_REPORT.md` under **Open Items** — that file is your end-of-run reading list.

Your knob: if you want the run to stop after verification and skip the review loop entirely, pass `review-loop: false` to `/auto`:

```text
/auto "in-context learning induction heads" — review-loop: false
```

> [!SMALL]
> Expected result: the run ends right after verification — `verify/VERIFY_REPORT.md` is the final report, the run summary is marked `truncated-at-verify`, and no `review-stage/` iteration reports are produced. You can read the results and run the review loop later if you change your mind.

> [!WARNING]
> **Verification requires the external reviewer.** If `LLM_MODEL` is unset, Mechanist uses the default `gpt-5.4`. If `LLM_API_KEY` is missing or invalid, review steps stop with an error. When a configured service is temporarily unavailable, affected verdicts are tagged `[pending external review]`. See [External Reviewer Configuration](#environment).

> [!SMALL]
> Where to look when something ends badly: start at `verify/VERIFY_REPORT.md` (summary table + next-step notes); INCONCLUSIVE → `verify/<claim_dir>/main_experiment_audit/`; ZERO_ELIGIBLE_VARIANTS → `verify/<claim_dir>/variant_audit/`; per-claim story → `ROBUSTNESS.md`; review-loop history → `review-stage/AUTO_REVIEW.md`; the human-readable wrap-up → `review-stage/AUTO_ITERATION_FINAL_REPORT.md`. See also [Artifacts](#artifacts).

# Advanced Workflows

## Multi-Round Research: /next-round {#next-round | Multi-round research}
One `/auto` run is one round. Between rounds you run `/next-round`: it archives the finished round into `rounds/round_<N>/` and drafts the next `task.md` for you to edit. Conclusions accumulate in `research_memory.json`, so later rounds never repeat work that is already settled.

### Three command forms

```text
/next-round new-behavior          # explore a brand-new phenomenon next round
/next-round new-mechanism B1      # keep behavior B1, try an untried mechanism direction
/next-round                       # no argument: reads memory, recommends, asks you to confirm
```

- `new-behavior` — next round investigates a fresh phenomenon; the current round's `data/` and `cache/` are archived along with everything else (a new phenomenon needs new data).
- `new-mechanism <behavior-id>` — keep studying the same behavior with a different mechanism direction; `data/` and `cache/` are **kept at root** so the same stimuli and activations are reused. Omitting the id defaults to the most recent behavior.
- No argument — it reads the memory and recommends for you: a *not-established* behavior → explore something new (refuted, don't keep mining it); an *inconclusive* one → re-validate the same behavior next round via `/auto — behavior-source: given-validation` (the test failed to decide — that is not a refutation); *established/conditional* with untried mechanism directions → `new-mechanism`; everything settled → `new-behavior`. If the last round stopped needing a decision, the draft prominently tells you to apply the recorded remedy and re-run the **same** investigation.

### Example and Output

```text
/next-round new-mechanism B1
```

> [!SMALL]
> **Expected result, in order:**

1. Prints the **move plan** — which files/folders go to archive vs. stay at root — before doing anything.
2. `rounds/round_<N>/` appears with the finished round's outputs (`CLAIMS_LEDGER.md`, `idea-stage/`, `verify/`, `runs/`, `figures/`, the report, ...).
3. A **drafted** `task.md` sits at project root (headed `<!-- DRAFT for round <N+1> ... -->`), with the chosen behavior, untried mechanism suggestions, and an "Already explored" list — awaiting your review.
4. Console prints `[next-round] archived round <N> → rounds/round_<N>/`, then "Next: edit task.md, then run /auto."

> [!SMALL]
> What never moves: `research_memory.json`, `rounds/`, your config (`.claude/`, `.mcp.json`), git files, `notification/`, and the live `task.md` (a copy of the old one is snapshotted into the archive). If the target `rounds/round_<N>/` already has contents, `/next-round` aborts immediately without moving or drafting anything — your files stay exactly as they were.

### Forcing a retry of settled work: `retry-settled`

Cross-round memory refuses to re-do "settled" work — a behavior already established or refuted, a mechanism family already confirmed or refuted — even when your `task.md` pins it, treating a bare pin on a settled item as an oversight. To insist, add one line to `task.md`:

```bash
# task.md
family: Steering Vectors
retry-settled: true
```

> [!SMALL]
> Expected behavior: with this line, the next `/auto` honors your pin and re-investigates the settled item. Without it: a full-auto run silently picks a fresh untried item instead (and logs that it did); an interactive run asks you to choose between honoring the pin and picking something fresh (fresh is the recommendation).

> [!WARNING]
> **If you forget `/next-round`:** the next `/auto` in the same directory notices un-archived outputs from the previous round (e.g. a `CLAIMS_LEDGER.md` still at the root) and **stops before doing anything** — even in full-auto — offering three choices: run `/next-round` to archive and draft the next task (recommended); continue the unfinished previous round instead of starting a new one; or delete the old outputs by hand. Nothing is ever overwritten without your say-so.

## Batch Idea Generation: /hypothesis-batch {#hypothesis-batch | Batch ideas}

`/hypothesis-batch` generates candidate research ideas around a topic and expands ten selected ideas into independently reviewable research plans. It does not run experiments and is intended for choosing what to study.

### Minimal example

```text
/hypothesis-batch "LLM beliefs"
```

> [!SMALL]
> **Expected result:** a literature survey first, then a ranked pool in `idea-stage/IDEA_REPORT.md`, then ten directories under `claims/`. Expect this to take a while — every surviving idea gets its own novelty check, impact check and external review, and the ten finalists are each worked up independently.

### Candidate Research-Idea Screening

The pool exists to be cut, so breadth early is the point — thirty near-duplicates of one framing is a failed run, not a productive one.

| Step | What happens |
|---|---|
| **Survey** | `/research-lit` maps the field: sub-directions, open problems, structural gaps. |
| **Brainstorm ~30** | Three rounds, each aimed at a different slice of the space — the gaps the landscape named, the mechanism directions not yet used, then whatever kind of phenomenon is still missing. Rounds diverge by construction rather than by luck. |
| **Novelty — a hard gate** | Every candidate gets its own deep novelty check. Anything already published is eliminated; survivors record their three nearest works. |
| **Impact — scored, no cut** | Every survivor is rated on the problem it studies, not the method. This is one of three ranking signals, not a filter. |
| **External review — scored, no cut** | Every survivor is reviewed. Novelty and impact judge whether the question is worth asking; only the reviewer can say whether the proposed design could answer it. |
| **Cut to 10** | First the veto: any idea with a **fatal design flaw** is dropped however important it is — a measurement that cannot answer its own question does not become shippable by mattering. Then rank the rest by **impact first, reviewer score second, novelty last**. |
| **Work each of the 10** | Independently and in parallel, each into its own directory. |

### Output Files

```text
idea-stage/
  RESEARCH_LIT.md          # raw retrieval dump, for auditing what was pulled
  LANDSCAPE.md             # the synthesized landscape
  IDEA_REPORT.md           # all ~30 ideas, ranked, with every elimination and its reason
claims/
  01_<name>/
    FINAL_PROPOSAL.md
    EXPERIMENT_PLAN.md
    claim.json             # structured, self-contained research plan
  02_<name>/
  …
  10_<name>/
```

Elimination reasons are recorded in `IDEA_REPORT.md`. Each selected idea's proposal, experiment plan, and structured data are stored in its candidate directory.

> [!NOTE]
> Ranking is triage, not a verdict. A high-ranking claim is worth your attention, not proof the study will work — the phenomenon it assumes is only tested for real by the M0 gate once a pipeline actually runs it. See [run modes](#run-modes) for how that gate behaves.

### Turn a research plan into a run

Pick the directory you want, copy its `FINAL_PROPOSAL.md` into a fresh working directory as the basis of a `task.md`, and start a run there — or just hand `/mguide` the claim and let it write the `task.md` for you. Either way it becomes an ordinary [research run](#quickstart) from that point on.

# Literature Commands

## One-Shot Literature Search: /msearch {#msearch | Literature search: /msearch}

Use it when you want "search everywhere for X" in one command: it queries your Zotero library, your Obsidian vault, local PDFs, web search, the arXiv API, and the Mechanic-DB cloud corpus, merges everything, and writes a readable report. Sources you have not configured are skipped silently — the command never fails just because one source is missing.

```text
/msearch "sparse autoencoder feature absorption in large language models"
# optional flags after an em dash:
/msearch "..." — arxiv download: true, max download: 10
/msearch "..." — extra: semantic-scholar, deepxiv
/msearch "..." — paper library: ~/my_papers/
```

> [!SMALL]
> Expected result: a new folder `msearch/<slug>/` appears (the slug is your query lower-cased with symbols turned into `_`, so re-running the same query reuses the folder), containing `LANDSCAPE.md` and `RESEARCH_LIT.md`; the terminal prints a summary with the paper count per source (or "skipped") and both file paths.

- `LANDSCAPE.md` — the report to actually read: a structured paper table, a narrative synthesis, a "Structural Gaps" analysis (open problems with reasons), and prior dead ends.
- `RESEARCH_LIT.md` — the raw retrieval dump (verbatim abstracts with per-source provenance). Open it only when you want to audit what was actually pulled before any interpretation.

Two local PDF folders behave differently: `literature/` is **your** read-only drop zone — every search scans it, but nothing ever writes or deletes there; `papers/` is where auto-downloads land, safe to wipe. When the same paper exists in both, the `literature/` copy wins.

> [!SMALL]
> /msearch output is a deliverable for you to read — an /auto run does not read it; the pipeline builds its own survey during the run.

## Field History: /mhistory {#mhistory | Field history: /mhistory}

Use it to get a 2500–4500-word, publication-style development history of a topic — classics and 2024–2026 frontier in one narrative. It runs a "history" pass and a "recent" pass over the cloud database plus web search to fill in seminal pre-2020 papers and the last few months of arXiv, so expect a wait of several minutes up to ~20.

```text
/mhistory "the evolution of circuit-level interpretability"
```

> [!SMALL]
> `development_history.md` is written to the project root and organized by period, with disputes and open questions at the end. If Mechanic-DB is unavailable, the report uses web sources and records the source status.

# Research Methods Reference

This section explains how Mechanist selects research directions and method families and checks experimental protocols. You do not need to learn it before a first run; selecting a run mode is sufficient. See [Parameter Reference](#parameters) for command configuration.

## Mechanism Methods and Data Constraints {#mechanisms | Mechanism methods and data}
Every [/auto](#run-modes) run makes three automatic choices, all written down for you to inspect: which phenomenon to study, which research direction to take, and which of 11 method families to run (candidates, cost estimates and rationale in `refine-logs/MECHANISM_ROUTING.md`). Already know what you want? Pin a method yourself with a one-line entry in `task.md`.

A **mechanism claim** requires causal evidence. Finding a component correlated with a behavior is not enough; the behavior must change as predicted under ablation, amplification, or another intervention. See the [Glossary](#glossary).

### Behavior Discovery

When you launch with `behavior-source: discovery` (an open-ended `task.md`: "find something surprising about this model", no phenomenon named), the run's first job is to mine one. What you get is exactly **one** committed candidate, stated in the claim reports before any experiment runs: a one-sentence falsifiable behavior, the data and metric to measure it, and a plausible internal locus. Its candidates come from six kinds of search:

1. **Transfer into a high-stakes domain** — take a known phenomenon into science/medicine, language evolution, multi-agent social science or creativity, ideally *tightening* it as you transfer (harder preconditions, higher-stakes consequences).
2. **Borrow from the human sciences** — test whether findings from psychology or neuroscience also hold in LLMs (brain-vs-LLM comparisons usually need EEG recordings).
3. **Cross-modal transfer** — take a text-model phenomenon to image, video or multimodal models.
4. **Reuse prior CS results** — re-test earlier computer-science findings on the current model.
5. **Probe a known phenomenon's conditions or origin** — *when* does it hold (the macro law, or the micro knob where it flips: scale, checkpoint, prompt format, language, difficulty) and *why* does it arise (a training cause vs an inference cause)?
6. **Meta-analysis** — distill a law (a scaling law, the Densing Law) and characterize when it holds.

A candidate is only committed when it meets five standards — the same five bars you should use when judging the phenomenon it hands you:

| Standard | What it means for a beginner |
|---|---|
| **real** | It reproduces on real data with a real metric — not an anecdote from one prompt. |
| **non-obvious** | A person familiar with the model would not have predicted it; there is something to explain. |
| **specific** | Operationalizable — statable in one falsifiable sentence with a measurable quantity. Note: "specific" does **not** mean "small"; a broad regularity is fine as long as it can be measured. |
| **robust** | It survives changes it shouldn't depend on: paraphrased prompts, different random seeds, different decoding settings. |
| **tractable** | Studiable with the models, data and GPU budget you actually have. |

> [!SMALL]
> What else you can expect from discovery: it prefers existing, authoritative, widely-cited datasets over building new ones, and treats safety-critical science domains as priority targets. Across rounds, a phenomenon already settled (established / conditional / not-established) is never re-proposed — `inconclusive` ones remain valid retries, and uncommitted candidates become a backlog for later rounds. If you deliberately want to redo a settled phenomenon, add the line `retry-settled: true` to `task.md`.

### Six Research Directions

Once a phenomenon exists, the run decides **what kind of question** to ask about it — one of six research directions. The chosen direction(s), and the rejected ones with one-line reasons, are recorded in the `mechanism_strategy:` block at the top of `refine-logs/EXPERIMENT_PLAN.md`, so you can always see why your run is doing intervention experiments rather than, say, training-history analysis. Each direction in one beginner sentence:

1. **Location** — *where* is the behavior computed? Use cheap correlational methods to rank candidate layers / heads / neurons / feature directions. A located component is a hypothesis, not yet a cause.
2. **Causal Intervention** — does that component actually *cause* the behavior? Ablate, patch or steer it and check the behavior moves as predicted. This is the step that promotes "located" to "mechanism".
3. **Tuning & Editing** — can we *use* the component to make the model better (steering vectors, task vectors / weight editing, targeted fine-tuning)? Judged by downstream gains, not by explanation.
4. **Formation Tracing** — *how did it form during training*? When does the component emerge across checkpoints, and which training data was critical? The most expensive direction — only when the claim is about genesis.
5. **Unit Interpretation** — *what does an internal unit mean*? Decode a human concept from a neuron / feature / direction, e.g. via SAE dictionaries or letting a frontier LLM label a smaller model's units.
6. **Decision Auditing** — is a *specific decision* trustworthy? Trace the evidence behind it and judge it against domain knowledge — catching "right answer, wrong reason" (spurious cues), or discovering novel decision bases humans hadn't recognized.

Directions are not used alone — they are chained into a **strategy**, and the run picks the *shortest* chain that answers the question (there is no default; the choice defines the claim). When you read your plan, this table tells you what kind of final claim each chain is aiming for:

| Strategy | Chain | Claim shape |
|---|---|---|
| Mechanistic evidence | Location → Causal Intervention | "X causally drives B, specifically." |
| Capability / editing | Location → Tuning & Editing | "Tuning X improves task T." |
| Complete account | Location → Causal Intervention → Formation Tracing | "X drives B and forms at stage S from data D." |
| Explaining a model | Location → Unit Interpretation | "Unit X encodes concept C." |
| Decision reliability | Location → Unit Interpretation → Decision Auditing | "Decision D relies on C — valid / spurious / novel." |

> [!NOTE]
> **The evidence bar for any intervention.** A causal-intervention result in your reports must always show three things: **sign** (the behavior moves in the predicted direction), **dose-response** (a stronger intervention moves it more, up to a point), and **specificity** (a matched control component does nothing, and off-target behavior stays intact). If one of the three is missing from a result claiming "X causes B", treat that claim as not yet earned.

> [!SMALL]
> **Altitude rule**: the mechanism claim hypothesizes the *kind* of component ("some mid-layer direction"), never the exact identity ("layer 17, feature 4242") — the exact identity is what the experiments are supposed to discover. Across rounds, confirmed or refuted directions are never re-proposed; `inconclusive` ones stay retryable; an explicit pin you write in `task.md` overrides this avoidance.

### 11 Method Families

Mechanist's concrete methods are organized into 11 families by **what signal they use**. This table is the menu the run chooses from — and your decoder ring for what each choice means when a family name shows up in `refine-logs/MECHANISM_ROUTING.md` or in a report.

> [!NOTE]
> **You do not choose a family by hand.** Before any experiment code is written, `/auto` proposes 2–3 candidate families with cost estimates and records the whole decision — candidates with the recommended one marked, a step-by-step composition plan with cost notes, and the rationale — in `refine-logs/MECHANISM_ROUTING.md`. In full-auto it commits the recommended candidate; with `auto-proceed: false` it stops and asks you to pick. Use the table below to **read** that file: check whether the chosen family really answers the question your claim asks. (If you named a method in `task.md`, that choice is committed directly and never overridden.)

**Pinning a method yourself.** If you already know which direction or family you want, add free-text pin lines anywhere in `task.md`:

```bash
# add to task.md (free-text lines, anywhere in the file)
mechanism direction: Location
family: Causal Attribution
```

> [!SMALL]
> **Expected result:** on the next `/auto` run, your pin is committed instead of an automatic pick — open `refine-logs/MECHANISM_ROUTING.md` and you should see `committed: true` with `chosen_family: Causal Attribution`, and the `mechanism_strategy:` block in `EXPERIMENT_PLAN.md` lists Location. Free-text names are understood ("activation patching" → Causal Attribution; "SAE" → Feature Dictionary Learning); a name that matches no family in this table stops the run with a message asking you to name a supported method in `task.md`. A pin on a family already settled in an earlier round additionally needs `retry-settled: true`.

| Family | Question it answers | Signal | Rough cost | When it fits |
|---|---|---|---|---|
| Magnitude Analysis | Which components look prominent? | Weight norms, activation statistics | Cheapest — no backward pass, no training | First-pass screen before anything expensive; pure heuristic (big values can cancel downstream). |
| Vocabulary Projection | What semantic content does a hidden state carry — without labels? | Tokens promoted when projecting through the output vocabulary matrix | Cheap — no training, no labels | Quick semantic read-out of residual stream / heads / neurons; degrades inside FFN/attention sub-layers. |
| Gradient Detection | Which objects are influential, to first order? | Gradient of a target scalar (grad norm, grad×input, integrated gradients) | Moderate — a few backward passes | Fast ranking to narrow a large candidate set before causal tests; local proxy, not causal necessity. |
| Probing | Is property y linearly decodable from layer l? | Accuracy of a small (usually linear) classifier trained on internal vectors | Moderate — needs labels + probe training | Standardized cross-layer comparisons; remember decodable ≠ causal — a causal follow-up is usually required. |
| Causal Attribution | Is this component causally necessary / sufficient? | Behavior change under patching / ablation (attribution patching = cheap approximation) | Expensive for exact variants (one forward pass per intervention); cheap for attribution patching | The gold standard — when the claim needs causality, usually after a cheaper screen. For long outputs (CoT, code), the metric is reduced to a single-position scalar first. |
| Circuit Discovery | Which minimal subgraph of heads + MLPs jointly produces the behavior? | Edge importance (patching-based pruning or gradient edge scores), faithfulness on held-out data | Moderate–expensive (search space is edges) | End-to-end mechanism claims where *how components communicate* matters; results depend on task distribution and faithfulness metric. |
| Feature Dictionary Learning | What are the model's monosemantic units at this site? | Sparse dictionary features (SAE / transcoder / crosscoder / ICA) | High up-front (dictionary training), cheap afterwards | When polysemantic neurons block other analyses. The run always looks for a pre-trained SAE first (Hugging Face / SAELens) — it never trains one from scratch unless you explicitly ask. |
| Representation & Parameter Analysis | Is this direction sufficient to control the behavior? | Linear directions in activations or weight space (steering vectors, task vectors) | Moderate | Directional sufficiency — steering and training-free editing; assumes linear encoding, big edits go off-distribution. |
| SHAP | How much does each input feature contribute to the prediction? | Shapley values that sum exactly to prediction minus baseline | Model-dependent: exact for tree ensembles, sampling / amortized for others | Input-level importance comparable across model families (de-facto standard for XGBoost-type models); correlational, hides interactions. |
| Neural Feature Learning | How did training shape the features — and can a kernel reproduce them? | Neural Feature Matrix / gradient outer-product alignment | Moderate–high (per-sample Jacobians) | Theory-flavored questions about the learning process itself (kernel / infinite-width connections). |
| Multi-Modal Interpretability | What named concepts drive units of this vision model? | CLIP-style similarity between a unit's activating images and text embeddings | Moderate (probing image set + one alignment pass, no fine-tuning) | Only for vision-specific concept labels — the other 10 families already handle multimodal models when the question is about layers / heads / features generally. |

> [!SMALL]
> Families are usually composed, not used alone: **screen** cheap (Magnitude / Vocab Projection / Gradient) → **decode** (Probing / Vocab Projection / Multi-Modal) → **verify** causally (Causal Attribution / Rep-and-Param) → **recover** the circuit (Circuit Discovery) if interaction matters → **re-base** into feature space (Feature Dictionary Learning) when polysemanticity blocks the middle steps. The composition plan for your run, with cost notes, is written in the `## Composition plan` section of `MECHANISM_ROUTING.md`.

### Data Integrity Constraints

You do not configure any of this — **every** experiment the run deploys, including the initial M0 phenomenon check, is bound by four data rules. Knowing them tells you why the numbers in `EXPERIMENT_RESULTS.md` can be trusted, and what to look for when auditing them:

1. **Dataset provenance order**: prefer an `existing` dataset → else `adapt` one (relabel / filter / transform an existing set) → `construct` from scratch only as a last resort. Which of the three was used is always recorded, and shows up in the "Data Actually Used" table of `EXPERIMENT_RESULTS.md` (see [artifacts](#artifacts)).
2. **Leak-free splits**: explicit train / validation / test; deduplicate, and split by group or entity so near-duplicates cannot straddle the boundary. A probe, direction or classifier is never evaluated on the data it was fit on — a score on training data is not evidence.
3. **Labels reflect the target behavior**, not a loose proxy — and ground truth comes from the dataset, **never from another model's output**. Code that violates this is flagged as a CRITICAL bug during the pre-deploy code review and fixed before anything runs (see [pipeline](#pipeline)).
4. **Sample-size floors**: one consistent dataset is used across M0 and all mechanism methods (no per-method special data). If you stated an amount in `task.md`, exactly that is used. Otherwise the floors below apply — and they are on the **effective** sample size: counted after filtering for usable signal, and capped by the number of unique source items (spinning many derived examples out of few sources does not count).

| Experiment type | Floor | Examples |
|---|---|---|
| Inference-time exploration / intervention | > 50 examples | Locating components; ablate / patch / steer |
| Tuning / editing (anything trained) | On the order of hundreds (≥ ~100) | Fine-tuning, weight edits, learned steering |

> [!SMALL]
> Related guarantee: how many examples a run actually consumed (`used_n`) is recorded against how many exist (`available_n`), so silent subsetting is auditable in the "Data Actually Used" table — and a negative verdict from a run at under half the planned scale is tagged `suspected_under_power`, never presented as a settled negative (see [verification](#verification)).

### Experiment Protocol Checks

Some experimental conventions have failure modes that are invisible until far downstream: nothing crashes, numbers look plausible, but the result is wrong or non-reproducible. Before writing any experiment code, the run checks your plan against a library of these known traps and records which conventions it adopted (or why none matched) in `refine-logs/EXPERIMENT_TIPS.md`. The two warnings you are most likely to see it act on:

> [!WARNING]
> **The steering coefficient is always swept.** Any additive intervention with a strength knob (α, β, scale…) has two symmetric silent failures: too small → no effect → the false conclusion "this feature doesn't drive the behavior"; too large → the representation goes off-distribution and fluency collapses — the target metric still moves, but for the wrong reason (telltale sign: a *random direction of the same magnitude* beats yours). So the run sweeps α from small in fixed steps, logs a target metric AND a capability metric (perplexity / a benchmark), picks the *smallest* sufficient value with capability drop under 5–10%, and re-tunes from scratch whenever the layer, position, direction or model changes. Mid layers usually steer best; late layers break into repetition.

> [!WARNING]
> **The target block is never hardcoded.** A single-block intervention on a deep trunk (e.g. 48 blocks) can be denoised away by downstream LayerNorm and attention before it reaches the output (under-intervention); intervening on too many blocks pushes the model fully off-distribution and destroys the localization story (over-intervention) — and both can *mimic* a successful result. So the run sweeps over block count and position (starting mid-to-late; widening to 3–5 layers if one is inert), and never copies a raw layer index between models of different depth. Order matters: the block count is locked **first**, then the coefficient is swept — the coefficient plateau shifts with the intervention site. When you audit a surprising negative, check in reverse: coefficient mismatch first, then block-count mismatch.

> [!SMALL]
> These warnings are matched by symptoms in your plan (e.g. any knob named α/β/scale, any hardcoded `target_block:`), so they apply even when the plan lists only a single default value. If your run went wrong in one of these ways, open `refine-logs/EXPERIMENT_TIPS.md` — it shows which conventions were (or were not) applied.

# Reference

## Glossary {#glossary | Glossary}
These terms appear in `task.md`, command parameters, run reports, and the claims ledger. Some remain in English to match artifact fields.

| Term | Meaning |
|---|---|
| **behavior** | An observable, falsifiable model response under specified conditions; it describes what the model does, not why. |
| **mechanism** | The internal cause of a behavior, such as a layer, attention head, neuron, or activation direction. |
| **claim** | A testable scientific statement, numbered C1, C2, and so on. |
| **M0 gate** | Behavior validation performed before mechanism analysis. If the behavior is not established, the run ends with a negative-result report. |
| **gate** | A checkpoint between stages. The run proceeds, pauses, revises, or ends according to the check result. |
| **variant** | A verification experiment that changes one of the method, dataset, or model relative to the baseline. |
| **robustness** | The fraction of audited variants whose conclusions agree with the baseline, from 0 to 1. |
| **verify verdict** | The claim status produced by verification. See [The five verdicts](#the-five-verdicts). |
| **task.md** | The plain-text research description in the project directory and the pipeline's main input. |
| **claims ledger** | The consolidated record of scientific claims. The human-readable version is `CLAIMS_LEDGER.md`. |
| **research memory** | Cross-round state recording established findings and attempted directions. See [Multi-Round Research](#next-round). |
| **external reviewer** | A non-Claude reviewer model, `gpt-5.4` by default, configured through `LLM_API_KEY`. |
| **Mechanic-DB** | Mechanist's cloud paper-search service. |

## Experiment Isolation {#isolation | Experiment isolation}

When you run variations of the same study side by side — `exp1`, `exp2`, `exp3` — the agent can read a previous round's artifacts and carry its design, its group assignments, or its numbers into the current one. Two mechanisms bound what it may read. Use either, or both.

### Prompt Constraint

```text
Do not read other experiment directories. Do not borrow data, experiment
designs, group assignments, or other information from previous runs.
```

The orchestrator injects this into every sub-agent's dispatch prompt, so it reaches each stage. It is a **prompt-level** constraint: it works by instruction-following, not enforcement.

### Permission Rule

Put a `.claude/settings.local.json` inside the **current** experiment directory to deny reads of the earlier ones outright:

```text
<project-dir>/
└── exp/
    └── .claude/
        └── settings.local.json     ← only affects sessions launched from exp/
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

- Paths must be **absolute**, and end in `/**` to cover everything beneath.
- Each new round needs its own file, listing every earlier directory.
- The file only affects Claude Code sessions started from that directory — other projects are untouched.

> [!WARNING]
> Tier 2 is a strong preference, not a sandbox. Denying `Read` does not stop `Bash(cat …)`, `Grep` or `Glob`. In practice denying `Read` is enough; if contamination would invalidate the result, put the rounds on separate machines or separate users.

## Local Development {#development | Local development}
This section is for contributors who need to modify skill prompts, agent definitions, or MCP service code. It is not required for ordinary Mechanist research runs.

> [!NOTE]
> **Local development requires cloning the Mechanist repository.** Marketplace installation is intended for normal use and does not provide a working directory for editing and loading local source code. After cloning, use `--plugin-dir` to point Claude Code at the repository.

Complete [Installation](#installation) and [External Reviewer Configuration](#environment) first. Then clone the repository and create a separate experiment directory beside it:

```bash
git clone https://github.com/zjunlp/Mechanist.git

mkdir exp && cd exp

# Load the plugin from the local repository
claude --model claude-opus-4-8 --plugin-dir ../Mechanist
```

```text
<dir>/
├── Mechanist/   # local plugin source
└── exp/         # experiment working directory
    └── task.md
```

> [!WARNING]
> `--plugin-dir` is resolved relative to the shell's current directory. Claude Code still starts when the path is wrong, but the plugin is not loaded.

Use an absolute path when starting from an IDE, desktop shortcut, alias, or wrapper script:

```bash
claude --model claude-opus-4-8 --plugin-dir /absolute/path/to/Mechanist
```

After loading, use `/help` to check skills and `/mcp` to check service connections.

| Change type | How to load it |
|---|---|
| `skills/`, `agents/`, slash commands, or prompt text | Run `/reload-plugins` in the session. |
| Python code for MCP or helper services under `mcp-servers/` | **Restart Claude Code.** `/reload-plugins` does not restart running processes. |
| Plugin manifest or MCP configuration | **Restart Claude Code.** |
| Environment variables such as `LLM_API_KEY` | Change the startup shell environment, then restart Claude Code. Running services do not reload variables. |
