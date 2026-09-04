# Submission Code

This directory is designed to run as a standalone submission package.

- `main/`: core submission runtime source files and bundled project code
- `config/`: submission-time defaults and environment template
- `environment.yml`: reproducible Python environment
- `scripts/`: `run.py` (the only runtime entrypoint) and `device_stub.py`
  (a reference instrument, for wiring and testing)
- `tests/`: unit tests for protocol decomposition, execution backends, and the
  SciAtlas evidence utilities

Runtime artifacts are written outside this directory, at the repository root:
`results/` for run payloads and `logs/` for launcher logs.

## Credentials

`qizhen_scientist` calls an LLM and therefore needs API credentials
in the runtime environment. Copy `config/environment.example` and fill it in:

```bash
LLM_PROVIDER=openai            # `openai` for OpenAI-compatible endpoints
LLM_API_KEY=<your key>
LLM_BASE_URL=<endpoint>/compatible-mode/v1
LLM_MODEL=qwen3.8-max-0902
LLM_ENABLE_THINKING=false      # `true` switches to the provider-native
                               # structured-output path (slower, higher quality)
```

The legacy `ANTHROPIC_*` / `OPENAI_*` names still work as fallbacks.

Without a key the decision engine logs a warning and silently falls back to
non-LLM defaults, so a `qizhen_scientist` run will complete but the controller
will not be doing anything. `atlas_baseline` needs no credentials.

## Entry

Run one task at a time:

```bash
python code/scripts/run.py suzuki
```

There are two controller modes, and both accept either BO backbone:

```bash
python code/scripts/run.py suzuki --controller-mode qizhen_scientist --bayesian_method atlas
python code/scripts/run.py suzuki --controller-mode atlas_baseline   --bayesian_method botorch
```

`qizhen_scientist` always runs with a knowledge prior — it defaults to the
bundled curated card set at `data/evidence_cards/suzuki_evidence_cards.jsonl`.
`atlas_baseline` never carries one, and rejects `--evidence-cards`, so its
numbers stay a clean planner-only reference.

To run on retrieved literature instead of the curated cards, freeze a bundle
first and point the run at it:

```bash
# One-time preparation; requires SCIATLAS_API_KEY.
python code/scripts/prepare_sciatlas_evidence.py suzuki

# Review the cards and set manifest.json review_status to approved, then run:
python code/scripts/run.py suzuki \
  --controller-mode qizhen_scientist \
  --evidence-cards data/evidence_cards/sciatlas/suzuki/evidence_cards.jsonl \
  --bayesian_method atlas
```

Retrieved cards (`source_type: sciatlas_literature`) additionally have to clear
a review + SHA-256 checksum gate before the run starts; curated cards do not.
SciAtlas is never called inside an optimization round. The request, raw
response, converted cards, checksums, and review manifest are frozen under
`data/evidence_cards/sciatlas/<task>/`, so every seed uses the same prior.

Defaults are loaded from `code/config/config.yaml`:

- controller mode: `qizhen_scientist`
- Bayesian method: `atlas`
- batch size: `1`
- rounds: `40`
- seeds: `100, 200, ..., 2000`
- dataset root: `data`
- result root: `results/project`
- log root: `logs`

## Execution backends

A run's observed yields come from an **execution backend**. The real instrument
is the primary route; the bundled result table is the substitute used when no
instrument is reachable. Select it with `runtime.execution.backend` in
`code/config/config.yaml`, or `--execution-backend` on the command line:

| Backend | Behaviour |
|---|---|
| `table_lookup` | Replay the bundled `*_test.csv` table. **This is the default**, i.e. the shipped configuration assumes no instrument is attached. |
| `device` | Require the instrument. If it is unreachable the run **fails** rather than substituting replayed values. |
| `auto` | Probe the instrument once at startup; substitute the result table for the whole run if it is down, and say so in the log. |

`device` deliberately refuses to fall back mid-run: quietly filling a failed
experiment with a table value would record an unmeasured number as a
measurement. Use `auto` when a substitute is acceptable — it decides once, so a
single run never mixes measured and replayed values.

Every observation records where it came from, in `observation_origin`
(per history entry), `execution_backend` (per trajectory and decision-trace
entry), and `history_mode` (per run).

### The instrument contract

The launcher never runs an experiment itself. When it needs a yield it hands the
decomposed protocol to an external executor over HTTP and waits for the
measurement. The executor implements three endpoints:

```
GET  {base_url}/health              -> 200 while the executor can accept work
POST {base_url}/tasks               {task, candidate_id, candidate, steps}
                                    -> {"task_id": "..."}
GET  {base_url}/tasks/{task_id}     -> {"status": "pending"|"running"|"completed"|"failed",
                                        "yield": <float>,   # when completed
                                        "detail": "..."}    # when failed
```

The launcher submits once (retrying on transport errors) and then polls until a
terminal state, so it works from a batch process with no inbound network access.

`scripts/device_stub.py` is a reference executor: it implements the contract,
prints every protocol it receives, and can simulate latency and faults. Use it
to exercise the loop before real hardware exists — its numbers are replayed, not
measured, and it labels them as such.

```bash
# terminal 1
python code/scripts/device_stub.py --port 8900 --latency-sec 5

# terminal 2
python code/scripts/run.py suzuki --execution-backend device \
  --device-base-url http://127.0.0.1:8900
```

## Experiment steps

Each proposed condition is decomposed into an ordered list of atomic
operations, emitted as JSON alongside the condition. The decomposition is
purely deterministic — no model call — so the same condition always yields the
same protocol.

```json
[{"index": 1, "action": "take_sample", "target": "reaction vial", "amount": null},
 {"index": 2, "action": "dispense", "target": "6-iodoquinoline",
  "role": "Electrophile", "amount": 0.1, "unit": "mmol"},
 {"index": 8, "action": "stir", "target": "reaction vial",
  "duration_min": 60.0, "temperature_c": 100.0}]
```

Actions are a closed set: `take_sample`, `dispense`, `stir`, `heat`, `quench`,
`analyze`. Process constants the dataset holds fixed (scale, loadings,
temperature, time) live in `SUZUKI_DEFAULTS` in
`main/chem_agent_bo/steps/decompose.py`.

## Inputs

The launcher reads the following task data under `data/` by default:

- `Suzuki/suzuki_train.csv`: initial labeled observations
- `Suzuki/suzuki_test_features.csv`: candidate pool proposed by the optimizer
- `Suzuki/suzuki_test.csv`:
  public oracle table used by this local replay entrypoint for reproducibility
- `Suzuki/options.json`: optional discrete value metadata
- `Suzuki/*_searchspace.csv`: optional search-space reference file if present

Knowledge prior:

- `--evidence-cards <path>`: an `evidence_cards.jsonl` or `.csv` prior. When it
  is omitted, `qizhen_scientist` falls back to `runtime.evidence_paths` for the
  task, which ships pointing at the bundled curated card set — **so this mode
  always runs with a prior**. `atlas_baseline` rejects the flag outright.
- `--evidence-top-k <n>`: how many applicable cards to inject (default `10`).
  Cards are ranked by a fixed heuristic over `mapping_status`, `confidence`,
  variable overlap and target-node overlap; the query text is not part of the
  score, so the selected set is frozen for the whole run.
- a bundled card set is provided at
  `data/evidence_cards/suzuki_evidence_cards.jsonl`

## Runtime Flow

This submission entrypoint runs a local closed-loop replay:

1. read `*_train.csv` as the initial labeled observation set
2. propose the next candidate from `*_test_features.csv`
3. look up the selected candidate's true result in `*_test.csv`
4. append that observed result back into history
5. continue until the configured rounds and seeds finish

So the current submission package is self-contained for local reproducibility:
it automatically queries the bundled public `*_test.csv` oracle and closes the
loop by itself.

CLI parameters used by evaluators:

- `task`: required task alias, currently `suzuki`
- `--controller-mode`: choose `qizhen_scientist` or `atlas_baseline`
- `--bayesian_method`: choose the BO backbone, such as `atlas` or `botorch`
- `--dataset-root`: override the default bundled data location if needed
- `--execution-backend`: `device`, `auto`, or `table_lookup` (default)
- `--device-base-url`: instrument endpoint, overriding the config
- `--evidence-cards`: evidence card file; omit it to use the configured default
- `--evidence-top-k`: number of cards to inject (default `10`)
- `--sciatlas-manifest`: optional manifest override for a frozen literature bundle
- `--rounds`: override the total queried points per seed
- `--seeds`: override the default seed list

## Outputs

Submission artifacts are split by purpose, and both roots resolve relative to
the repository root, not to `code/`:

- result payloads, checkpoints, progress JSON, and per-seed summaries go under
  `results/project/<Dataset>/<mode>/<bayesian_method>/seed_<seed>/`
- cleaned timestamped launcher logs go under
  `logs/<Dataset>/<mode>/<bayesian_method>/run_<timestamp>.log`

Override them with `--output-root` / `--logs-root` or the `runtime.output_root`
/ `runtime.logs_root` keys in `code/config/config.yaml`.

`scripts/run.py` is the only runtime entrypoint in this submission tree.
It calls the implementation in `main/submission_runner.py`, which runs the full
local replay and uses the public `*_test.csv` oracle for closed-loop
reproducibility.

The submission bundle includes the project-owned runtime code it needs under
`main/`, so the package runs without importing anything from outside this
repository. `main/oracle.py` documents the result-query boundary for a stricter
evaluator harness.

`scripts/prepare_sciatlas_evidence.py` is a preprocessing utility, not another
online optimizer. It never reads benchmark test labels. A run that consumes its
frozen `sciatlas_literature` cards requires human-approved cards with a matching
SHA-256 checksum in `manifest.json`.
