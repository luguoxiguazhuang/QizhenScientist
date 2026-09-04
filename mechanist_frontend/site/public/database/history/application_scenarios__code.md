# Code

_A development timeline within **Application / Scenarios** — auto-generated_

## Background

Code scenarios cover program synthesis, understanding, and editing internal mechanisms.

## At a glance

- **Papers connected to this node in the DB:** 395
- **Highlighted below (top by citation):** 6
- **Year span:** 2015 — 2021
- **Most-cited paper:** Visualizing and Understanding Recurrent Networks — 888 citations

## Timeline

### 2015 Q2  ·  2015-04-01 → 2015-06-30

#### 1. Visualizing and Understanding Recurrent Networks

`2015-06-05` · **888** citations · _venue:_ arXiv

> **Research question.** How do LSTMs and other recurrent networks learn and represent long-range dependencies in sequential data, and what are the sources of their limitations?

**Core contribution.** This paper provides an empirical analysis of LSTM and GRU models on character-level language modeling, revealing interpretable cells that track long-range dependencies and quantifying the source of their performance gains and remaining errors through comparison with finite-context models.

**Key findings.**
- LSTMs develop interpretable memory cells that track long-range structural dependencies like line lengths, quotes, and brackets.
- LSTMs significantly outperform finite-context n-gram models on characters requiring long-range reasoning, such as closing braces and carriage returns.
- Error analysis reveals that scaling model size primarily reduces errors related to short-range (n-gram) dependencies, leaving other error categories largely unchanged.
- Training dynamics show that LSTMs gradually learn to model dependencies over increasing time horizons.

_Target models:_ LSTM, GRU, RNN

---

### 2017 Q2  ·  2017-04-01 → 2017-06-30

#### 1. Making Neural Programming Architectures Generalize via Recursion

`2017-04-21` · **80** citations · _venue:_ ICLR

> **Research question.** How can neural programming architectures be made to generalize better? The paper investigates whether incorporating recursion can improve generalization and interpretability.

**Core contribution.** The paper shows that incorporating recursion into neural programming architectures improves generalization and enables provable guarantees about the learned program's behavior.

**Key findings.**
- Recursive NPI programs achieve 100% accuracy on tasks like addition, bubble sort, topological sort, and quicksort with small training data.
- Non-recursive versions fail to generalize beyond a certain input complexity.
- Recursion allows for verification of perfect generalization by testing on a finite set of base cases and reduction rules.
- The paper provides the first provable guarantees of perfect generalization for neural programs.

_Target models:_ Neural Programmer-Interpreter (NPI)

---

### 2018 Q4  ·  2018-10-01 → 2018-12-31

#### 1. RNNbow: Visualizing Learning Via Backpropagation Gradients in RNNs

`2018-11-01` · **38** citations · _venue:_ IEEE Computer Graphics and Applications

> **Research question.** How can visualizing gradient flow during backpropagation training in recurrent neural networks provide insight into the learning process and help diagnose issues like vanishing gradients?

**Core contribution.** The paper introduces RNNbow, an interactive visualization tool that displays gradient flow during RNN training, offering insights into learning dynamics and issues like vanishing gradients that are not apparent from activation visualizations.

**Key findings.**
- RNNbow visualizes the vanishing gradient effect by showing how gradient contributions decay as they propagate back through time steps.
- Early in training, gradient updates are primarily due to local losses (short horizon), while later in training, gradients show longer-term dependencies (longer horizon).
- The tool's overview of maximum gradient per batch helps identify which parts of the training data the model learns from most.
- RNNbow reveals that the gradient horizon (how far back gradients flow) lengthens as training progresses, indicating improved learning of long-term dependencies.

_Target models:_ character-level RNN

---

### 2020 Q2  ·  2020-04-01 → 2020-06-30

#### 1. On the Bottleneck of Graph Neural Networks and its Practical\n Implications

`2020-06-09` · **147** citations · _venue:_ ICLR

> **Research question.** Why do graph neural networks (GNNs) struggle to propagate information between distant nodes? The paper proposes that a bottleneck in aggregating messages across long paths causes over-squashing, hindering GNNs in long-range tasks.

**Core contribution.** Introduces the over-squashing phenomenon as a novel explanation for GNNs' limitation in long-range tasks and shows that breaking the bottleneck with a simple fully-adjacent layer improves performance without additional tuning.

**Key findings.**
- GNNs suffer from over-squashing when aggregating messages across long paths, which hinders long-range information propagation.
- GCN and GIN are more susceptible to over-squashing than GAT and GGNN.
- In synthetic benchmarks, over-squashing prevents GNNs from fitting long-range patterns even in training.
- Adding a fully-adjacent layer (FA) to existing GNN models improves performance on real-world datasets (QM9, ENZYMES, NCI1, VARMISUSE) without additional tuning.

_Target models:_ GCN, GIN, GAT, GGNN

---

#### 2. On the Bottleneck of Graph Neural Networks and its Practical Implications

`2020-06-09` · **90** citations · _venue:_ ICLR

> **Research question.** What causes graph neural networks to struggle with propagating information between distant nodes, and how does the over-squashing bottleneck explain this?

**Core contribution.** The paper identifies over-squashing as a bottleneck in graph neural networks that hinders long-range information propagation, and demonstrates its impact on various benchmarks.

**Key findings.**
- Over-squashing prevents GNNs from fitting long-range signals in training data, as shown in a synthetic benchmark.
- GCN and GIN are more susceptible to over-squashing than GAT and GGNN due to their aggregation functions.
- Prior models on real-world datasets (QM9, ENZYMES, NCI1, VARMISUSE) suffer from over-squashing, and breaking the bottleneck with a fully-adjacent layer improves performance without tuning.
- Theoretical lower bounds show that the hidden size must grow exponentially with problem radius to avoid over-squashing.

_Target models:_ GCN, GIN, GAT, GGNN

---

### 2021 Q1  ·  2021-01-01 → 2021-03-31

#### 1. The Devil is in the Detail: Simple Tricks Improve Systematic Generalization of Transformers

`2021-01-01` · **54** citations · _venue:_ EMNLP

> **Research question.** How can simple tricks in model and training configurations improve the systematic generalization of Transformers on compositional reasoning tasks?

**Core contribution.** By revisiting basic model configurations (embedding scaling, early stopping, relative positional embedding, and Universal Transformer variants), the systematic generalization of Transformers can be drastically improved on several benchmark datasets.

**Key findings.**
- Relative positional embedding mitigates the EOS decision problem and significantly improves length generalization, achieving 100% accuracy on SCAN length split with cutoff 26.
- Early stopping based on IID validation data can be harmful for generalization; training longer often leads to better generalization performance.
- Embedding scaling, specifically Position Embedding Downscaling (PED), consistently improves generalization accuracy compared to standard scaling methods.
- Universal Transformers with relative positional embeddings often outperform standard Transformers on systematic generalization tasks.

_Target models:_ Transformers, Universal Transformers

---
