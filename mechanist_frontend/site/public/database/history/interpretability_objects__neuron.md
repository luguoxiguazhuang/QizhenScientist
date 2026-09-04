# Neuron

_A development timeline within **Interpretability Objects** — auto-generated_

## Background

Individual neurons are the smallest analyzable unit; work here spans polysemanticity, automated labeling, and neuron editing.

## At a glance

- **Papers connected to this node in the DB:** 917
- **Highlighted below (top by citation):** 13
- **Year span:** 2011 — 2019
- **Most-cited paper:** Intriguing properties of neural networks — 5704 citations

## Timeline

### 2011 Q4  ·  2011-10-01 → 2011-12-31

#### 1. Building high-level features using large scale unsupervised learning

`2011-12-29` · **179** citations · _venue:_ ICASSP

> **Research question.** Is it possible to learn high-level, class-specific feature detectors (e.g., face detectors) from only unlabeled data?

**Core contribution.** The paper demonstrates that it is possible to learn high-level class-specific feature detectors from only unlabeled data by scaling up the model and dataset, and that these features achieve state-of-the-art performance on ImageNet.

**Key findings.**
- A neuron selective for faces can be learned from unlabeled YouTube images, achieving 81.7% accuracy on a face detection test.
- The learned face detector is invariant to translation, scaling, and out-of-plane rotation.
- The network also learns detectors for cat faces and human bodies, with accuracies of 74.8% and 76.7% respectively.
- Using the learned features for supervised fine-tuning on ImageNet yields 15.8% accuracy on 22,000 categories, a 70% relative improvement over the previous state-of-the-art.

_Target models:_ 9-layered locally connected sparse autoencoder with pooling and local contrast normalization

---

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

### 2015 Q2  ·  2015-04-01 → 2015-06-30

#### 1. Understanding Neural Networks Through Deep Visualization

`2015-06-22` · **1469** citations · _venue:_ ICML

> **Research question.** How can we better understand the inner workings of deep neural networks, specifically convolutional neural networks, through improved visualization tools?

**Core contribution.** This paper introduces two open-source tools for visualizing and interpreting trained convolutional neural networks: an interactive tool for visualizing live activations across layers, and a regularized optimization method for generating clearer, more interpretable visualizations of the features learned by individual neurons.

**Key findings.**
- The interactive visualization tool reveals that representations in later convolutional layers can be surprisingly local, with individual channels corresponding to specific natural parts (e.g., faces, text) rather than being purely distributed.
- The newly introduced regularization methods (L2 decay, Gaussian blur, and two pixel clipping methods) combine to produce qualitatively clearer and more interpretable visualizations of learned features via gradient-based optimization.
- Visualizations from the regularized optimization suggest that discriminatively trained networks contain significant generative structure, implying their parameters encode more than just discriminative features.
- The tool shows that while lower convolutional layers are robust to small input changes, the final fully connected layers are surprisingly sensitive to minor variations, even when no object from the training set is present.

_Target models:_ AlexNet

---

### 2016 Q1  ·  2016-01-01 → 2016-03-31

#### 1. Multifaceted Feature Visualization: Uncovering the Different Types of Features Learned By Each Neuron in Deep Neural Networks

`2016-02-11` · **168** citations · _venue:_ arXiv

> **Research question.** How can we visualize the multiple different types of features (facets) that each neuron in a deep neural network responds to, given that neurons are multifaceted?

**Core contribution.** Introduces a Multifaceted Feature Visualization algorithm that uncovers the multiple facets of each neuron and improves activation maximization image quality with more natural colors and coherent global structure.

**Key findings.**
- Neurons in deep neural networks are multifaceted, responding to multiple types of features.
- Higher-level neurons are more multifaceted than lower-level neurons.
- The MFV algorithm produces visualizations with more natural colors and coherent global structure by separately synthesizing each facet.
- The algorithm reveals that DNNs learn global structure, details, and context of objects, acting more like generative models.

_Target models:_ CaffeNet (variant of AlexNet)

---

### 2016 Q2  ·  2016-04-01 → 2016-06-30

#### 1. Not Just a Black Box: Learning Important Features Through Propagating Activation Differences

`2016-05-05` · **547** citations · _venue:_ arXiv

> **Research question.** How to compute importance scores in neural networks by comparing neuron activations to their reference activations, addressing limitations of gradient-based methods?

**Core contribution.** Introduces DeepLIFT, a method for computing feature importance in neural networks by comparing neuron activations to reference activations, which handles cases where gradient-based methods fail due to vanishing gradients.

**Key findings.**
- DeepLIFT assigns importance scores by comparing activations to references, overcoming gradient zero issues.
- It successfully identifies DNA patterns in genomic data missed by gradient methods.
- It is equivalent to gradient*input and layer-wise relevance propagation under specific conditions.
- The method is efficient and implementable on GPU.

_Target models:_ VGG16, CNN

---

#### 2. Synthesizing the preferred inputs for neurons in neural networks via deep generator networks

`2016-05-30` · **256** citations · _venue:_ ICLR

> **Research question.** How can we synthesize more interpretable preferred inputs for neurons in deep neural networks to understand what they have learned? The paper proposes using a deep generator network as a learned prior for activation maximization.

**Core contribution.** Introduces DGN-AM, a method that uses a deep generator network as a learned prior for activation maximization, producing highly realistic and interpretable visualizations of neuron preferences.

**Key findings.**
- DGN-AM generates qualitatively state-of-the-art synthetic images that look almost real.
- The method reveals the features learned by each neuron in an interpretable way.
- The prior generalizes well to new datasets (e.g., MIT Places) and somewhat well to different network architectures.
- The visualizations reflect the features learned by neurons, not just the prior's preferences, as shown by experiments with modified images.

_Target models:_ CaffeNet, GoogleNet, ResNet, AlexNet

---

#### 3. Synthesizing the preferred inputs for neurons in neural networks via\n deep generator networks

`2016-05-30` · **193** citations · _venue:_ NeurIPS

> **Research question.** How can we synthesize interpretable preferred inputs for neurons in deep neural networks to understand what they have learned?

**Core contribution.** The paper introduces DGN-AM, a method that uses a deep generator network as a learned prior for activation maximization, producing state-of-the-art realistic synthetic images that reveal what neurons have learned.

**Key findings.**
- DGN-AM generates qualitatively state-of-the-art synthetic images that look almost real.
- It reveals the features learned by each neuron in an interpretable way.
- It generalizes well to new datasets and somewhat well to different network architectures without requiring the prior to be relearned.
- It can be considered as a high-quality generative method.

_Target models:_ CaffeNet, GoogleNet, ResNet, AlexNet, LRCN

---

### 2017 Q2  ·  2017-04-01 → 2017-06-30

#### 1. SVCCA: Singular Vector Canonical Correlation Analysis for Deep Learning Dynamics and Interpretability

`2017-06-19` · **226** citations · _venue:_ ICLR

> **Research question.** What is the intrinsic dimensionality of layers in neural networks and how do learning dynamics evolve during training?

**Core contribution.** Introduces SVCCA, a method for comparing neural network representations, and uses it to show that layers are over-parameterized, learning converges from bottom up, and proposes Freeze Training to save computation and improve generalization.

**Key findings.**
- The intrinsic dimensionality of a layer is often much smaller than the number of neurons, indicating over-parameterization.
- Learning dynamics show that networks converge from the bottom up, with lower layers solidifying before higher ones.
- SVCCA can capture semantic similarities between classes, with similar classes having similar sensitivity patterns in the network.
- Freeze Training, which sequentially freezes lower layers during training, can save computation and sometimes improve generalization.

_Target models:_ convolutional network, residual network (Resnet), four hidden layer fully connected network, LSTM

---

#### 2. SVCCA: Singular Vector Canonical Correlation Analysis for Deep Learning\n Dynamics and Interpretability

`2017-06-19` · **154** citations · _venue:_ NeurIPS

> **Research question.** What is the intrinsic dimensionality of neural network layers and how do learning dynamics progress during training?

**Core contribution.** Introduces SVCCA, a method for comparing neural network representations that is invariant to affine transforms, and uses it to show that layers have lower intrinsic dimensionality than the number of neurons, and that networks converge from the bottom up during training.

**Key findings.**
- The intrinsic dimensionality of a layer is less than the number of neurons, and projecting onto the top SVCCA directions preserves accuracy without retraining.
- Networks converge from the bottom up during training, with lower layers solidifying their representations earlier than higher layers.
- SVCCA captures semantic class information, with similar classes having similar sensitivities in the network.
- Freeze Training, based on the bottom-up convergence, can save computation and improve generalization by sequentially freezing lower layers during training.

_Target models:_ convolutional network, residual network (ResNet), Imagenet Resnet, four hidden layer fully connected network

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

#### 2. Interpretability Beyond Feature Attribution: Quantitative Testing with\n Concept Activation Vectors (TCAV)

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

### 2019 Q3  ·  2019-07-01 → 2019-09-30

#### 1. Knowledge Transfer via Distillation of Activation Boundaries Formed by Hidden Neurons

`2019-07-17` · **489** citations · _venue:_ AAAI

> **Research question.** Can transferring activation boundaries (whether neurons are activated or not), rather than the magnitude of neuron responses, improve knowledge transfer performance?

**Core contribution.** Proposes a knowledge transfer method that distills activation boundaries (neuron on/off states) from teacher to student networks, outperforming existing methods by focusing on boundary information rather than response magnitudes.

**Key findings.**
- The proposed method accelerates learning and improves generalization, especially with limited training data.
- It outperforms existing knowledge transfer methods (FITNET, FSP, AT, Jacobian) in various settings including learning speed, small data, and network compression.
- In transfer learning, the proposed method sometimes outperforms ImageNet pre-training.
- The method is effective across different network layers (low, mid, high).

_Target models:_ Wide Residual Networks (WRN), ResNet50, Mobilenet

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
