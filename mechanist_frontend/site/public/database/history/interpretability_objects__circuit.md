# Circuit

_A development timeline within **Interpretability Objects** — auto-generated_

## Background

Circuits are named sub-graphs that jointly implement a target task.

## At a glance

- **Papers connected to this node in the DB:** 294
- **Highlighted below (top by citation):** 4
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

### 2022 Q4  ·  2022-10-01 → 2022-12-31

#### 1. Interpretability in the Wild: a Circuit for Indirect Object Identification in GPT-2 small

`2022-11-01` · **49** citations · _venue:_ ICLR

> **Research question.** How does GPT-2 small perform the indirect object identification (IOI) task, and what internal circuit is responsible for this behavior?

**Core contribution.** The paper identifies and validates a circuit of 26 attention heads in GPT-2 small that performs indirect object identification, using a combination of interpretability techniques and quantitative criteria for faithfulness, completeness, and minimality.

**Key findings.**
- Discovered a circuit of 26 attention heads grouped into 7 classes (e.g., Name Mover Heads, S-Inhibition Heads) that implement the IOI task.
- Identified redundant behavior such as Backup Name Mover Heads that activate when regular Name Mover Heads are ablated.
- Found that Negative Name Mover Heads write in the opposite direction, potentially to hedge predictions.
- Formulated and evaluated quantitative criteria (faithfulness, completeness, minimality) to validate circuit explanations.

_Target models:_ GPT-2 small

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

### 2023 Q3  ·  2023-07-01 → 2023-09-30

#### 1. Sparse Autoencoders Find Highly Interpretable Features in Language Models

`2023-09-15` · **38** citations · _venue:_ ICLR

> **Research question.** Can sparse autoencoders find interpretable, monosemantic features in language models by resolving superposition, and can these features be used for causal analysis and circuit discovery?

**Core contribution.** Sparse autoencoders provide a scalable, unsupervised method to find interpretable, monosemantic features in language models, enabling precise causal analysis and circuit discovery.

**Key findings.**
- Sparse autoencoder features are more interpretable than neurons, PCA, ICA, and random directions as measured by autointerpretability scores.
- Sparse autoencoder features allow more precise localization of causally important features for the IOI task than PCA, requiring fewer patches to achieve a given KL divergence.
- Individual features are monosemantic (e.g., an apostrophe feature) and have predictable effects on output logits, such as suppressing the 's' token after an apostrophe.
- Sparse autoencoders enable automatic circuit detection across layers, as demonstrated for a closing parenthesis feature.

_Target models:_ Pythia-70M, Pythia-410M

---
