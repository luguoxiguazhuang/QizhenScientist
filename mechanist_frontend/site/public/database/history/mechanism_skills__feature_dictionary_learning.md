# Feature Dictionary Learning

_A development timeline within **Mechanism Methods** — auto-generated_

## Background

Feature Dictionary Learning decomposes activations into interpretable components via sparse dictionaries (SAEs, crosscoders), enabling monosemantic feature analysis at scale.

## At a glance

- **Papers connected to this node in the DB:** 589
- **Highlighted below (top by citation):** 4
- **Year span:** 2018 — 2023
- **Most-cited paper:** EEG-Based Emotion Classification Using a Deep Neural Network and Sparse Autoencoder — 246 citations

## Timeline

### 2018 Q1  ·  2018-01-01 → 2018-03-31

#### 1. Multi-Layer Convolutional Sparse Modeling: Pursuit and Dictionary Learning

`2018-01-01` · **123** citations · _venue:_ IEEE Transactions on Signal Processing

> **Research question.** The paper investigates how to project signals onto the Multi-Layer Convolutional Sparse Coding model, how to learn the dictionaries from real data, and how this model relates to convolutional neural networks and dictionary learning.

**Core contribution.** The paper proposes a projection-based pursuit algorithm for the Multi-Layer Convolutional Sparse Coding model with improved stability bounds, and an online dictionary learning algorithm to learn the convolutional filters from real data.

**Key findings.**
- The proposed projection approach for the ML-CSC model yields stability bounds that do not accumulate over layers, unlike previous layered pursuits.
- The ML-CSC model can be learned from real data using an online algorithm that enforces sparsity on both the representations and the filters.
- The learned model provides competitive results in unsupervised applications such as signal approximation and classification.
- The ML-CSC model bridges matrix factorization, sparse dictionary learning, and sparse auto-encoders.

_Target models:_ Multi-Layer Convolutional Sparse Coding (ML-CSC) model

---

### 2019 Q4  ·  2019-10-01 → 2019-12-31

#### 1. On Completeness-aware Concept-Based Explanations in Deep Neural Networks

`2019-10-17` · **50** citations · _venue:_ ICLR

> **Research question.** How to define and discover a set of concepts that are both sufficient (complete) in explaining a model's predictions and interpretable to humans?

**Core contribution.** The paper defines a completeness score for concept-based explanations and proposes a concept discovery method that optimizes for completeness and interpretability, as well as ConceptSHAP for quantifying concept importance.

**Key findings.**
- The proposed method outperforms baselines (ACE, PCA, k-means) in retrieving ground truth concepts on a synthetic dataset with known concepts.
- The method achieves higher completeness scores on both synthetic and real-world image and text datasets compared to baselines.
- User studies show that the discovered concepts are more interpretable and coherent than those from baseline methods.
- ConceptSHAP provides meaningful concept importance scores that align with human intuition.

_Target models:_ convolutional neural network (CNN), Inception-V3, 4-layer CNN

---

### 2020 Q3  ·  2020-07-01 → 2020-09-30

#### 1. EEG-Based Emotion Classification Using a Deep Neural Network and Sparse Autoencoder

`2020-09-02` · **246** citations · _venue:_ Frontiers in Systems Neuroscience

> **Research question.** How can a deep neural network combining Convolutional Neural Network (CNN), Sparse Autoencoder (SAE), and Deep Neural Network (DNN) improve emotion classification accuracy and convergence speed from EEG signals compared to conventional CNN methods?

**Core contribution.** The paper proposes a novel deep neural network architecture that combines CNN, SAE, and DNN for EEG-based emotion classification, demonstrating improved accuracy and faster convergence compared to conventional CNN methods.

**Key findings.**
- The proposed CNN-SAE-DNN network achieves 89.49% accuracy on valence and 92.86% on arousal for the DEAP dataset.
- For the SEED dataset, the best recognition accuracy reaches 96.77%.
- The proposed network converges faster than the conventional CNN during training.
- Pearson Correlation Coefficient (PCC)-based features yield the best performance among the tested features (PCC, PCA, SC).

_Target models:_ CNN-SAE-DNN, CNN

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
