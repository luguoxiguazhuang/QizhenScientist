# Magnitude Analysis

_A development timeline within **Mechanism Methods** — auto-generated_

## Background

Magnitude Analysis studies activations and weights at the level of raw numerical size — norms, sparsity, extreme values — as a bare-bones way to spot mechanistic structure.

## At a glance

- **Papers connected to this node in the DB:** 1695
- **Highlighted below (top by citation):** 13
- **Year span:** 2013 — 2022
- **Most-cited paper:** Intriguing properties of neural networks — 5704 citations

## Timeline

### 2013 Q4  ·  2013-10-01 → 2013-12-31

#### 1. Intriguing properties of neural networks

`2013-12-21` · **5704** citations · _venue:_ ICLR

> **Research question.** Do individual units in neural networks have semantic meaning, and are neural networks robust to small perturbations?

**Core contribution.** The paper demonstrates that semantic information in neural networks is contained in the space of activations rather than individual units, and that neural networks are vulnerable to adversarial examples that generalize across models and datasets.

**Key findings.**
- Random directions in the activation space are as semantically interpretable as individual units.
- Neural networks are susceptible to adversarial examples—imperceptible perturbations that cause misclassification.
- Adversarial examples generalize across models with different hyperparameters.
- Adversarial examples generalize across models trained on disjoint datasets.

_Target models:_ FC, AE, AlexNet, QuocNet

---

### 2015 Q3  ·  2015-07-01 → 2015-09-30

#### 1. Reasoning about Entailment with Neural Attention

`2015-09-22` · **427** citations · _venue:_ ICLR

> **Research question.** Can an end-to-end differentiable neural network with a word-by-word attention mechanism outperform existing methods for recognizing textual entailment (RTE)?

**Core contribution.** The paper introduces a neural model based on LSTMs with a word-by-word attention mechanism for recognizing textual entailment, which outperforms previous neural and feature-based models, achieving state-of-the-art accuracy on the SNLI dataset.

**Key findings.**
- Conditional encoding (processing the hypothesis conditioned on the premise) improves performance over encoding sentences independently.
- Incorporating an attention mechanism provides further performance gains by allowing the model to focus on relevant parts of the premise.
- Word-by-word attention yields the best performance, enabling fine-grained reasoning over entailments of individual words and phrases.
- Two-way attention (attending in both directions) does not improve performance, likely due to the asymmetric nature of entailment.

_Target models:_ LSTM

---

### 2017 Q4  ·  2017-10-01 → 2017-12-31

#### 1. Methods for interpreting and understanding deep neural networks

`2017-10-24` · **2610** citations · _venue:_ Digital Signal Processing

> **Research question.** How can we interpret and understand deep neural network models and their predictions?

**Core contribution.** This tutorial provides an overview of techniques for interpreting deep neural networks, focusing on activation maximization for interpreting concepts and layer-wise relevance propagation for explaining individual decisions, with practical recommendations.

**Key findings.**
- Activation maximization can produce more realistic prototypes when using a data density expert or a generative model.
- Sensitivity analysis explains the variation of the function, while decomposition techniques explain the function value itself.
- Layer-wise relevance propagation can be understood as a deep Taylor decomposition for ReLU networks.
- Practical recommendations for applying LRP include using deep Taylor LRP rules and choosing appropriate model architectures.

_Target models:_ three-layer DNN, BVLC CaffeNet, GoogleNet

---

### 2018 Q1  ·  2018-01-01 → 2018-03-31

#### 1. Constituency Parsing with a Self-Attentive Encoder

`2018-01-01` · **484** citations · _venue:_ ACL

> **Research question.** How can self-attention be used for constituency parsing?

**Core contribution.** Proposes a constituency parsing model based on self-attention that achieves state-of-the-art results on the Penn Treebank and Chinese Treebank.

**Key findings.**
- The self-attention parser achieves high F1 scores, outperforming previous recurrent and convolutional models.
- Attention heads in the model capture syntactic relationships such as subject-verb dependencies.
- The model demonstrates the effectiveness of self-attention for syntactic parsing tasks.

_Target models:_ Self-attention based constituency parser

---

#### 2. Understanding Convolutional Neural Networks for Text Classification

`2018-01-01` · **228** citations · _venue:_ ACL Workshop

> **Research question.** How do Convolutional Neural Networks (CNNs) process and classify text, specifically examining the roles of filters and max-pooling?

**Core contribution.** The paper refines the understanding of how CNNs process text, showing that max-pooling induces a thresholding behavior to separate important ngrams, filters are not homogeneous and can detect multiple semantic classes of ngrams, and filters can also suppress negative ngrams. These findings are used to improve model and prediction interpretability.

**Key findings.**
- Max-pooling induces a thresholding behavior, separating important ngrams from irrelevant ones for classification.
- Filters are not homogeneous; a single filter can detect multiple distinct semantic classes of ngrams by utilizing different slot activation patterns.
- Filters can detect negative ngrams, actively suppressing certain word patterns despite the presence of other highly activating words.
- There is a discrepancy between the top-scoring naturally occurring ngrams and top-scoring possible ngrams, which can be exploited to create adversarial examples.

_Target models:_ Convolutional Neural Networks (CNNs)

---

#### 3. On the importance of single directions for generalization

`2018-03-19` · **195** citations · _venue:_ ICLR

> **Research question.** What is the relationship between a network's reliance on single directions (activations of single units or linear combinations) and its generalization performance? How do regularization methods like dropout and batch normalization affect this reliance? Is class selectivity a good predictor of unit importance?

**Core contribution.** Networks that generalize well are less reliant on single directions in activation space. Batch normalization reduces this reliance and decreases class selectivity, while class selectivity is a poor predictor of unit importance.

**Key findings.**
- Networks trained on corrupted labels (memorizing) are more sensitive to ablation of single directions than those that generalize.
- Among networks trained on uncorrupted data, generalization performance correlates with robustness to ablation of single directions.
- The area under the cumulative ablation curve (AUC) correlates with generalization and can be used for early stopping and hyperparameter selection.
- Dropout does not discourage reliance on single directions beyond the dropout fraction used in training.

_Target models:_ 2-hidden layer MLP, 11-layer convolutional network, 50-layer ResNet

---

### 2018 Q2  ·  2018-04-01 → 2018-06-30

#### 1. On the Spectral Bias of Neural Networks

`2018-06-22` · **163** citations · _venue:_ NeurIPS

> **Research question.** What is the spectral bias in neural networks, i.e., why do they learn low-frequency functions first, and how does the data manifold shape affect learning of higher frequencies?

**Core contribution.** Neural networks exhibit a spectral bias, learning low-frequency functions first, and the complexity of the data manifold facilitates learning of higher frequencies.

**Key findings.**
- Lower frequencies are learned first during training.
- Lower frequencies are more robust to parameter perturbations.
- The spectral bias persists on real data like MNIST.
- Complex manifold shapes make learning higher frequencies easier.

_Target models:_ ReLU network

---

#### 2. Relational Deep Reinforcement Learning

`2018-06-05` · **159** citations · _venue:_ arXiv

> **Research question.** How can incorporating structured perception and relational reasoning via self-attention improve the efficiency, generalization, and interpretability of deep reinforcement learning agents?

**Core contribution.** Introduces a deep RL agent architecture that uses self-attention for relational reasoning, leading to improved sample efficiency, generalization, and interpretable representations compared to convolutional baselines.

**Key findings.**
- The relational agent with self-attention blocks outperforms convolutional baselines in the Box-World task, solving more levels and showing better sample complexity.
- The relational agent achieves state-of-the-art performance on six StarCraft II mini-games, surpassing human grandmaster performance on four.
- Visualization of attention weights reveals interpretable relational computations, such as keys attending to the locks they can unlock.
- The relational agent demonstrates zero-shot generalization to longer solution paths and unseen key-lock combinations in Box-World.

---

### 2018 Q4  ·  2018-10-01 → 2018-12-31

#### 1. GAN Dissection: Visualizing and Understanding Generative Adversarial\n Networks

`2018-11-26` · **217** citations · _venue:_ arXiv

> **Research question.** How does a GAN represent our visual world internally? What causes artifacts in GAN results? How do architectural choices affect GAN learning?

**Core contribution.** The paper presents an analytic framework for visualizing and understanding GANs by identifying interpretable units that correspond to object concepts and measuring their causal effects through interventions.

**Key findings.**
- GANs learn interpretable units in their convolutional layers that correlate with object concepts as measured by IoU with semantic segmentations.
- These units have a causal effect on object generation, as shown by ablation and insertion interventions that remove or add objects.
- The framework can diagnose and improve GANs by locating and ablating artifact-causing units, significantly improving output quality.
- Contextual relationships between objects can be studied by inserting object units into different image locations, revealing how the GAN enforces compatibility.

_Target models:_ Progressive GANs, WGAN-GP

---

### 2019 Q1  ·  2019-01-01 → 2019-03-31

#### 1. Open Sesame: Getting inside BERT’s Linguistic Knowledge

`2019-01-01` · **243** citations · _venue:_ ACL Workshop

> **Research question.** How and to what extent does BERT encode syntactically-sensitive hierarchical information or positionally-sensitive linear information?

**Core contribution.** BERT encodes positional information in lower layers and switches to a hierarchically-oriented encoding on higher layers. The paper also introduces a 'confusion score' to quantify intrusion effects in BERT's self-attention mechanism.

**Key findings.**
- Diagnostic classifiers show BERT's lower layers encode positional information well, while higher layers encode hierarchical information.
- The proposed confusion score reveals BERT's attention is sensitive to syntactic structure and grammatical features (number, gender) in subject-verb agreement and reflexive anaphora.
- BERT's attention is not perfectly syntactic; it sometimes attends to grammatically inaccessible or mismatched distractors.
- Confusion scores decrease with layer depth, and there is an increase in confusion at layer 4, coinciding with the degradation of positional information.

_Target models:_ bert-base-uncased, bert-large-uncased

---

### 2020 Q3  ·  2020-07-01 → 2020-09-30

#### 1. Prevalence of neural collapse during the terminal phase of deep learning training

`2020-09-21` · **296** citations · _venue:_ Proceedings of the National Academy of Sciences

> **Research question.** What inductive bias emerges during the terminal phase of training (TPT) when training error is zero but loss is further minimized?

**Core contribution.** The paper identifies and characterizes Neural Collapse, a pervasive inductive bias during the terminal phase of training, where last-layer activations and classifiers converge to a simple, symmetric geometry (Simplex ETF), leading to improved generalization and robustness.

**Key findings.**
- Within-class variability of last-layer activations collapses to zero (NC1).
- Class means converge to the vertices of a Simplex Equiangular Tight Frame (ETF) (NC2).
- The linear classifiers converge to the class means, up to rescaling (self-duality) (NC3).
- The classifier's decision rule simplifies to the nearest class-center (NCC) rule (NC4).

_Target models:_ VGG, ResNet, DenseNet

---

### 2022 Q1  ·  2022-01-01 → 2022-03-31

#### 1. How Do Vision Transformers Work?

`2022-02-14` · **202** citations · _venue:_ ICLR

> **Research question.** How do multi-head self-attentions (MSAs) and Vision Transformers (ViTs) work? Specifically, what properties of MSAs improve optimization, how do MSAs differ from convolutional layers (Convs), and how can we harmonize MSAs with Convs?

**Core contribution.** The paper demonstrates that MSAs in Vision Transformers act as generalized spatial smoothing, flattening loss landscapes and improving generalization, and are complementary to convolutional layers as low-pass vs. high-pass filters. Based on these insights, the paper proposes AlterNet, a model that alternates Conv and MSA blocks, which outperforms CNNs even on small datasets.

**Key findings.**
- MSAs improve accuracy and generalization by flattening loss landscapes, primarily due to data specificity rather than long-range dependency.
- MSAs are low-pass filters that reduce high-frequency signals and aggregate feature maps, while Convs are high-pass filters that amplify high-frequency signals and diversify feature maps.
- ViTs suffer from non-convex losses in small data regimes, which can be alleviated by large datasets or loss landscape smoothing methods.
- Multi-stage neural networks behave like series connections of small individual models, and MSAs at the end of a stage play a key role in prediction.

_Target models:_ ViT, PiT, Swin, ResNet, AlterNet

---
