# Config Notes

- `config.yaml` contains launcher defaults and dataset path conventions.
- `api.*` in `config.yaml` records which environment variable names carry the
  model, credential, base URL, and provider selection.
- `environment.example` documents the runtime environment variables without
  secrets: the provider-neutral `LLM_*` names used by the decision engine
  (`LLM_PROVIDER`, `LLM_API_KEY`, `LLM_BASE_URL`, `LLM_MODEL`,
  `LLM_ENABLE_THINKING`) plus the SciAtlas preparation keys. The legacy
  `ANTHROPIC_*` / `OPENAI_*` names remain supported as fallbacks.
- `../main/configs/agent_bo_suzuki.yaml` is the bundled
  controller config used by the launcher.
- `runtime.output_root` controls where `.pt`, checkpoint, and progress artifacts
  are written. The submission default is `results/project`, resolved relative to
  the repository root.
- `runtime.logs_root` controls where cleaned `.log` files are written. The
  submission default is `logs`, also relative to the repository root.
- `runtime.bayesian_method` selects the BO backbone used by the launcher.
- `runtime.execution.backend` selects where observed yields come from:
  `device` (real instrument, no fallback), `auto` (instrument if reachable,
  otherwise the bundled result table), or `table_lookup`. **The shipped default
  is `table_lookup`**, i.e. no instrument attached.
- `runtime.execution.device.*` holds the instrument endpoint and polling
  settings (`base_url`, paths, `poll_interval_sec`, `timeout_sec`,
  `max_retries`, `objective_key`).
- `runtime.evidence_paths` maps task aliases to the knowledge prior that
  `qizhen_scientist` runs with. It ships pointing at the bundled curated card
  set; point it at a frozen retrieved bundle for a formal literature run.
- `sciatlas.yaml` defines reproducible literature queries, allowed target nodes,
  and conservative evidence-blocking rules.

Credentials must come from the runtime environment, not from committed files.
SciAtlas credentials are required only during evidence preparation; online
optimization consumes local frozen artifacts and does not call SciAtlas.
