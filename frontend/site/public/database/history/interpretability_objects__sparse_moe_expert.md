# Sparse MoE Expert

_A development timeline within **Interpretability Objects** — auto-generated_

## Background

Sparse Mixture-of-Experts routing exposes new interpretive surface: which expert handles what, and why.

## At a glance

- **Papers connected to this node in the DB:** 77
- **Highlighted below (top by citation):** 1
- **Year span:** 2022 — 2022
- **Most-cited paper:** On the Representation Collapse of Sparse Mixture of Experts — 16 citations

## Timeline

### 2022 Q2  ·  2022-04-01 → 2022-06-30

#### 1. On the Representation Collapse of Sparse Mixture of Experts

`2022-04-20` · **16** citations · _venue:_ NeurIPS

> **Research question.** How can we prevent representation collapse in sparse mixture-of-experts (SMoE) models?

**Core contribution.** The paper identifies the representation collapse issue in sparse mixture-of-experts (SMoE) models and proposes a routing algorithm that projects token and expert representations onto a low-dimensional hypersphere, alleviating collapse and improving performance and routing consistency.

**Key findings.**
- X-MOE consistently outperforms baseline SMoE models on cross-lingual language model pre-training and fine-tuning across multiple benchmarks.
- X-MOE alleviates the representation collapse issue compared to the baseline, as shown by visualization and quantitative metrics.
- X-MOE achieves more consistent routing behaviors during both pre-training and fine-tuning, with lower routing fluctuation and higher inter-run consistency.
- The routing algorithm benefits from dimension reduction, L2 normalization, and freezing the router during fine-tuning.

_Target models:_ X-MOE, SMoE baseline

---
