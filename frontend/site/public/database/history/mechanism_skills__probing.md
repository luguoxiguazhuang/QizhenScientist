# Probing

_A development timeline within **Mechanism Methods** — auto-generated_

## Background

Probing trains lightweight classifiers on top of frozen model layers to detect whether a property (syntax, sentiment, factuality) is linearly recoverable from internal representations.

## At a glance

- **Papers connected to this node in the DB:** 2046
- **Highlighted below (top by citation):** 15
- **Year span:** 2014 — 2020
- **Most-cited paper:** Deep Supervised, but Not Unsupervised, Models May Explain IT Cortical Representation — 1340 citations

## Timeline

### 2014 Q4  ·  2014-10-01 → 2014-12-31

#### 1. Deep Supervised, but Not Unsupervised, Models May Explain IT Cortical Representation

`2014-11-06` · **1340** citations · _venue:_ PLoS Computational Biology

> **Research question.** To what extent can the internal representations of computational object-vision models explain the representational geometry of primate inferior temporal (IT) cortex?

**Core contribution.** Supervised deep learning models, particularly a deep convolutional network trained on ImageNet, best explain the representational geometry of primate IT cortex, and combining their features with linear discriminants can fully explain the IT data, whereas unsupervised models fail to account for the categorical clustering in IT.

**Key findings.**
- Better performing models in object categorization show higher representational similarity to IT cortex.
- Unsupervised models fail to explain the categorical clustering (e.g., animate/inanimate, face clusters) observed in IT.
- A deep supervised convolutional network (trained on ImageNet) best explains IT representation but does not fully explain it.
- Combining features from the deep supervised model with linear discriminants (trained to maximize categorical margins) yields a representation that fully explains the IT data.

_Target models:_ HMAX, VisNet, SIFT, GIST, self-similarity features, deep convolutional neural network (Krizhevsky et al. 2012)

---

### 2016 Q3  ·  2016-07-01 → 2016-09-30

#### 1. Fine-grained Analysis of Sentence Embeddings Using Auxiliary Prediction Tasks

`2016-08-15` · **295** citations · _venue:_ ICLR

> **Research question.** What low-level sentence properties (length, word content, word order) are encoded in different sentence embedding methods, and how does the dimensionality of the embeddings affect this encoding?

**Core contribution.** The paper proposes a framework for fine-grained analysis of sentence embeddings using auxiliary prediction tasks, and applies it to compare CBOW, LSTM auto-encoders, and skip-thought vectors, revealing their relative strengths in encoding sentence length, word content, and word order, and the effect of dimensionality.

**Key findings.**
- CBOW embeddings encode sentence length information surprisingly well, partly due to the norm of the average vector decreasing with sentence length.
- CBOW embeddings can predict word order above chance, but this is largely due to general language statistics rather than the sentence embedding itself.
- LSTM auto-encoders are effective at encoding word order and word content, with performance improving with dimensionality up to a point (word content peaks at 750 dimensions and drops at 1000).
- LSTM auto-encoders do not rely on natural language word order patterns when encoding sentences (as shown by permuted sentences), while skip-thought vectors do.

_Target models:_ CBOW, LSTM auto-encoder, skip-thought vectors

---

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

### 2018 Q1  ·  2018-01-01 → 2018-03-31

#### 1. What you can cram into a single $&amp;!#* vector: Probing sentence embeddings for linguistic properties

`2018-01-01` · **586** citations · _venue:_ Repositori digital de la UPF (Universitat Pompeu Fabra)

> **Research question.** What linguistic properties are captured by sentence embeddings?

**Core contribution.** Introduces a set of 10 probing tasks to analyze the linguistic properties captured by sentence embeddings, and uses them to study embeddings from three different encoders trained in eight distinct ways.

**Key findings.**
- Bag-of-Vectors (BoV) is surprisingly good at capturing sentence-level properties due to redundancies in natural language.
- Different encoder architectures (BiLSTM, Gated ConvNet) lead to embeddings with different linguistic properties even when trained on the same objective.
- BiLSTM-max embeddings capture interesting linguistic knowledge even without any training.
- There are significant correlations between performance on probing tasks (especially Word Content) and downstream tasks.

_Target models:_ BiLSTM-last, BiLSTM-max, Gated ConvNet

---

#### 2. Dissecting Contextual Word Embeddings: Architecture and Representation

`2018-01-01` · **426** citations · _venue:_ EMNLP

> **Research question.** How does the choice of neural architecture (LSTM, CNN, or self-attention) influence the effectiveness and qualitative properties of contextual word representations learned by bidirectional language models? What linguistic information do these representations capture at different layers?

**Core contribution.** Deep bidirectional language models (biLMs) learn a hierarchy of linguistic information in their representations, with morphology in the word embedding layer, local syntax in lower contextual layers, and longer-range semantics like coreference in upper layers, and this holds across different architectures (LSTM, Transformer, Gated CNN).

**Key findings.**
- All three biLM architectures (LSTM, Transformer, Gated CNN) produce contextual representations that significantly outperform static word embeddings (GloVe) on four NLP tasks, with a tradeoff between speed and accuracy.
- The word embedding layer in biLMs captures morphological information but little semantic information, unlike traditional word vectors.
- Lower contextual layers in biLMs specialize in local syntactic relationships, while upper layers capture longer-range semantic relationships such as coreference.
- Span representations formed from context vectors can capture phrasal syntax, enabling constituency parsing with simple linear models.

_Target models:_ LSTM, Transformer, Gated CNN

---

#### 3. An Analysis of Encoder Representations in Transformer-Based Machine Translation

`2018-01-01` · **268** citations · _venue:_ BOA (University of Milano-Bicocca)

> **Research question.** What kind of linguistic information (syntactic and semantic) is learned by the encoder of Transformer-based machine translation models, and how does it vary across layers and models with different translation quality?

**Core contribution.** The paper analyzes encoder representations in Transformer-based machine translation and finds that specific attention heads capture syntactic dependencies, with lower layers encoding more syntax and higher layers more semantics.

**Key findings.**
- Each layer has at least one attention head that encodes a significant amount of syntactic dependencies.
- Lower layers tend to encode more syntactic information, while upper layers move towards semantic tasks.
- The information about the length of the input sentence starts to vanish after the third layer.
- Attention can be used to transfer knowledge between high- and low-resource languages, improving translation quality.

_Target models:_ Transformer

---

### 2018 Q2  ·  2018-04-01 → 2018-06-30

#### 1. What you can cram into a single vector: Probing sentence embeddings for\n linguistic properties

`2018-05-02` · **274** citations · _venue:_ ACL

> **Research question.** What linguistic properties are captured by sentence embeddings?

**Core contribution.** Introduces a set of 10 probing tasks to analyze the linguistic properties captured by sentence embeddings, and uses them to evaluate and compare a range of encoder architectures and training methods.

**Key findings.**
- Bag-of-Vectors (BoV) embeddings are surprisingly effective at capturing sentence-level properties due to redundancies in natural language.
- Different encoder architectures (BiLSTM, Gated ConvNet) trained with the same objective yield embeddings with different linguistic properties, highlighting the importance of architectural prior.
- BiLSTM-max embeddings capture significant linguistic knowledge even without any training (untrained).
- Performance on probing tasks correlates with downstream task performance; for example, word content (WC) positively correlates with all downstream tasks, while sentence length (SentLen) negatively correlates.

_Target models:_ BiLSTM-last, BiLSTM-max, Gated ConvNet

---

### 2018 Q4  ·  2018-10-01 → 2018-12-31

#### 1. GAN Dissection: Visualizing and Understanding Generative Adversarial Networks

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

#### 1. BERT Rediscovers the Classical NLP Pipeline

`2019-01-01` · **1243** citations · _venue:_ ACL

> **Research question.** Where is linguistic information captured within the BERT network?

**Core contribution.** BERT represents the traditional NLP pipeline hierarchically, with lower-level syntactic information in earlier layers and higher-level semantic information in later layers, and can dynamically revise lower-level decisions based on higher-level context.

**Key findings.**
- Linguistic tasks are encoded in a natural progression from part-of-speech tagging to coreference.
- Syntactic information is more localizable to specific layers, while semantic information is spread across the network.
- The model can and often does process individual examples out of the aggregate pipeline order, using high-level information to disambiguate low-level decisions.
- The same ordering of task representations holds for both BERT-base and BERT-large, with a 'stretching effect' where representations concentrate at similar relative depths.

_Target models:_ BERT-base, BERT-large

---

#### 2. What Does BERT Learn about the Structure of Language?

`2019-01-01` · **1179** citations · _venue:_ ACL

> **Research question.** What linguistic structure does BERT learn? Specifically, can we unveil the representations learned by BERT to proto-linguistics structures?

**Core contribution.** This paper provides evidence that BERT captures hierarchical linguistic structure, with surface features in lower layers, syntactic in middle, and semantic in higher layers, and that it uses deeper layers for long-distance dependencies and implicitly captures tree-like structures.

**Key findings.**
- BERT's phrasal representation captures phrase-level information in the lower layers, which gets diluted in higher layers.
- BERT embeds a rich hierarchy of linguistic signals: surface information at the bottom, syntactic in the middle, and semantic at the top.
- BERT requires deeper layers to handle long-distance dependency information, such as subject-verb agreement with more attractors.
- BERT implicitly implements a tree-based compositional scheme, as shown by Tensor Product Decomposition Networks (TPDN) approximating BERT's representations.

_Target models:_ BERT

---

#### 3. Designing and Interpreting Probes with Control Tasks

`2019-01-01` · **397** citations · _venue:_ EMNLP

> **Research question.** Does high probe accuracy on a linguistic task mean the representation encodes linguistic structure, or just that the probe has learned the task? The paper proposes control tasks to address this.

**Core contribution.** The paper introduces control tasks to measure probe selectivity, showing that high probe accuracy may be due to probe expressivity rather than representation quality, and that selectivity helps interpret probing results.

**Key findings.**
- Popular MLP probes achieve high linguistic task accuracy but low selectivity, indicating they may memorize word types rather than extract linguistic structure.
- Linear and bilinear probes achieve higher selectivity than MLPs, suggesting that the small accuracy gain of MLPs may be due to increased probe expressivity.
- Dropout, a common regularization method, is ineffective for improving selectivity of MLP probes, while other methods like small hidden states, weight decay, and limited training data can improve selectivity.
- Probes on the first layer of ELMo (ELMo1) achieve slightly higher part-of-speech accuracy than the second layer (ELMo2), but ELMo2 probes are substantially more selective, suggesting that the difference in accuracy may be due to easier access to word identity features in ELMo1.

_Target models:_ ELMo, untrained BiLSTM (Proj0)

---

### 2019 Q2  ·  2019-04-01 → 2019-06-30

#### 1. What do you learn from context? Probing for sentence structure in\n contextualized word representations

`2019-05-15` · **360** citations · _venue:_ ICLR

> **Research question.** What do contextualized word representations encode that conventional word embeddings do not, in terms of syntactic vs. semantic information and local vs. long-range structure?

**Core contribution.** The paper introduces an edge probing framework for analyzing contextualized word representations and finds that these models encode syntactic information more effectively than semantic information, and that they capture long-range dependencies.

**Key findings.**
- Contextualized embeddings improve over non-contextualized baselines more on syntactic tasks (e.g., constituent labeling) than on semantic tasks (e.g., coreference).
- ELMo encodes long-range dependencies, as performance on dependency labeling does not drop as quickly with distance compared to local baselines.
- BERT-large performs best overall, with particularly large improvements on coreference tasks.
- Using scalar mixing of layer activations improves performance over concatenation for Transformer models.

_Target models:_ CoVe, ELMo, OpenAI GPT, BERT-base, BERT-large

---

#### 2. Just Say No to Single Embeddings: Why Your AI Needs Multiple Perspectives

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
