# Word Embedding

_A development timeline within **Interpretability Objects** — auto-generated_

## Background

The token embedding table anchors semantic geometry at the input layer.

## At a glance

- **Papers connected to this node in the DB:** 342
- **Highlighted below (top by citation):** 5
- **Year span:** 2019 — 2022
- **Most-cited paper:** Just Say No to Single Embeddings: Why Your AI Needs Multiple Perspectives — 166 citations

## Timeline

### 2019 Q2  ·  2019-04-01 → 2019-06-30

#### 1. Just Say No to Single Embeddings: Why Your AI Needs Multiple Perspectives

`2019-06-06` · **166** citations · _venue:_ NeurIPS

> **Research question.** How does BERT represent linguistic features internally, and what is the geometric structure of these representations?

**Core contribution.** The paper shows that BERT represents linguistic features in separate semantic and syntactic subspaces, provides evidence of fine-grained geometric representation of word senses, and gives a mathematical argument for the squared-distance tree embedding.

**Key findings.**
- Attention matrices encode syntactic dependency relations, as shown by linear probes achieving high accuracy.
- Parse tree embeddings in BERT approximate Pythagorean embeddings (squared Euclidean distance corresponds to tree distance), and there is a mathematical justification for this.
- Word senses are represented as clusters in embedding space, and a simple nearest-neighbor classifier on BERT embeddings achieves state-of-the-art word sense disambiguation.
- Semantic information can be isolated in a lower-dimensional subspace via a learned linear transformation (semantic probe).

_Target models:_ BERT, BERT-base, BERT-large

---

#### 2. Interpreting and improving natural-language processing (in machines) with natural language-processing (in the brain)

`2019-05-28` · **142** citations · _venue:_ NeurIPS

> **Research question.** How can brain activity recordings be used to interpret neural network representations, and can aligning models with brain activity improve their language understanding?

**Core contribution.** Introduces a method to interpret neural network representations by aligning them with brain activity recordings, and shows that increasing brain-alignment in BERT improves its performance on syntactic tasks.

**Key findings.**
- Middle layers of transformers are better at predicting brain activity for longer contexts.
- Transformer-XL's performance does not degrade with longer context, unlike other models.
- Uniform attention in shallow layers of BERT improves brain activity prediction for contexts up to 25 words.
- Altering BERT to have uniform attention in shallow layers improves its performance on syntactic tasks.

_Target models:_ ELMo, USE, BERT, Transformer-XL

---

### 2019 Q4  ·  2019-10-01 → 2019-12-31

#### 1. Transformers without Tears: Improving the Normalization of Self-Attention

`2019-10-14` · **130** citations · _venue:_ International Workshop on Spoken Language Translation

> **Research question.** How can Transformer training be improved through normalization-centric changes, specifically by using pre-norm residual connections, smaller initializations, and a new scaled ℓ2 normalization?

**Core contribution.** Proposes three simple, normalization-centric changes to Transformer training: pre-norm residual connections (PRENORM) for stability, scaled ℓ2 normalization (SCALE NORM) for speed and performance, and fixed word embedding normalization (FIXNORM), which together improve low-resource neural machine translation.

**Key findings.**
- Pre-norm residual connections (PRENORM) enable warmup-free training with large learning rates and are more stable than post-norm, especially in low-resource settings.
- Scaled ℓ2 normalization (SCALE NORM) is faster than LayerNorm and improves performance on low-resource translation tasks.
- Fixing word embedding norms (FIXNORM) provides additional gains, particularly on certain language pairs.
- Combining PRENORM, SCALE NORM, and FIXNORM yields an average improvement of +1.1 BLEU on five low-resource translation pairs.

_Target models:_ Transformer

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

### 2022 Q1  ·  2022-01-01 → 2022-03-31

#### 1. Grokking: Generalization Beyond Overfitting on Small Algorithmic Datasets

`2022-01-06` · **76** citations · _venue:_ arXiv

> **Research question.** How do neural networks generalize beyond memorization on small algorithmic datasets, and what is the phenomenon of 'grokking' where generalization improves long after overfitting?

**Core contribution.** Introduces and studies the 'grokking' phenomenon where neural networks suddenly generalize long after overfitting on small algorithmic datasets, and shows that weight decay significantly improves data efficiency.

**Key findings.**
- Neural networks exhibit 'grokking', a sudden improvement in generalization from chance to perfect performance long after overfitting, on small algorithmic datasets.
- Smaller training datasets require exponentially more optimization steps to achieve generalization, while converged performance remains perfect.
- Weight decay is highly effective at improving data efficiency, more than other regularization techniques like dropout or gradient noise.
- Visualization of learned embeddings reveals structures that correspond to the underlying mathematical objects, such as circular topology for modular addition.

_Target models:_ transformer

---
