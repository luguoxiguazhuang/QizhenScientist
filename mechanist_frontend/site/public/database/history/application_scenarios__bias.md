# Bias

_A development timeline within **Application / Scenarios** — auto-generated_

## Background

Bias scenarios study how demographic and social biases are represented and mitigated inside models.

## At a glance

- **Papers connected to this node in the DB:** 585
- **Highlighted below (top by citation):** 9
- **Year span:** 2017 — 2023
- **Most-cited paper:** Grad-CAM: Visual Explanations from Deep Networks via Gradient-Based Localization — 5081 citations

## Timeline

### 2017 Q4  ·  2017-10-01 → 2017-12-31

#### 1. Interpretability Beyond Feature Attribution: Quantitative Testing with\n Concept Activation Vectors (TCAV)

`2017-11-30` · **732** citations · _venue:_ ICML

> **Research question.** How can we interpret neural networks using human-defined concepts and quantify the sensitivity of predictions to these concepts?

**Core contribution.** Introduces Concept Activation Vectors (CAVs) to represent human-friendly concepts in a model's activation space, and a method (TCAV) to quantify the importance of these concepts to model predictions using directional derivatives.

**Key findings.**
- CAVs align with intended concepts, validated by sorting images and activation maximization (deep dream).
- TCAV can reveal biases in models, such as gender and race biases in image classifiers.
- TCAV quantifies the importance of specific concepts to model classes (e.g., stripes for zebras, red for fire engines).
- TCAV can help interpret model errors in medical applications, such as diabetic retinopathy grading.

_Target models:_ GoogleNet, Inception V3

---

### 2018 Q2  ·  2018-04-01 → 2018-06-30

#### 1. Examining CNN Representations With Respect to Dataset Bias

`2018-04-29` · **98** citations · _venue:_ AAAI

> **Research question.** How to diagnose representation flaws in a pre-trained CNN caused by dataset bias, without using any testing samples?

**Core contribution.** Proposes a method to discover biased representations in a pre-trained CNN without testing samples by mining attribute relationships from internal inference patterns and comparing them to ground-truth relationships.

**Key findings.**
- The method can identify attributes with biased representations even when the CNN achieves high accuracy on potentially biased testing samples.
- The level of representation bias is not necessarily proportional to the level of dataset bias in the training data.
- The method can discover both blind spots (where the CNN fails to encode expected relationships) and failure modes (where the CNN encodes incorrect relationships).
- The method is more effective at discovering failure modes than a baseline method based on the entropy of annotation distributions.

_Target models:_ AlexNet

---

### 2019 Q1  ·  2019-01-01 → 2019-03-31

#### 1. Incorporating Priors with Feature Attribution on Text Classification

`2019-01-01` · **90** citations · _venue:_ ACL

> **Research question.** How can feature attribution methods be integrated into the objective function to allow machine learning practitioners to incorporate priors in model building, specifically to mitigate unintended bias and improve performance in scarce data settings?

**Core contribution.** The paper introduces a method to incorporate human priors into model training by adding an L2 distance loss between feature attributions (from Integrated Gradients) and target attribution values to the objective function, which can mitigate bias and improve performance in data-scarce settings without sacrificing original task performance.

**Key findings.**
- Classifiers trained with the proposed technique reduce undesired model biases without a tradeoff on the original task.
- Incorporating priors helps model performance in scarce data settings by forcing the model to focus on relevant terms.
- The method produces less biased word embeddings as a by-product.
- The technique can be applied as a fine-tuning step to debias an already-trained classifier.

_Target models:_ CNN

---

### 2019 Q4  ·  2019-10-01 → 2019-12-31

#### 1. Grad-CAM: Visual Explanations from Deep Networks via Gradient-Based Localization

`2019-10-11` · **5081** citations · _venue:_ International Journal of Computer Vision

> **Research question.** How can we produce visual explanations for decisions from a large class of CNN-based models to make them more transparent and explainable?

**Core contribution.** Introduces Grad-CAM, a technique that uses gradients flowing into the final convolutional layer to produce coarse localization maps highlighting important image regions for a prediction, applicable to a wide variety of CNN model families without architectural changes or re-training.

**Key findings.**
- Grad-CAM produces class-discriminative localization maps that generalize the earlier CAM approach to a broader range of CNN architectures.
- Grad-CAM visualizations help diagnose model failure modes, showing that seemingly unreasonable predictions have reasonable explanations.
- Grad-CAM is robust to adversarial perturbations and can identify dataset biases, aiding in model generalization and fairness.
- Human studies show that Grad-CAM explanations help users establish appropriate trust in predictions and discern a stronger network from a weaker one.

_Target models:_ VGG-16, AlexNet, GoogleNet, ResNet-18, ResNet-200, VGG-19

---

### 2020 Q1  ·  2020-01-01 → 2020-03-31

#### 1. exBERT: A Visual Analysis Tool to Explore Learned Representations in Transformer Models

`2020-01-01` · **148** citations · _venue:_ ACL

> **Research question.** How can we develop an interactive tool to explore learned representations and attentions in Transformer models?

**Core contribution.** The paper introduces EXBERT, an interactive visualization tool for exploring learned representations and attentions in Transformer models, enabling hypothesis formulation and replication of prior analyses.

**Key findings.**
- EXBERT can replicate prior findings on BERT's attention heads learning linguistic dependencies such as AUX and POBJ.
- BERT's embeddings encode linguistic information progressively across layers, with verbs becoming more prominent in later layers.
- EXBERT detects gender bias in GPT-2 by showing that it predicts gendered pronouns based on stereotypical associations.
- GPT-2's attention heads learn syntactic structures like AUX and DOBJ dependencies, similar to BERT.

_Target models:_ BERT, GPT-2

---

#### 2. One Explanation Does Not Fit All

`2020-02-04` · **144** citations · _venue:_ KI - Künstliche Intelligenz

> **Research question.** How can interactive explanations, particularly through personalizing counterfactual explanations, improve the transparency of black-box machine learning systems?

**Core contribution.** The paper proposes an architecture for interactive explainability systems that allows personalization of counterfactual explanations through dialogue, improving transparency of black-box ML models.

**Key findings.**
- Interactive explanations can be personalized to improve transparency and user satisfaction.
- Personalization can be achieved by allowing users to adjust conditional statements in counterfactual explanations.
- Building interactive explainers requires careful consideration of desiderata such as breadth, scope, context, purpose, and target.
- There are risks in allowing users to manipulate explanations, such as model stealing or gaming.

_Target models:_ decision tree

---

#### 3. Interpreting Pretrained Contextualized Representations via Reductions to Static Embeddings

`2020-01-01` · **135** citations · _venue:_ ACL

> **Research question.** Can we convert pretrained contextualized representations to static embeddings to leverage mature static embedding interpretability methods, and what do we learn about representational quality and social bias through this process?

**Core contribution.** The paper introduces simple, general methods for converting contextualized representations to static embeddings, enabling the use of static embedding interpretability methods. Analysis reveals that pooling over many contexts improves representational quality and that social bias is encoded disparately across models and layers.

**Key findings.**
- Pooling over many contexts (aggregated strategy) significantly improves the representational quality of static embeddings derived from contextualized models.
- The best-performing layer for static embeddings shifts to later layers as the number of contexts increases.
- Static embeddings derived from contextualized models can outperform traditional static embeddings like Word2Vec and GloVe on word similarity tasks.
- Social bias is encoded disparately across different pretrained models and across different layers of the same model.

_Target models:_ BERT, GPT-2, XLNet, RoBERTa, DistilBERT

---

### 2023 Q2  ·  2023-04-01 → 2023-06-30

#### 1. A Note on Normalized Emergence Timing (in Pythia Language Model Evaluations)

`2023-04-03` · **163** citations · _venue:_ ICML

> **Research question.** How do large language models (LLMs) develop and evolve over the course of training? How do these patterns change as models scale?

**Core contribution.** Introduces Pythia, a suite of 16 LLMs trained on public data in the same order with 154 checkpoints each, and provides tools to reconstruct exact training dataloaders, enabling controlled studies on training dynamics and scaling.

**Key findings.**
- Gender bias can be reduced by swapping pronouns in the last portion of training, with larger models showing greater reduction.
- Memorization follows a Poisson point process and is not influenced by the location of a sequence in the training data.
- The impact of pretraining term frequencies on few-shot performance emerges after a phase change at 65,000 steps for models with 2.8B parameters or more.

_Target models:_ Pythia-70M, Pythia-160M, Pythia-410M, Pythia-1B, Pythia-1.4B, Pythia-2.8B

---
