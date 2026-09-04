# Layer Normalization

_A development timeline within **Interpretability Objects** — auto-generated_

## Background

Layer Normalization shapes the geometry of the residual stream and has surprising interpretive consequences.

## At a glance

- **Papers connected to this node in the DB:** 184
- **Highlighted below (top by citation):** 3
- **Year span:** 2016 — 2020
- **Most-cited paper:** Understanding the Difficulty of Training Transformers — 155 citations

## Timeline

### 2016 Q4  ·  2016-10-01 → 2016-12-31

#### 1. Using Fast Weights to Attend to the Recent Past

`2016-10-20` · **153** citations · _venue:_ NeurIPS

> **Research question.** How can neural networks benefit from variables that change slower than activities but faster than standard weights to store temporary memories and implement attention to the recent past?

**Core contribution.** This paper shows that introducing fast weights, which store temporary memories via an outer product rule and decay, improves RNN performance on tasks requiring memory by implementing a form of attention to the recent past.

**Key findings.**
- Fast associative memory significantly outperforms LSTM variants on associative retrieval tasks when the number of recurrent units is small.
- A multi-level visual attention model using fast weights to store partial results outperforms LSTMs and approaches ConvNet performance on MNIST classification.
- In a facial expression recognition task, the fast weight model outperforms LSTM and IRNN but is outperformed by a ConvNet due to the latter's efficient weight-sharing and architectural engineering.
- Fast weights enable reinforcement learning agents to learn faster and achieve better performance in partially observable environments compared to RNN and LSTM agents.

_Target models:_ IRNN, LSTM, A-LSTM, Fast weights

---

### 2020 Q1  ·  2020-01-01 → 2020-03-31

#### 1. Understanding the Difficulty of Training Transformers

`2020-01-01` · **155** citations · _venue:_ EMNLP

> **Research question.** What complicates Transformer training? The paper investigates the root causes of instability in training Transformers, focusing on the amplification effect due to dependency on residual branches.

**Core contribution.** The paper identifies the amplification effect—where heavy dependency on residual branches amplifies parameter perturbations and destabilizes training—as the root cause of Transformer training instability, and proposes Admin, an adaptive initialization method that controls this dependency to stabilize training and improve performance.

**Key findings.**
- Unbalanced gradients are not the root cause of training instability in Transformers.
- The amplification effect, caused by heavy dependency on residual branches, is the main cause of instability in Post-LN Transformers.
- Pre-LN Transformers are more stable but have limited model potential due to lighter dependency on residual branches.
- Admin initialization stabilizes training by controlling dependency on residual branches early and allowing more flexibility later.

_Target models:_ Post-LN Transformer, Pre-LN Transformer, Transformer-small, Transformer-base

---

### 2020 Q4  ·  2020-10-01 → 2020-12-31

#### 1. A Primer in BERTology: What We Know About How BERT Works

`2020-12-01` · **146** citations · _venue:_ TACL

> **Research question.** What is the current state of knowledge about how BERT works, including the information it learns, how it is represented, and common modifications to its training and architecture?

**Core contribution.** This paper provides the first comprehensive survey of over 150 studies on BERT, summarizing the current state of knowledge about how BERT works, what information it learns, and how it is represented, and outlines directions for future research.

**Key findings.**
- BERT encodes syntactic and semantic knowledge, but its understanding is incomplete and it is insensitive to malformed input.
- BERT's self-attention heads exhibit interpretable patterns and some specialize in syntactic relations.
- BERT is overparameterized and can be compressed with minimal loss using techniques like knowledge distillation, quantization, and pruning.
- Pre-training helps BERT find wider optima and improves generalization for downstream tasks.

_Target models:_ BERT, BERT-base, BERT-large

---
