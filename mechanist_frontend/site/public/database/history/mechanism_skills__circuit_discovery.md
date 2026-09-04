# Circuit Discovery

_A development timeline within **Mechanism Methods** — auto-generated_

## Background

Circuit Discovery searches for the sub-graph of components that implements a particular behavior, exposing algorithms inside the model.

## At a glance

- **Papers connected to this node in the DB:** 324
- **Highlighted below (top by citation):** 2
- **Year span:** 2022 — 2023
- **Most-cited paper:** In-context Learning and Induction Heads — 83 citations

## Timeline

### 2022 Q3  ·  2022-07-01 → 2022-09-30

#### 1. In-context Learning and Induction Heads

`2022-09-24` · **83** citations · _venue:_ arXiv

> **Research question.** Do induction heads constitute the mechanism for the majority of in-context learning in transformer models?

**Core contribution.** Presents evidence that induction heads, a type of attention head circuit, are the primary mechanism for in-context learning in transformer models.

**Key findings.**
- Induction heads form abruptly during a phase change in training, coinciding with a sharp increase in in-context learning ability.
- Altering the transformer architecture to shift the formation of induction heads also shifts the improvement in in-context learning.
- Ablating induction heads in small models greatly reduces in-context learning.
- Induction heads exhibit general in-context learning behaviors beyond literal copying, such as translation.

_Target models:_ small attention-only models, small models with MLPs, full-scale models

---

### 2023 Q1  ·  2023-01-01 → 2023-03-31

#### 1. Progress measures for grokking via mechanistic interpretability

`2023-01-12` · **54** citations · _venue:_ ICLR

> **Research question.** How can we find continuous progress measures that underlie seemingly discontinuous qualitative changes (like grokking) in neural networks? The paper uses mechanistic interpretability to reverse-engineer learned behaviors and define such progress measures.

**Core contribution.** The paper uses mechanistic interpretability to define progress measures for grokking, showing that grokking arises from the gradual amplification of structured mechanisms (a Fourier multiplication algorithm) followed by removal of memorizing components, rather than being a sudden shift.

**Key findings.**
- The transformers implement modular addition using a Fourier multiplication algorithm that maps inputs to a circle and uses trigonometric identities.
- The model's weights and activations show periodic structure and are sparse in the Fourier domain, with key frequencies.
- Two progress measures (restricted loss and excluded loss) improve continuously prior to grokking, revealing hidden progress.
- Training can be split into three phases: memorization, circuit formation, and cleanup.

_Target models:_ one-layer transformer, two-layer transformer

---
