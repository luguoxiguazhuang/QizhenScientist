# Persona

_A development timeline within **Application / Scenarios** — auto-generated_

## Background

Persona scenarios examine how role-playing shapes internal state and output distributions.

## At a glance

- **Papers connected to this node in the DB:** 136
- **Highlighted below (top by citation):** 2
- **Year span:** 2023 — 2023
- **Most-cited paper:** Its Alive: AI Independence Without Human Prompting — 59 citations

## Timeline

### 2023 Q3  ·  2023-07-01 → 2023-09-30

#### 1. Kronfluence: Influence Functions with Eigenvalue-corrected Kronecker-Factored Approximate Curvature

`2023-08-07` · **23** citations · _venue:_ arXiv

> **Research question.** How can influence functions be scaled to large language models to study their generalization patterns?

**Core contribution.** The paper scales influence functions to large language models (up to 52B parameters) using the EK-FAC approximation and uses them to study generalization patterns, finding that larger models generalize more abstractly and that influence patterns are sparse and sensitive to word order.

**Key findings.**
- EK-FAC is competitive with traditional influence function estimators (like LiSSA) in accuracy despite being orders of magnitude faster.
- The distribution of influences is heavy-tailed (roughly a power law) but spread over many sequences, suggesting behaviors do not result from memorization of a handful of sequences.
- Larger models consistently generalize at a more abstract level than smaller models, as seen in role-playing, programming, mathematical reasoning, and cross-lingual generalization.
- Influence is approximately evenly distributed between layers on average, but different layers show different generalization patterns, with middle layers focusing on more abstract patterns.

_Target models:_ 52 billion parameter model, 810 million parameter model

---

### 2023 Q4  ·  2023-10-01 → 2023-12-31

#### 1. Its Alive: AI Independence Without Human Prompting

`2023-10-02` · **59** citations · _venue:_ arXiv

> **Research question.** How can representation engineering (RepE) improve transparency and control of AI systems, particularly for safety-relevant concepts?

**Core contribution.** Introduces representation engineering (RepE) as a top-down approach to AI transparency, providing baselines like Linear Artificial Tomography (LAT) and demonstrating its applicability to reading and controlling safety-relevant concepts in large language models.

**Key findings.**
- RepE methods can extract representations of high-level concepts like honesty, utility, emotion, and harmfulness.
- LAT achieves state-of-the-art on TruthfulQA, improving zero-shot accuracy by 18.1 percentage points.
- Representation control can increase model honesty and reduce compliance with harmful instructions, even under jailbreak attempts.
- Emotions are represented in LLMs and can be manipulated to affect model compliance and behavior.

_Target models:_ LLaMA-2-Chat (7B), LLaMA-2-Chat (13B), LLaMA-2-Chat (70B), Vicuna-13B

---
