# Causal Attribution

_A development timeline within **Mechanism Methods** — auto-generated_

## Background

Causal Attribution uses interventions — activation patching, ablation, steering — to establish causal links between internal components and downstream behavior.

## At a glance

- **Papers connected to this node in the DB:** 2541
- **Highlighted below (top by citation):** 19
- **Year span:** 2013 — 2022
- **Most-cited paper:** Methods for interpreting and understanding deep neural networks — 2610 citations

## Timeline

### 2013 Q4  ·  2013-10-01 → 2013-12-31

#### 1. Visualizing and Understanding Convolutional Networks

`2013-11-12` · **447** citations · _venue:_ ECCV

> **Research question.** Why do large convolutional network models perform so well on image classification, and how can they be improved?

**Core contribution.** Introduces a novel visualization technique using a deconvnet to understand intermediate feature layers in convolutional networks, which is used to diagnose and improve model architecture, achieving state-of-the-art performance on ImageNet and demonstrating strong feature generalization to other datasets.

**Key findings.**
- Feature visualizations reveal hierarchical, increasingly invariant, and class-discriminative representations in higher layers.
- Visualization diagnostics led to architectural changes (smaller filters, reduced stride) that improved ImageNet classification performance.
- Occlusion experiments show the model's classification is sensitive to local object structure, not just global scene context.
- Features from an ImageNet-trained convnet generalize well to other datasets (Caltech-101, Caltech-256) with only the softmax classifier retrained.

_Target models:_ Krizhevsky et al. (2012) model, Our convnet model (Fig. 3)

---

### 2016 Q2  ·  2016-04-01 → 2016-06-30

#### 1. Residual Networks Behave Like Ensembles of Relatively Shallow Networks

`2016-05-20` · **600** citations · _venue:_ NeurIPS

> **Research question.** What is the reason behind residual networks' increased performance? Specifically, are the paths in residual networks dependent on each other, do they behave like an ensemble, and do paths of varying lengths impact the network differently?

**Core contribution.** Residual networks can be viewed as ensembles of many paths, with only the relatively short paths contributing gradient during training, which helps avoid the vanishing gradient problem and enables training very deep networks.

**Key findings.**
- Residual networks can be represented as a collection of many paths (the unraveled view), with the number of paths growing exponentially with depth.
- Paths in residual networks do not strongly depend on each other; removing or reordering layers has a smooth, ensemble-like effect on performance.
- The gradient during training in a 110-layer residual network comes predominantly from paths only 10-34 layers deep; longer paths contribute negligible gradient.
- Deleting individual layers from a residual network has minimal impact on performance, unlike in traditional sequential networks like VGG where it causes catastrophic failure.

_Target models:_ Residual Network (110 layers), Residual Network (200 layers), VGG network (15 layers)

---

### 2016 Q4  ·  2016-10-01 → 2016-12-31

#### 1. Understanding Neural Networks through Representation Erasure

`2016-12-24` · **461** citations · _venue:_ arXiv

> **Research question.** How can we interpret neural network decisions by analyzing the effects of erasing various parts of the representation, such as input word-vector dimensions, intermediate hidden units, or input words?

**Core contribution.** The paper proposes a general methodology for interpreting neural network decisions by erasing parts of the representation and analyzing the effects, which provides explanations for model behavior and enables error analysis.

**Key findings.**
- The method identifies important word-vector dimensions for linguistic feature classification and shows how importance distributes across dimensions and layers.
- In sentiment analysis, LSTM-based models are more sensitive to sentiment-indicative words than standard RNNs.
- The method can identify words that confuse the model (negative importance) and reveal common failure patterns, such as sentiment words used in non-standard contexts.
- A reinforcement learning approach can find minimal sets of words to erase to change model decisions, providing aspect-specific rationales.

_Target models:_ four-layer neural model, standard RNN, Uni-LSTM, Bi-LSTM, memory-network model

---

### 2017 Q2  ·  2017-04-01 → 2017-06-30

#### 1. Learning to Generate Reviews and Discovering Sentiment

`2017-04-05` · **350** citations · _venue:_ arXiv

> **Research question.** Does unsupervised language modeling on a large, domain-specific corpus learn high-level, disentangled features, such as a unit corresponding to sentiment?

**Core contribution.** Training a byte-level recurrent language model on a large corpus of reviews leads to the unsupervised discovery of a single, interpretable unit that encodes sentiment, enabling state-of-the-art sentiment analysis and controllable text generation.

**Key findings.**
- A single unit in the mLSTM's cell state strongly correlates with sentiment, achieving high accuracy on sentiment classification tasks.
- The learned representation is highly data-efficient, matching strong supervised baselines with only a handful of labeled examples.
- Fixing the value of the sentiment unit to positive or negative directly influences the sentiment of text generated by the model.
- The model's performance plateaus on larger, out-of-domain datasets, indicating sensitivity to the training data distribution.

_Target models:_ multiplicative LSTM (mLSTM)

---

### 2017 Q3  ·  2017-07-01 → 2017-09-30

#### 1. Representation of Linguistic Form and Function in Recurrent Neural Networks

`2017-09-11` · **135** citations · _venue:_ Computational Linguistics

> **Research question.** What types of linguistic structure do recurrent neural networks learn, and how do the activation patterns differ between networks trained on visual prediction versus language modeling tasks?

**Core contribution.** Introduces the omission score method for analyzing token importance in RNNs and shows that a visually-grounded pathway (VISUAL) learns to focus on semantically contentful words and grammatical functions, while language models (TEXTUAL, LM) are more sensitive to syntactic structure.

**Key findings.**
- The VISUAL pathway pays selective attention to lexical categories and grammatical functions that carry semantic information (e.g., nouns, adjectives).
- The language models (TEXTUAL and LM) are comparatively more sensitive to words with a syntactic function and to abstract contexts representing syntactic constructions.
- The VISUAL pathway treats word types differently depending on their grammatical function and position in the sentence, encoding information beyond linear order.
- The omission scores for the VISUAL model are harder to predict from word identity, position, and dependency labels alone, suggesting it encodes additional structural features.

_Target models:_ IMAGINET, LM, SUM

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

#### 1. Sharp Nearby, Fuzzy Far Away: How Neural Language Models Use Context

`2018-01-01` · **272** citations · _venue:_ ACL

> **Research question.** How much context do neural language models use, how do they represent nearby versus long-range context, and how do copy mechanisms help in using context?

**Core contribution.** LSTM language models use about 200 tokens of context, distinguish nearby and distant context (sensitive to word order only in nearby context), and rely on caching for copying distant words.

**Key findings.**
- The LSTM language model has an effective context size of about 200 tokens.
- The model is sensitive to word order in nearby context (within 50 tokens) but not in long-range context.
- The model represents long-range context as a rough semantic field or topic.
- The model can regenerate words from nearby context without a cache, but relies on a cache to copy words from long-range context.

_Target models:_ LSTM language model, neural caching model

---

#### 2. Pathologies of Neural Models Make Interpretations Difficult

`2018-01-01` · **236** citations · _venue:_ EMNLP

> **Research question.** Why do existing feature attribution interpretation methods for neural models fail, and how can the pathological behaviors they expose (e.g., overconfidence on nonsensical inputs) be mitigated?

**Core contribution.** Introduces input reduction, a method that exposes pathological behaviors in neural models (overconfidence on nonsensical, reduced inputs) and shows that fine-tuning with entropy regularization on these reduced examples mitigates the pathologies without harming accuracy on regular examples.

**Key findings.**
- Input reduction can iteratively remove 'unimportant' words from an input, often reducing it to one or two nonsensical words, without changing the model's prediction or significantly lowering its confidence.
- Neural models are overconfident on these reduced 'rubbish' examples, which humans cannot answer correctly, revealing a failure of uncertainty estimation.
- Gradient-based interpretation methods exhibit second-order sensitivity, where small input changes cause large shifts in the interpretation heatmap, even when the prediction remains stable.
- Fine-tuning models with entropy regularization on reduced examples increases the length and human-interpretability of the reduced inputs without sacrificing accuracy on regular examples.

_Target models:_ DRQA Document Reader, Bilateral Multi-Perspective Matching (BIMPM), Show, Ask, Attend, and Answer

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

#### 2. GAN Dissection: Visualizing and Understanding Generative Adversarial Networks

`2018-11-26` · **182** citations · _venue:_ arXiv

> **Research question.** How does a GAN represent our visual world internally? What causes the artifacts in GAN results? How do architectural choices affect GAN learning?

**Core contribution.** Presents an analytic framework to visualize and understand GANs at the unit, object, and scene levels, identifying interpretable units that correspond to object concepts and measuring their causal effects through interventions.

**Key findings.**
- GANs develop interpretable units (channels) in their convolutional layers that correlate with object concepts and object parts.
- These units have causal effects on object generation; ablating them removes objects, and inserting them adds objects.
- The framework can diagnose and improve GANs by locating and ablating artifact-causing units, improving output quality.
- Representations vary across layers: early layers have few interpretable units, middle layers have object units, and later layers have texture/color units.

_Target models:_ Progressive GANs, WGAN-GP

---

### 2019 Q1  ·  2019-01-01 → 2019-03-31

#### 1. Ablation Studies in Artificial Neural Networks

`2019-01-24` · **167** citations · _venue:_ arXiv

> **Research question.** Can ablation studies be used to investigate the organization of inner representations in artificial neural networks, similar to how they are used in neuroscience?

**Core contribution.** Ablation studies are a feasible method to investigate knowledge representations in ANNs, revealing that features are selectively represented in specific parts of the network and that networks exhibit robustness due to redundant representations.

**Key findings.**
- Features distinct to the local and global structure of the data are selectively represented in specific parts of the network.
- Some representations are redundant, awarding the network robustness to structural damage.
- The importance of a unit for classification correlates with how much its incoming weight distribution changes during training.
- Ablations can have positive effects on classification performance for specific classes, suggesting trade-offs during training.

_Target models:_ shallow MLP, VGG-19

---

#### 2. AllenNLP Interpret: A Framework for Explaining Predictions of NLP Models

`2019-01-01` · **125** citations · _venue:_ EMNLP

**Core contribution.** Introduces AllenNLP Interpret, a flexible framework for interpreting NLP models, providing model-agnostic APIs for gradient-based interpretation methods and adversarial attacks, along with reusable visualization components.

---

### 2019 Q2  ·  2019-04-01 → 2019-06-30

#### 1. Interpreting and improving natural-language processing (in machines) with natural language-processing (in the brain)

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

#### 1. Feature relevance quantification in explainable AI: A causal problem

`2019-10-29` · **155** citations · _venue:_ AISTATS

> **Research question.** Which probability distribution (observational conditional vs. interventional/marginal) is the right one for dropping features when quantifying feature relevance using Shapley values?

**Core contribution.** The paper argues that for feature attribution using Shapley values, the marginal (unconditional) expectation (interventional distribution) is conceptually correct, while the conditional expectation (observational distribution) is flawed.

**Key findings.**
- Using conditional expectations for dropped features can assign non-zero attribution to irrelevant features, violating sensitivity.
- The marginal expectation (interventional distribution) is the correct way to sample dropped features because it aligns with causal interventions.
- The SHAP package uses the marginal expectation as an approximation, which the authors argue is actually the correct approach, and attempts to improve SHAP by using conditional expectations are flawed.

---

### 2020 Q1  ·  2020-01-01 → 2020-03-31

#### 1. Perturbed Masking: Parameter-free Probing for Analyzing and Interpreting BERT

`2020-01-01` · **158** citations · _venue:_ ACL

> **Research question.** Can BERT outperform linguistically uninformed baselines in unsupervised dependency parsing? Is BERT learning an empirically useful structure of a language?

**Core contribution.** Proposes a parameter-free probing technique, Perturbed Masking, to extract syntactic and discourse structures from BERT without introducing additional parameters, and shows the induced structures are empirically useful for downstream tasks.

**Key findings.**
- Perturbed Masking can extract dependency and constituency trees from BERT that are better than linguistically-uninformed baselines.
- BERT captures clause-level structures well, as shown in constituency parsing.
- BERT is aware of document-level discourse structure, though it falls behind a strong baseline.
- The dependency structures induced by Perturbed Masking are as effective as human-designed dependency schemas in a downstream sentiment classification task.

_Target models:_ BERT

---

### 2020 Q3  ·  2020-07-01 → 2020-09-30

#### 1. Understanding the role of individual units in a deep neural network

`2020-09-01` · **370** citations · _venue:_ Proceedings of the National Academy of Sciences

> **Research question.** How can we understand the learned representations in deep neural networks by identifying the semantics of individual hidden units and their causal roles in network behavior?

**Core contribution.** The paper introduces network dissection, an analytic framework to systematically identify the semantics of individual hidden units in image classification and generation networks, and demonstrates that these units correspond to interpretable concepts and have causal roles in network behavior.

**Key findings.**
- In a scene classification CNN (VGG-16), individual units emerge as detectors for objects, parts, materials, and colors, even without explicit object labels in training.
- A small number of units are crucial for classifying specific scene classes; removing them significantly reduces accuracy for that class while leaving overall accuracy largely intact.
- In a GAN (Progressive GAN), units also emerge as object and part detectors, and they have causal effects on the generated output (e.g., removing tree units reduces trees in generated images).
- The GAN's units are context-sensitive: activating door units only adds doors in appropriate locations (e.g., on buildings) and not in nonsensical locations (e.g., in the sky or on trees).

_Target models:_ VGG-16, Progressive GAN

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

#### 2. Locating and Editing Factual Associations in GPT

`2022-02-10` · **175** citations · _venue:_ NeurIPS

> **Research question.** How are factual associations stored and recalled in autoregressive transformer language models, and can they be directly edited?

**Core contribution.** Factual associations in GPT are stored in mid-layer feed-forward modules and can be directly edited using a rank-one update method (ROME), which achieves strong generalization and specificity.

**Key findings.**
- Causal tracing reveals that mid-layer MLP modules at the last subject token are decisive for factual predictions.
- The Rank-One Model Editing (ROME) method can effectively edit factual associations by updating a single MLP layer with a rank-one weight update.
- ROME achieves strong generalization and specificity on counterfactual edits, outperforming previous fine-tuning and hypernetwork-based methods.
- The early site (mid-layer MLP) and late site (late-layer attention) play different roles: MLP stores the association, and attention copies it to the output.

_Target models:_ GPT-2 XL, GPT-J

---
