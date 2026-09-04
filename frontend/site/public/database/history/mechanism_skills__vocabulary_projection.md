# Vocabulary Projection

_A development timeline within **Mechanism Methods** — auto-generated_

## Background

Vocabulary Projection interprets a model's hidden states by projecting them back into the tokenizer vocabulary, revealing which words the network is 'reading its own mind' about at each layer.

## At a glance

- **Papers connected to this node in the DB:** 486
- **Highlighted below (top by citation):** 4
- **Year span:** 2019 — 2022
- **Most-cited paper:** Investigating BERT’s Knowledge of Language: Five Analysis Methods with NPIs — 90 citations

## Timeline

### 2019 Q1  ·  2019-01-01 → 2019-03-31

#### 1. Investigating BERT’s Knowledge of Language: Five Analysis Methods with NPIs

`2019-01-01` · **90** citations · _venue:_ EMNLP

> **Research question.** How best to evaluate the grammatical knowledge of sentence representation models, using negative polarity item (NPI) licensing in English as a case study.

**Core contribution.** BERT has significant knowledge of NPI licensing features, but its success varies widely across different experimental methods, indicating that a variety of methods is necessary to reveal all relevant aspects of a model's grammatical knowledge.

**Key findings.**
- BERT outperforms a bag-of-words baseline on all NPI licensing tasks.
- BERT's knowledge of NPI licensing is systematic but not categorical, and varies across different licensing environments.
- Gradient minimal pair evaluation shows near-perfect performance, but absolute minimal pair and probing tasks reveal weaknesses, particularly in scope detection.
- Intermediate fine-tuning on MNLI and CCG does not improve BERT's performance on NPI licensing tasks.

_Target models:_ BERT-large, GloVe BoW

---

### 2020 Q1  ·  2020-01-01 → 2020-03-31

#### 1. Understanding Neural Abstractive Summarization Models via Uncertainty

`2020-01-01` · **37** citations · _venue:_ EMNLP

> **Research question.** How does decoder uncertainty (entropy) correlate with copying behavior, syntactic factors, and attention in abstractive summarization models?

**Core contribution.** Analyzing summarization models via decoder uncertainty reveals correlations with copying behavior, syntactic distance, and attention, providing insights into model generation decisions.

**Key findings.**
- Low prediction entropy strongly correlates with copying tokens from the input document rather than generating novel text.
- Entropy is higher at the beginning of sentences and lower at the end, especially for extractive datasets like CNN/DM.
- Syntactic distance between tokens correlates with entropy changes, with higher distance leading to more uncertain decisions.
- Attention entropy correlates with prediction entropy, with low prediction entropy associated with low attention entropy.

_Target models:_ PEGASUS, BART

---

### 2022 Q1  ·  2022-01-01 → 2022-03-31

#### 1. Transformer Feed-Forward Layers Build Predictions by Promoting Concepts in the Vocabulary Space

`2022-01-01` · **82** citations · _venue:_ EMNLP

> **Research question.** How do transformer-based language models construct predictions, specifically through the operation of feed-forward network (FFN) layers?

**Core contribution.** The paper shows that feed-forward network (FFN) layers in transformers operate by promoting interpretable concepts in the vocabulary space through sub-updates, and this understanding can be leveraged for controlling model predictions (e.g., reducing toxicity) and improving computational efficiency (e.g., early exiting).

**Key findings.**
- FFN updates can be decomposed into sub-updates corresponding to value vectors, each promoting human-interpretable concepts in the vocabulary space.
- FFN updates primarily work by promoting candidate tokens rather than eliminating them.
- Value vectors across layers encode semantic, syntactic, and named entity concepts.
- Activating a small set of non-toxic value vectors reduces toxicity in GPT2 generations by almost 50%.

_Target models:_ GPT2, WIKI LM

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
