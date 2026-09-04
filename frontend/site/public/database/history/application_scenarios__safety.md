# Safety

_A development timeline within **Application / Scenarios** — auto-generated_

## Background

Safety scenarios include refusal behavior, jailbreak vectors, harmful-direction identification, and unlearning.

## At a glance

- **Papers connected to this node in the DB:** 1080
- **Highlighted below (top by citation):** 17
- **Year span:** 2017 — 2023
- **Most-cited paper:** Adversarial Examples Are Not Bugs, They Are Features — 395 citations

## Timeline

### 2017 Q4  ·  2017-10-01 → 2017-12-31

#### 1. Improving the Adversarial Robustness and Interpretability of Deep Neural Networks by Regularizing their Input Gradients

`2017-11-26` · **280** citations · _venue:_ AAAI

> **Research question.** Does regularizing input gradients improve adversarial robustness and interpretability of deep neural networks?

**Core contribution.** Training neural networks with input gradient regularization improves their adversarial robustness and makes their input gradients more interpretable, linking interpretability and robustness.

**Key findings.**
- Gradient-regularized models are robust to transferred adversarial examples generated to fool other models.
- Adversarial examples generated to fool gradient-regularized models fool all other models equally well and are rated by humans as more interpretable misclassifications.
- Regularizing input gradients makes them more naturally interpretable as rationales for model predictions.
- Gradient regularization can be combined with adversarial training for even greater robustness.

_Target models:_ CNN (5x5x32 and 5x5x64 conv layers, 1024-unit FC)

---

### 2018 Q3  ·  2018-07-01 → 2018-09-30

#### 1. Structured Adversarial Attack: Towards General Implementation and Better Interpretability

`2018-08-05` · **103** citations · _venue:_ ICLR

> **Research question.** How can we design an adversarial attack that captures structural information in images through group-sparse perturbations, leading to better interpretability?

**Core contribution.** The paper proposes a structured adversarial attack (StrAttack) that imposes group sparsity on perturbations to capture spatial structures, leading to better interpretability while maintaining attack success and distortion levels comparable to state-of-the-art attacks.

**Key findings.**
- StrAttack achieves strong group sparsity in adversarial perturbations with comparable ℓp distortion to state-of-the-art attacks.
- StrAttack perturbs fewer pixels (smaller ℓ0 norm) while maintaining similar ℓ1, ℓ2, ℓ∞ distortion.
- StrAttack provides better interpretability through higher interpretability scores with adversarial saliency map and class activation map.
- StrAttack has good transferability across different network architectures.

_Target models:_ Inception V3, Inception V2, Inception V4, ResNet 50, ResNet 152, DenseNet 121

---

### 2018 Q4  ·  2018-10-01 → 2018-12-31

#### 1. Shallow-Deep Networks: Understanding and Mitigating Network Overthinking

`2018-10-16` · **101** citations · _venue:_ arXiv

> **Research question.** This paper investigates whether deep neural networks are susceptible to overthinking, which occurs when a DNN can reach correct predictions before its final layer, leading to wasteful computation and destructive misclassifications.

**Core contribution.** The paper introduces Shallow-Deep Networks (SDNs), a modification to off-the-shelf DNNs that introduces internal classifiers, to expose and mitigate the overthinking problem, reducing inference cost and improving accuracy.

**Key findings.**
- Overthinking is prevalent in CNNs, leading to wasteful computation on the majority of inputs.
- Overthinking can be destructive, causing correct internal predictions to turn into misclassifications in up to 50% of errors.
- SDNs with confidence-based early exits can reduce average inference cost by more than 50% while preserving accuracy.
- Early exits can mitigate backdoor attacks, recovering accuracy from 12% to 84% on malicious inputs.

_Target models:_ VGG-16, ResNet-56, WRN-32-4, MobileNet

---

#### 2. Attacks Meet Interpretability: Attribute-steered Detection of Adversarial Samples

`2018-10-27` · **52** citations · _venue:_ View

> **Research question.** How can interpretability of deep neural networks be leveraged to detect adversarial samples in face recognition models?

**Core contribution.** Proposes a novel adversarial sample detection technique for face recognition models based on interpretability, using bi-directional correspondence inference between face attributes and internal neurons, attribute-level mutation, and neuron strengthening/weakening.

**Key findings.**
- AmI achieves 94% detection accuracy for 7 different adversarial attacks with 9.91% false positives on benign inputs, outperforming the feature squeezing technique (55% accuracy, 23.3% false positives).
- Bi-directional reasoning (attribute substitution and preservation) is critical for extracting high-quality attribute witnesses and achieving low false positive rates.
- The technique is robust to the exclusion of witnesses for specific attributes, with detection accuracy degrading by less than 5% in most cases.
- Neuron strengthening and weakening together improve detection accuracy compared to using only one of them.

_Target models:_ VGG-Face

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

#### 2. Fooling Neural Network Interpretations via Adversarial Model Manipulation

`2019-02-06` · **73** citations · _venue:_ NeurIPS

> **Research question.** Can neural network interpretation methods be fooled via adversarial model manipulation that alters explanations without hurting accuracy?

**Core contribution.** The paper shows that saliency map based interpretation methods can be easily fooled by adversarial model manipulation without significant accuracy drop, and proposes Passive and Active fooling methods.

**Key findings.**
- Saliency map based interpreters (LRP, Grad-CAM, SimpleGradient) are vulnerable to adversarial model manipulation with accuracy drops around 2% and 1% for Top-1 and Top-5 accuracy.
- The fooled explanations generalize to the entire validation set, not just specific inputs.
- Fooling one interpretation method can transfer to other interpretation methods.
- The model's actual reasoning for prediction is not significantly altered, as shown by AOPC curves.

_Target models:_ VGG19, ResNet50, DenseNet121

---

### 2019 Q2  ·  2019-04-01 → 2019-06-30

#### 1. Adversarial Examples Are Not Bugs, They Are Features

`2019-05-06` · **395** citations · _venue:_ ICLR

> **Research question.** Why do adversarial examples exist and are pervasive? The paper investigates whether adversarial examples can be attributed to non-robust features in the data.

**Core contribution.** Adversarial examples are shown to arise from non-robust features: predictive but brittle features in the data. The paper demonstrates that these features exist in standard datasets and that models' reliance on them leads to adversarial vulnerability.

**Key findings.**
- Non-robust features exist in standard datasets and are highly predictive for classification.
- Removing non-robust features from a dataset allows training a robust classifier with standard training.
- Training on a dataset consisting only of non-robust features (with seemingly incorrect labels) yields good standard accuracy, showing non-robust features suffice for generalization.
- Adversarial transferability occurs because different models learn similar non-robust features.

_Target models:_ ResNet-50, VGG-16, Inception-v3, ResNet-18, DenseNet

---

### 2019 Q3  ·  2019-07-01 → 2019-09-30

#### 1. RecurJac: An Efficient Recursive Algorithm for Bounding Jacobian Matrix of Neural Networks and Its Applications

`2019-07-17` · **44** citations · _venue:_ AAAI

> **Research question.** How to efficiently compute upper and lower bounds for each element in the Jacobian matrix of a neural network with respect to its input, which is related to properties like Lipschitz constants and robustness.

**Core contribution.** The paper introduces RecurJac, a recursive algorithm for efficiently computing certified upper and lower bounds for the Jacobian matrix of neural networks with a wide range of activation functions, leading to tighter Lipschitz constants and improved robustness verification.

**Key findings.**
- RecurJac produces local Lipschitz constants that are up to two magnitudes smaller (tighter) than previous state-of-the-art algorithms like Fast-Lip.
- The algorithm can be applied to networks with various activation functions, including ReLU, leaky-ReLU, tanh, and sigmoid-family functions.
- RecurJac can characterize the local optimization landscape by determining regions without stationary points, with the radius of such regions decreasing as network depth increases.
- The method provides better certified robustness lower bounds for adversarial examples compared to Fast-Lip, especially on adversarially trained models.

---

### 2019 Q4  ·  2019-10-01 → 2019-12-31

#### 1. NeuronInspect: Detecting Backdoors in Neural Networks via Output Explanations

`2019-11-18` · **65** citations · _venue:_ arXiv

> **Research question.** How can trojan backdoors in deep neural networks be detected without access to backdoor samples and without restoring the trigger pattern?

**Core contribution.** Proposes NeuronInspect, a framework that detects trojan backdoors in DNNs by analyzing output explanation heatmaps (saliency maps) on clean samples, extracting features (sparseness, smoothness, persistence), and using outlier detection, without needing backdoor samples or trigger restoration.

**Key findings.**
- NeuronInspect successfully detects backdoors with varying trigger sizes, locations, and patterns on MNIST and GTSRB datasets.
- NeuronInspect significantly outperforms Neural Cleanse in terms of robustness and efficiency (running time).
- NeuronInspect can detect multiple triggers and translucent triggers where Neural Cleanse fails.
- The combined features (sparseness, smoothness, persistence) are effective for detection, with persistence measured via thresholding and XOR being particularly important.

_Target models:_ CNN

---

### 2020 Q1  ·  2020-01-01 → 2020-03-31

#### 1. One Explanation Does Not Fit All

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

#### 2. Neuron Shapley: Discovering the Responsible Neurons

`2020-02-23` · **61** citations · _venue:_ NeurIPS

> **Research question.** How can we quantify the contribution of individual neurons to the prediction and performance of a deep network, accounting for interactions across neurons?

**Core contribution.** Introduces Neuron Shapley, a framework to quantify individual neuron contributions to network performance, and an efficient algorithm (TMAB-Shapley) to compute it, enabling model interpretation and repair.

**Key findings.**
- Removing a small number of neurons with high Shapley values drastically reduces model accuracy.
- Neuron Shapley can identify neurons responsible for biased predictions, and zeroing them improves fairness without retraining.
- Neuron Shapley identifies neurons vulnerable to adversarial attacks; removing them reduces attack success.
- The TMAB-Shapley algorithm efficiently computes Shapley values, requiring orders of magnitude fewer samples.

_Target models:_ Inception-v3, SqueezeNet

---

### 2020 Q2  ·  2020-04-01 → 2020-06-30

#### 1. ML-LOO: Detecting Adversarial Examples with Feature Attribution

`2020-04-03` · **88** citations · _venue:_ AAAI

> **Research question.** How can we detect adversarial examples using feature attribution? The paper investigates the difference in feature attributions between original and adversarial examples and proposes a detection method based on thresholding dispersion measures of attribution scores.

**Core contribution.** The paper introduces a new framework to detect adversarial examples with multi-layer feature attribution, by capturing the scaling difference of feature attribution scores between the original and adversarial examples.

**Key findings.**
- The method achieves superior performance in distinguishing adversarial examples from popular attack methods on a variety of real data sets compared to state-of-the-art detection methods.
- The method is able to detect adversarial examples of mixed confidence levels.
- The method transfers between different attacking methods.
- The method achieves competitive performance even when the attacker has complete access to the detector.

_Target models:_ CNN, ResNet, DenseNet

---

### 2020 Q4  ·  2020-10-01 → 2020-12-31

#### 1. Interpreting and Improving Adversarial Robustness of Deep Neural Networks With Neuron Sensitivity

`2020-12-09` · **96** citations · _venue:_ IEEE Transactions on Image Processing

> **Research question.** How does neuron sensitivity relate to adversarial robustness, and can stabilizing sensitive neurons improve model robustness against adversarial examples?

**Core contribution.** Introduces neuron sensitivity as a measure for adversarial robustness and proposes the Sensitive Neuron Stabilizing (SNS) method to improve robustness by stabilizing the behaviors of sensitive neurons.

**Key findings.**
- Sensitive neurons (those with high behavior variation between benign and adversarial examples) make the most non-trivial contributions to model misclassification in adversarial settings.
- State-of-the-art adversarial training methods improve model robustness by reducing neuron sensitivities.
- Stabilizing sensitive neurons via the proposed SNS method effectively improves adversarial robustness across various datasets and attack methods.
- There exists a trade-off between robustness and accuracy, and sensitive neurons are responsible for both clean accuracy and robustness.

_Target models:_ VGG-16, Inception-V3, ResNet-18

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

#### 2. A Study of the Attention Abnormality in Trojaned BERTs

`2022-01-01` · **45** citations · _venue:_ NAACL

> **Research question.** Through what mechanism does a Trojan attack affect an NLP model?

**Core contribution.** The paper studies attention abnormality in Trojaned BERTs, observes attention focus drifting behavior, and proposes an attention-based Trojan detector (AttenTD) that outperforms existing methods.

**Key findings.**
- Trojaned BERT models exhibit attention focus drifting behavior where trigger tokens hijack attention in certain heads.
- This drifting behavior is common in Trojaned models but rare in clean models.
- Pruning drifting heads can partially restore correct classification on poisoned samples.
- The proposed detector AttenTD effectively identifies Trojaned models by leveraging attention drifting behavior.

_Target models:_ BERT

---

### 2023 Q2  ·  2023-04-01 → 2023-06-30

#### 1. Food fraud detection using explainable artificial intelligence

`2023-06-25` · **67** citations · _venue:_ Expert Systems

> **Research question.** How can explainable artificial intelligence tools be used to interpret the predictions of a deep learning model for food fraud detection?

**Core contribution.** The paper demonstrates the application of XAI tools to interpret a deep learning model for food fraud detection, highlighting that the data source feature has the greatest impact on predictions and evaluating the features and shortcomings of XAI tools in this domain.

**Key findings.**
- The data source feature (EMA and RASFF) has the greatest impact on the model's prediction of food fraud types.
- XAI tools like LIME, SHAP, and WIT provide local and global insights into model behavior and feature contributions.
- The deep learning model achieved an accuracy of 81.4% in classifying food fraud types.
- Different XAI tools have varying strengths in execution speed, explanation style (global vs. local), and usability.

_Target models:_ Deep Neural Network (DNN)

---

### 2023 Q4  ·  2023-10-01 → 2023-12-31

#### 1. Its Alive: AI Independence Without Human Prompting

`2023-10-02` · **59** citations · _venue:_ arXiv

> **Research question.** How can representation engineering (RepE) improve transparency and control of AI systems, particularly for safety-relevant concepts?

**Core contribution.** Introduces representation engineering (RepE) as a top-down approach to AI transparency, providing baselines like Linear Artificial Tomography (LAT) and demonstrating its applicability to reading and controlling safety-relevant concepts in large language models.

**Key findings.**
- RepE methods can extract representations of high-level concepts like honesty, utility, emotion, and harmfulness.
- LAT achieves state-of-the-art on TruthfulQA, improving zero-shot accuracy by 18.1 percentage points.
- Representation control can increase model honesty and reduce compliance with harmful instructions, even under jailbreak attempts.
- Emotions are represented in LLMs and can be manipulated to affect model compliance and behavior.

_Target models:_ LLaMA-2-Chat (7B), LLaMA-2-Chat (13B), LLaMA-2-Chat (70B), Vicuna-13B

---
