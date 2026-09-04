# Representation & Parameter Analysis

_A development timeline within **Mechanism Methods** — auto-generated_

## Background

Representation and Parameter Analysis studies the geometry of hidden states and weight matrices — subspaces, singular values, alignment — to characterize how information is encoded.

## At a glance

- **Papers connected to this node in the DB:** 3700
- **Highlighted below (top by citation):** 28
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

#### 2. Visualizing and Understanding Convolutional Networks

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

#### 2. Object Detectors Emerge in Deep Scene CNNs

`2014-12-22` · **711** citations · _venue:_ ICLR

> **Research question.** What is the nature of the representation learned by a CNN trained for scene classification, and does object detection emerge as part of this representation?

**Core contribution.** Object detectors emerge in the inner layers of a CNN trained for scene classification, enabling the same network to perform both scene recognition and object localization in a single forward pass without explicit object-level supervision.

**Key findings.**
- A CNN trained on scene classification (Places) learns object detectors in its inner layers, even more so than a CNN trained on object classification (ImageNet).
- The network learns a hierarchy of features, with early layers responding to simple elements and textures, and later layers responding to objects and scenes.
- The objects that emerge are the most discriminative for the scene classification task, as evidenced by a high correlation between object frequency in the network and object informativeness for scene classification.
- The network can perform object localization using the activations of its internal units, with high segmentation performance for many object classes.

_Target models:_ ImageNet-CNN, Places-CNN

---

### 2015 Q2  ·  2015-04-01 → 2015-06-30

#### 1. Visualizing and Understanding Neural Models in NLP

`2015-06-02` · **166** citations · _venue:_ NAACL

> **Research question.** How do neural models achieve compositionality, building sentence meaning from words and phrases, and how can we visualize and interpret these models?

**Core contribution.** Introduces visualization strategies (plotting unit values and first-derivative saliency) to understand how neural models achieve compositionality, demonstrating markedness asymmetries in negation and the ability of LSTMs to focus on important words.

**Key findings.**
- LSTM's success is due to its ability to maintain a sharp focus on important keywords, filtering out less relevant information.
- Neural models capture negative asymmetry (markedness) in negation, e.g., 'not bad' clusters with negative words.
- There is sharp dimensional locality, with certain dimensions marking negation and quantification.
- First-derivative saliency can highlight important words but is a rough approximation and may not capture all information in highly non-linear cases.

_Target models:_ Standard Recurrent Sequence, LSTM, Bidirectional LSTM, SEQ2SEQ

---

### 2016 Q1  ·  2016-01-01 → 2016-03-31

#### 1. Visualizing and Understanding Neural Models in NLP

`2016-01-01` · **535** citations · _venue:_ NAACL

> **Research question.** How do neural models achieve compositionality, building sentence meaning from the meanings of words and phrases?

**Core contribution.** This paper introduces visualization strategies, including representation plotting and first-derivative saliency, to understand how neural models compose meaning, revealing phenomena like negation asymmetry and the superior focus of LSTMs on key words.

**Key findings.**
- LSTMs and Bi-LSTMs show a sharper focus on important keywords (like 'hate') compared to standard RNNs, filtering out irrelevant information.
- The models capture the linguistic property of negative asymmetry, where 'not bad' is clustered with negative words rather than positive ones.
- In concessive sentences, the models operate competitively, with the stronger clause dominating the final sentiment representation.
- First-derivative saliency can identify which input words contribute most to a classification decision, though it is an approximation and may not capture all non-linear interactions.

_Target models:_ Standard Recurrent Sequence, LSTM, Bidirectional LSTM, SEQ2SEQ autoencoder

---

#### 2. Multifaceted Feature Visualization: Uncovering the Different Types of Features Learned By Each Neuron in Deep Neural Networks

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

#### 2. SVCCA: Singular Vector Canonical Correlation Analysis for Deep Learning Dynamics and Interpretability

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

#### 3. SVCCA: Singular Vector Canonical Correlation Analysis for Deep Learning\n Dynamics and Interpretability

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

### 2018 Q1  ·  2018-01-01 → 2018-03-31

#### 1. Dissecting Contextual Word Embeddings: Architecture and Representation

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

### 2019 Q1  ·  2019-01-01 → 2019-03-31

#### 1. What Does BERT Learn about the Structure of Language?

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

### 2019 Q2  ·  2019-04-01 → 2019-06-30

#### 1. Similarity of Neural Network Representations Revisited

`2019-05-01` · **430** citations · _venue:_ ICML

> **Research question.** How can we effectively measure similarities between neural network representations, and what do such measurements reveal about the correspondences between layers and across different training conditions?

**Core contribution.** Introduces Centered Kernel Alignment (CKA) as a similarity index for comparing neural network representations and shows it reliably identifies correspondences between layers of networks trained from different initializations and across architectures.

**Key findings.**
- CKA passes a sanity check that other methods fail: it can identify corresponding layers in networks trained from different random initializations.
- CKA reveals that increasing network width leads to more similar representations, with early layers saturating in similarity at fewer channels than later layers.
- CKA shows that early layers of networks trained on different datasets (CIFAR-10 and CIFAR-100) learn similar representations.
- CKA can reveal pathological behavior in very deep networks without residual connections.

_Target models:_ All-CNN-C, ResNet-62, Transformer encoder, Plain-10, Plain-18, Plain-34

---

#### 2. A mathematical theory of semantic development in deep neural networks

`2019-05-17` · **239** citations · _venue:_ Proceedings of the National Academy of Sciences

> **Research question.** What are the theoretical principles governing the ability of neural networks to acquire, organize, and deploy abstract knowledge by integrating across many individual experiences?

**Core contribution.** Provides a mathematical theory of semantic development in deep linear networks, showing how hierarchical differentiation and other semantic phenomena emerge from the interaction of statistical structure and nonlinear learning dynamics.

**Key findings.**
- Deep linear networks exhibit hierarchical differentiation of concepts through rapid developmental transitions.
- The model accounts for semantic illusions during periods of developmental stasis.
- Item typicality and category coherence emerge as factors controlling semantic processing speed.
- Patterns of inductive projection change over development.

_Target models:_ deep linear network, shallow network

---

#### 3. Just Say No to Single Embeddings: Why Your AI Needs Multiple Perspectives

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

#### 1. Separability and geometry of object manifolds in deep neural networks

`2020-02-06` · **178** citations · _venue:_ Nature Communications

> **Research question.** How does classification capacity improve along the hierarchies of deep neural networks, and how do changes in the geometry of object manifolds underlie this improvement?

**Core contribution.** The paper demonstrates that classification capacity improves across layers in deep neural networks due to geometric changes in object manifolds, specifically through reduction in manifold radius, dimension, and inter-manifold correlations.

**Key findings.**
- Classification capacity increases along the hierarchy of trained deep neural networks.
- Manifold dimension and radius decrease across layers, with dimension reduction playing a dominant role in improved separability.
- Inter-manifold correlations are reduced in later layers, enhancing separability.
- Training is essential for these improvements; untrained networks show little change in capacity and geometry.

_Target models:_ AlexNet, VGG-16, ResNet-50

---

### 2020 Q2  ·  2020-04-01 → 2020-06-30

#### 1. GANSpace: Discovering Interpretable GAN Controls

`2020-04-06` · **425** citations · _venue:_ ICLR

> **Research question.** How can we discover interpretable controls for image synthesis in existing GANs without requiring supervised learning or expensive optimization?

**Core contribution.** The paper introduces a simple, unsupervised method to discover interpretable controls for image synthesis in GANs by applying PCA to latent or feature spaces and using layer-wise perturbations, enabling control over attributes like viewpoint, aging, lighting, and time of day.

**Key findings.**
- Principal Component Analysis (PCA) applied to latent or feature spaces of GANs reveals important directions that correspond to interpretable image attributes.
- Layer-wise application of PCA directions allows for more disentangled and targeted controls, such as applying edits only to specific layers of the generator.
- BigGAN can be modified to support layer-wise control similar to StyleGAN, enabling style mixing and fine-grained editing without retraining.
- The discovered controls often match or resemble those found by supervised methods, despite requiring no supervision.

_Target models:_ BigGAN512-deep, StyleGAN, StyleGAN2

---

#### 2. GANSpace: Discovering Interpretable GAN Controls

`2020-04-06` · **356** citations · _venue:_ arXiv

> **Research question.** How can we identify interpretable control directions for existing Generative Adversarial Networks (GANs) without requiring supervision or expensive optimization?

**Core contribution.** This paper introduces a simple, unsupervised method to discover interpretable controls for image synthesis in pretrained GANs by applying Principal Component Analysis (PCA) in latent or feature space and using layer-wise perturbations.

**Key findings.**
- Principal components in GAN latent or feature spaces correspond to interpretable image attributes like viewpoint, aging, lighting, and time of day.
- Applying PCA-derived edits to specific subsets of network layers (layer-wise perturbation) can disentangle entangled concepts and create targeted controls.
- BigGAN can be modified to allow StyleGAN-like layer-wise style mixing and control without retraining.
- The discovered controls reveal model entanglements and 'disallowed combinations' that reflect biases and correlations in the GAN's training data.

_Target models:_ BigGAN, StyleGAN, StyleGAN2

---

### 2020 Q3  ·  2020-07-01 → 2020-09-30

#### 1. Eigen-CAM: Class Activation Map using Principal Components

`2020-07-01` · **427** citations · _venue:_ IJCNN

> **Research question.** How can we generate class activation maps that are robust to classification errors and do not require backpropagation or model modifications?

**Core contribution.** Eigen-CAM is a class activation map method that uses principal components of convolutional features, providing robust visual explanations without backpropagation or model changes.

**Key findings.**
- Eigen-CAM achieves up to 12% improvement in weakly-supervised object localization compared to state-of-the-art methods.
- It is robust against classification errors made by fully connected layers in CNNs.
- It does not rely on backpropagation, class relevance scores, or feature weighting.
- It works with all CNN models without modification or retraining.

_Target models:_ VGG-16, AlexNet, ResNet-101, Inception-V1, DenseNet-121

---

#### 2. Prevalence of neural collapse during the terminal phase of deep learning training

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
