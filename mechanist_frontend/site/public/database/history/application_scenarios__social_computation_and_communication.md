# Social Computation & Communication

_A development timeline within **Application / Scenarios** — auto-generated_

## Background

Social Computation & Communication scenarios cover theory of mind, dialogue, cooperation, and social reasoning.

## At a glance

- **Papers connected to this node in the DB:** 143
- **Highlighted below (top by citation):** 2
- **Year span:** 2017 — 2020
- **Most-cited paper:** Graphs, Convolutions, and Neural Networks: From Graph Filters to Graph Neural Networks — 165 citations

## Timeline

### 2017 Q1  ·  2017-01-01 → 2017-03-31

#### 1. Mechanism-Aware Neural Machine for Dialogue Response Generation

`2017-02-12` · **90** citations · _venue:_ AAAI

> **Research question.** How can generative conversational models be improved to produce more diverse and meaningful responses by explicitly modeling latent responding mechanisms?

**Core contribution.** Proposes an encoder-diverter-decoder framework that models latent responding mechanisms to generate more diverse and meaningful dialogue responses, addressing the 1-to-n relationship between a post and its possible responses.

**Key findings.**
- The proposed MARM model achieves a 9.80% increase in acceptable response ratio over the best baseline method (MMI-bidi).
- MARM generates more diverse responses (diversity measure of 2.687) compared to baseline models.
- Different learned mechanisms influence wording and speaking styles, with distinct keywords associated with each mechanism (e.g., conjunctions, modifiers, questions, emphatic tones).
- MARM maintains stable response quality across top-ranked candidates, unlike baseline models where quality degrades for lower-ranked responses.

_Target models:_ MARM, RNNs2s, RNNencdec, RNNatt, NRM, MMMI-bidi

---

### 2020 Q4  ·  2020-10-01 → 2020-12-31

#### 1. Graphs, Convolutions, and Neural Networks: From Graph Filters to Graph Neural Networks

`2020-10-29` · **165** citations · _venue:_ IEEE Signal Processing Magazine

> **Research question.** How can graph signal processing be used to characterize the representation space of graph neural networks and explain their properties such as permutation equivariance and stability?

**Core contribution.** The paper uses graph signal processing to characterize the representation space of graph neural networks, deriving fundamental properties such as permutation equivariance and stability, and introduces extensions like ARMANet and EdgeNet.

**Key findings.**
- GCNNs are permutation equivariant, meaning they are independent of node labeling and exploit graph symmetries.
- GCNNs are stable to graph perturbations when using integral Lipschitz filters, with the change in output bounded by the perturbation size.
- Nonlinearities in GCNNs cause frequency mixing, allowing energy from high eigenvalues to be captured in low eigenvalues, enabling both stability and selectivity.
- ARMANets approximate ARMA graph filters with Jacobi iterations and can achieve sharper frequency responses with fewer parameters.

_Target models:_ FIR graph filter, GCNN, ARMANet, EdgeNet

---
