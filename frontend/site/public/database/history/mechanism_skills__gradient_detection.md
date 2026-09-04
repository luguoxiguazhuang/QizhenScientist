# Gradient Detection

_A development timeline within **Mechanism Methods** — auto-generated_

## Background

Gradient Detection interprets predictions by tracing derivatives backwards — saliency maps, Integrated Gradients, Influence Functions.

## At a glance

- **Papers connected to this node in the DB:** 1493
- **Highlighted below (top by citation):** 11
- **Year span:** 2013 — 2019
- **Most-cited paper:** Grad-CAM: Visual Explanations from Deep Networks via Gradient-Based Localization — 5081 citations

## Timeline

### 2013 Q4  ·  2013-10-01 → 2013-12-31

#### 1. Deep Inside Convolutional Networks: Visualising Image Classification\n Models and Saliency Maps

`2013-12-20` · **4893** citations · _venue:_ ICLR

> **Research question.** How can we visualize the class models learned by deep Convolutional Networks and compute image-specific class saliency maps?

**Core contribution.** This paper presents two gradient-based visualization techniques for deep convolutional networks: generating an image that maximizes a class score to visualize the class concept, and computing image-specific class saliency maps that highlight discriminative regions for a given class.

**Key findings.**
- The method can generate images that represent the visual concept of a class as learned by a ConvNet.
- Class saliency maps, computed via a single back-propagation pass, highlight image regions most relevant to a class prediction.
- These saliency maps can be used for weakly supervised object localization, achieving 46.4% top-5 error on ILSVRC-2013 without object-level annotations.
- Gradient-based visualization generalizes the deconvolutional network (DeconvNet) reconstruction procedure.

_Target models:_ ConvNet (conv64-conv256-conv256-conv256-conv256-full4096-full4096-full1000)

---

#### 2. Deep Inside Convolutional Networks: Visualising Image Classification Models and Saliency Maps

`2013-12-20` · **893** citations · _venue:_ ICLR

> **Research question.** How can we visualize the class models learned by deep convolutional networks and compute image-specific class saliency maps?

**Core contribution.** This paper introduces two gradient-based visualization techniques for deep convolutional networks: generating an image that maximizes a class score to visualize the class concept, and computing an image-specific class saliency map via back-propagation, which can be used for weakly supervised object segmentation. It also establishes a connection between these gradient-based methods and deconvolutional networks.

**Key findings.**
- The method can generate representative images for a class by numerically optimizing the input to maximize the class score.
- Class saliency maps, computed via a single back-propagation pass, highlight discriminative image regions for a given class.
- These saliency maps enable weakly supervised object localization, achieving 46.4% top-5 error on ILSVRC-2013 without object-level annotations.
- The gradient-based visualization techniques generalize the deconvolutional network reconstruction procedure.

_Target models:_ ConvNet (similar to Krizhevsky et al.)

---

### 2016 Q4  ·  2016-10-01 → 2016-12-31

#### 1. Explaining nonlinear classification decisions with deep Taylor decomposition

`2016-11-30` · **1354** citations · _venue:_ Pattern Recognition

> **Research question.** How can we explain the classification decisions of deep neural networks by decomposing the output into input contributions? The paper aims to reconcile functional and rule-based approaches via deep Taylor decomposition.

**Core contribution.** Introduces deep Taylor decomposition, a method to explain neural network decisions by decomposing the output into input contributions, reconciling functional and rule-based approaches.

**Key findings.**
- Deep Taylor decomposition yields propagation rules similar to heuristically chosen rules in prior work but with theoretically justified parameters.
- The method produces consistent heatmaps (conservative and positive) for various network architectures.
- Experiments on MNIST and ILSVRC show that deep Taylor decomposition effectively identifies relevant pixels for classification.
- The method can be applied to large GPU-trained networks without retraining.

_Target models:_ BVLC CaffeNet, GoogleNet

---

### 2017 Q1  ·  2017-01-01 → 2017-03-31

#### 1. Axiomatic Attribution for Deep Networks

`2017-03-04` · **2623** citations · _venue:_ ICML

> **Research question.** How to attribute the prediction of a deep network to its input features in a way that satisfies fundamental axioms like Sensitivity and Implementation Invariance.

**Core contribution.** Introduces Integrated Gradients, an attribution method for deep networks that satisfies Sensitivity and Implementation Invariance axioms, is simple to implement using gradients, and can be applied to various network architectures for debugging and rule extraction.

**Key findings.**
- Integrated Gradients satisfies Sensitivity and Implementation Invariance axioms, which are not satisfied by many prior attribution methods.
- Integrated Gradients is the unique path method that is symmetry-preserving.
- The method can be applied to image, text, and chemistry models for debugging and extracting rules.
- Applied to a chemistry model, it helped identify degenerate features where atoms with the same type and bond counts were treated identically due to an architectural issue.

_Target models:_ GoogleNet, Diabetic retinopathy prediction network, Text categorization network, LSTM-based Neural Machine Translation System, Molecular graph convolution network (W2N2), W1N2

---

#### 2. Understanding the Effective Receptive Field in Deep Convolutional Neural\n Networks

`2017-01-15` · **823** citations · _venue:_ NeurIPS

> **Research question.** What are the characteristics of the receptive fields of units in deep convolutional neural networks, specifically the effective receptive field, and how does it differ from the theoretical receptive field?

**Core contribution.** This paper introduces the concept of the effective receptive field (ERF) in deep CNNs, proves it has a Gaussian distribution and is only a fraction of the full theoretical receptive field, and analyzes how architectural choices and training affect it.

**Key findings.**
- The distribution of impact within a receptive field is asymptotically Gaussian.
- The effective receptive field grows with O(√n) relative to the number of layers n, while the theoretical receptive field grows linearly, meaning the ERF shrinks relative to the theoretical field.
- Nonlinear activations like ReLU make the ERF distribution less Gaussian, while sigmoid and tanh are more linear near initialization.
- Subsampling and dilated convolution significantly increase the ERF size, while skip-connections make it smaller.

_Target models:_ deep convolutional neural networks (CNNs), ResNet (17 residual blocks), ResNet (16 residual blocks)

---

#### 3. Understanding the Effective Receptive Field in Deep Convolutional Neural Networks

`2017-01-15` · **805** citations · _venue:_ ICLR

> **Research question.** What is the distribution of impact within the receptive field of units in deep convolutional neural networks, and how does the effective receptive field compare to the theoretical receptive field?

**Core contribution.** Introduces the concept of effective receptive field (ERF) in deep CNNs, showing it has a Gaussian distribution and occupies only a fraction of the theoretical receptive field, growing as O(sqrt(n)) with depth, and observes that ERF increases during training.

**Key findings.**
- The effective receptive field (ERF) in deep CNNs has a Gaussian distribution.
- The ERF only occupies a fraction of the full theoretical receptive field.
- The ERF size grows as O(sqrt(n)) with depth, while the theoretical receptive field grows linearly, so relative ERF shrinks as O(1/sqrt(n)).
- Subsampling and dilated convolution increase the ERF size, while skip connections make it smaller.

_Target models:_ ResNet

---

### 2017 Q2  ·  2017-04-01 → 2017-06-30

#### 1. SmoothGrad: removing noise by adding noise

`2017-06-12` · **754** citations · _venue:_ arXiv

> **Research question.** How can visual noise in gradient-based sensitivity maps be reduced? The paper investigates whether adding noise to inputs and averaging can sharpen these maps.

**Core contribution.** Introduces SmoothGrad, a method to reduce noise in gradient-based sensitivity maps by averaging over noisy inputs, and shows that training with noise also improves map sharpness.

**Key findings.**
- SmoothGrad reduces visual noise in sensitivity maps, making them more coherent.
- SmoothGrad can be combined with other gradient-based methods like Integrated Gradients and Guided BackProp.
- Adding noise during training has a de-noising effect on sensitivity maps.
- The effects of training with noise and inferring with noise are additive.

_Target models:_ Inception v3, convolutional MNIST model

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

### 2018 Q1  ·  2018-01-01 → 2018-03-31

#### 1. Grad-CAM++: Generalized Gradient-Based Visual Explanations for Deep Convolutional Networks

`2018-03-01` · **2835** citations · _venue:_ IEEE Workshop/Winter Conference on Applications of Computer Vision

> **Research question.** How to provide better visual explanations for CNN model predictions, improving object localization and handling multiple object instances in a single image?

**Core contribution.** Introduces Grad-CAM++, a gradient-based visualization method that improves object localization and handling of multiple object instances in CNN explanations.

**Key findings.**
- Grad-CAM++ provides better visual explanations than Grad-CAM, as measured by proposed metrics like Average drop %, % increase in confidence, and Win %.
- Grad-CAM++ improves weakly supervised localization of object classes in images.
- Grad-CAM++ can be used for knowledge distillation to improve student network performance.
- Grad-CAM++ works for tasks beyond classification, such as image captioning and 3D action recognition.

_Target models:_ VGG-16, AlexNet, ResNet-50, WRN-40-2, WRN-16-2

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
