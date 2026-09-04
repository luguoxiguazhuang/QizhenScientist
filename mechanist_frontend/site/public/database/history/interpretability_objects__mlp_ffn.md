# MLP / FFN

_A development timeline within **Interpretability Objects** — auto-generated_

## Background

The MLP / FFN blocks are studied as key-value memory stores — the primary locus of factual knowledge and computation in transformers.

## At a glance

- **Papers connected to this node in the DB:** 1321
- **Highlighted below (top by citation):** 19
- **Year span:** 2018 — 2023
- **Most-cited paper:** LocalViT: Analyzing Locality in Vision Transformers — 283 citations

## Timeline

### 2018 Q2  ·  2018-04-01 → 2018-06-30

#### 1. Constituency Parsing with a Self-Attentive Encoder

`2018-05-02` · **44** citations · _venue:_ ACL

> **Research question.** Can replacing an LSTM encoder with a self-attentive architecture improve constituency parsing? How does factoring content and position information in attention affect performance?

**Core contribution.** Replacing an LSTM encoder with a self-attentive architecture improves constituency parsing accuracy, and explicitly factoring content and position information within the attention mechanism leads to further performance gains.

**Key findings.**
- A self-attentive encoder outperforms an LSTM-based encoder for constituency parsing.
- Factoring content and position information in the attention mechanism improves parsing accuracy.
- Using a character-level LSTM for lexical representation outperforms using part-of-speech tags from an external tagger.
- Incorporating pre-trained ELMo word representations achieves new state-of-the-art results on the Penn Treebank.

_Target models:_ Self-attentive encoder, LSTM-based encoder

---

### 2019 Q2  ·  2019-04-01 → 2019-06-30

#### 1. Understanding and Improving Transformer From a Multi-Particle Dynamic System Point of View

`2019-06-06` · **115** citations · _venue:_ arXiv

> **Research question.** How can the Transformer architecture be understood from a multi-particle dynamic system and ordinary differential equation (ODE) perspective, and can this perspective lead to an improved architecture?

**Core contribution.** The paper provides a novel perspective that interprets the Transformer as a numerical ODE solver for a convection-diffusion equation in a multi-particle dynamic system. Based on this, it proposes the Macaron Net, a new architecture that replaces the Lie-Trotter splitting scheme with the Strang-Marchuk splitting scheme, leading to improved performance on machine translation and GLUE tasks.

**Key findings.**
- The Transformer can be mathematically interpreted as a numerical ODE solver using the Lie-Trotter splitting scheme and Euler's method for a convection-diffusion equation.
- Replacing the Lie-Trotter splitting scheme with the Strang-Marchuk splitting scheme leads to a new architecture (Macaron Net) with two FFN sub-layers and one self-attention sub-layer per layer.
- The Macaron Net outperforms the Transformer on IWSLT14 and WMT14 machine translation tasks with the same number of parameters.
- The Macaron Net also outperforms BERT on the GLUE benchmark after unsupervised pretraining.

_Target models:_ Transformer

---

### 2019 Q3  ·  2019-07-01 → 2019-09-30

#### 1. Augmenting Self-attention with Persistent Memory

`2019-07-02` · **46** citations · _venue:_ arXiv

> **Research question.** Can the feed-forward layer in a transformer be replaced by augmenting self-attention with persistent memory vectors without degrading performance?

**Core contribution.** Proposes a transformer-like model that replaces the feed-forward layer with persistent memory vectors integrated into the self-attention mechanism, achieving competitive performance on language modeling benchmarks with fewer parameters.

**Key findings.**
- The all-attention network matches or outperforms transformer baselines on character-level (enwik8, text8) and word-level (WikiText-103) language modeling tasks.
- Persistent memory vectors are crucial for performance; a model without them (equivalent to a transformer without feed-forward layers) performs poorly.
- Computing attention jointly over persistent and context vectors works better than computing separate attentions.
- Using multiple heads for the persistent vectors is more effective than using a single head.

_Target models:_ Transformer, Transformer-XL, Transformer + adaptive span, All-attention network

---

### 2020 Q4  ·  2020-10-01 → 2020-12-31

#### 1. A Primer in BERTology: What We Know About How BERT Works

`2020-12-01` · **146** citations · _venue:_ TACL

> **Research question.** What is the current state of knowledge about how BERT works, including the information it learns, how it is represented, and common modifications to its training and architecture?

**Core contribution.** This paper provides the first comprehensive survey of over 150 studies on BERT, summarizing the current state of knowledge about how BERT works, what information it learns, and how it is represented, and outlines directions for future research.

**Key findings.**
- BERT encodes syntactic and semantic knowledge, but its understanding is incomplete and it is insensitive to malformed input.
- BERT's self-attention heads exhibit interpretable patterns and some specialize in syntactic relations.
- BERT is overparameterized and can be compressed with minimal loss using techniques like knowledge distillation, quantization, and pruning.
- Pre-training helps BERT find wider optima and improves generalization for downstream tasks.

_Target models:_ BERT, BERT-base, BERT-large

---

### 2021 Q1  ·  2021-01-01 → 2021-03-31

#### 1. Pretrained Transformers as Universal Computation Engines

`2021-03-09` · **99** citations · _venue:_ arXiv

> **Research question.** We investigate the capability of a transformer pretrained on natural language to generalize to other modalities with minimal finetuning.

**Core contribution.** A transformer pretrained on natural language can be effectively transferred to non-language tasks by freezing the self-attention and feedforward layers and only finetuning a small set of parameters, achieving strong performance.

**Key findings.**
- Frozen Pretrained Transformer (FPT) achieves comparable performance to fully trained transformers on a variety of non-language tasks.
- Language pretraining improves performance and compute efficiency over random initialization.
- The transformer architecture (even randomly initialized) outperforms LSTM architectures on these tasks.
- FPT converges faster than randomly initialized transformers.

_Target models:_ GPT-2, BERT, T5, Longformer, Vision Transformer (ViT)

---

#### 2. Attention is Not All You Need: Pure Attention Loses Rank Doubly\n Exponentially with Depth

`2021-03-04` · **90** citations · _venue:_ ICML

> **Research question.** Why do transformers work despite the rank collapse in pure self-attention networks? What mechanisms counteract this collapse?

**Core contribution.** This paper shows that pure self-attention networks lose rank doubly exponentially with depth, converging to a rank-1 matrix. It introduces a path decomposition to analyze SANs and reveals that skip connections and MLPs counteract this rank collapse.

**Key findings.**
- Pure self-attention networks (without skip connections or MLPs) converge doubly exponentially to a rank-1 matrix.
- Skip connections are crucial for mitigating rank collapse.
- MLPs can slow down the convergence by increasing the Lipschitz constant.
- Layer normalization does not mitigate rank collapse.

_Target models:_ BERT, Albert, XLNet, Self-Attention Network (SAN), transformer

---

#### 3. Understanding and Overcoming the Challenges of Efficient Transformer Quantization

`2021-01-01` · **73** citations · _venue:_ EMNLP

> **Research question.** What are the challenges of quantizing transformer models, specifically the issue of high dynamic activation ranges and structured outliers, and how can they be overcome?

**Core contribution.** Identifies the challenge of high dynamic activation ranges in transformers due to structured outliers in residual connections and proposes three quantization methods (mixed precision PTQ, novel per-embedding-group quantization, and QAT) to address it with minimal accuracy loss.

**Key findings.**
- Standard 8-bit post-training quantization leads to significant performance degradation in BERT due to high dynamic activation ranges in residual connections.
- These activations contain structured outliers in specific embedding dimensions that encourage attention patterns like attending to the [SEP] token.
- Mixed precision PTQ (keeping some activations in 16-bit) can recover most of the accuracy loss.
- Per-embedding-group quantization, a novel scheme, effectively handles outliers with minimal overhead and recovers accuracy close to FP32.

_Target models:_ BERT-base, BERT-large

---

### 2021 Q2  ·  2021-04-01 → 2021-06-30

#### 1. LocalViT: Analyzing Locality in Vision Transformers

`2021-04-12` · **283** citations · _venue:_ IEEE/RJS International Conference on Intelligent RObots and Systems

> **Research question.** What is the influence of locality mechanisms in vision transformers?

**Core contribution.** The paper introduces a locality mechanism by adding depth-wise convolution to the feed-forward network of vision transformers, improving classification accuracy with minimal parameter increase.

**Key findings.**
- Incorporating locality via depth-wise convolution into the feed-forward network improves vision transformer performance.
- Using advanced activation functions like h-swish with squeeze-and-excitation modules further boosts accuracy.
- Locality is more effective when applied to lower layers of the transformer.
- Increasing the hidden dimension expansion ratio in the feed-forward network enhances model capacity and accuracy.

_Target models:_ Swin-T, DeiT-T, PVT-T, T2T-ViT, TNT, LocalViT-T

---

### 2021 Q3  ·  2021-07-01 → 2021-09-30

#### 1. Do Vision Transformers See Like Convolutional Neural Networks?

`2021-08-19` · **109** citations · _venue:_ ICLR

> **Research question.** How are Vision Transformers solving image tasks? Are they acting like convolutional networks, or learning entirely different visual representations?

**Core contribution.** The paper finds key representational differences between Vision Transformers (ViTs) and Convolutional Neural Networks (CNNs), showing ViTs have more uniform layer representations, incorporate global information earlier via self-attention, and have stronger skip connections that propagate features differently.

**Key findings.**
- ViTs have a more uniform internal representation structure with greater similarity between lower and higher layers compared to the staged similarity in ResNets.
- ViTs incorporate global information in lower layers through self-attention, while CNNs are restricted to local receptive fields; this leads to quantitatively different features.
- Skip connections in ViTs are more influential than in ResNets, with a phase transition: early layers strongly propagate the CLS token, while later layers propagate spatial token representations.
- ViTs preserve input spatial information more faithfully than ResNets in higher layers, especially when trained with a CLS token rather than global average pooling.

_Target models:_ ResNet50x1, ResNet152x2, ViT-B/32, ViT-B/16, ViT-L/16, ViT-H/14

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

#### 3. Knowledge Neurons in Pretrained Transformers

`2022-01-01` · **125** citations · _venue:_ ACL

> **Research question.** How is factual knowledge stored in pretrained Transformers? Specifically, can we identify specific neurons responsible for expressing factual knowledge?

**Core contribution.** Introduces the concept of 'knowledge neurons' and a gradient-based attribution method to identify neurons in feed-forward networks that express specific factual knowledge in pretrained Transformers.

**Key findings.**
- Knowledge neurons identified by the proposed method are positively correlated with the expression of their corresponding facts, as shown by suppression and amplification experiments.
- Knowledge neurons are more activated by prompts that express the correct relation compared to prompts that do not.
- Knowledge neurons for a fact are largely exclusive to that fact, with minimal overlap between facts of different relations.
- Preliminary case studies show that directly modifying parameters associated with knowledge neurons can update or erase specific factual knowledge with moderate impact on other knowledge.

_Target models:_ BERT-base-cased

---

### 2022 Q3  ·  2022-07-01 → 2022-09-30

#### 1. LLM.int8(): 8-bit Matrix Multiplication for Transformers at Scale

`2022-08-15` · **112** citations · _venue:_ NeurIPS

> **Research question.** How can we perform 8-bit matrix multiplication for transformers at scale without performance degradation, particularly addressing the challenge of emergent outlier features?

**Core contribution.** The paper introduces LLM.int8(), a method for 8-bit quantization of transformer models that halves memory usage while retaining full precision performance, by using vector-wise quantization and mixed-precision decomposition to handle emergent outlier features.

**Key findings.**
- Emergent outlier features in transformer hidden states beyond 6.7B parameters disrupt standard quantization methods.
- LLM.int8() combines vector-wise quantization and mixed-precision decomposition to achieve no performance degradation up to 175B parameters.
- The method reduces memory footprint by half, enabling large models like OPT-175B and BLOOM-176B to run on consumer GPUs.
- Outlier features are systematic, concentrated in a few dimensions, and critical for model performance; removing them severely degrades attention and perplexity.

_Target models:_ OPT-125M, OPT-1.3B, OPT-2.7B, OPT-6.7B, OPT-13B, OPT-175B

---

### 2022 Q4  ·  2022-10-01 → 2022-12-31

#### 1. Transformers learn in-context by gradient descent

`2022-12-15` · **89** citations · _venue:_ ICML

> **Research question.** How does in-context learning in Transformers work? The paper hypothesizes that Transformers implement gradient descent in their forward pass to learn from in-context data.

**Core contribution.** The paper shows that Transformers trained on auto-regressive objectives implement gradient descent in their forward pass, providing a mechanistic understanding of in-context learning for regression tasks.

**Key findings.**
- A single linear self-attention layer can be constructed to perform one step of gradient descent on a linear regression loss.
- When trained on linear regression tasks, linear self-attention-only Transformers converge to weights that match the gradient descent construction.
- Multiple layers of self-attention can implement multiple steps of gradient descent and even surpass plain gradient descent by learning a curvature correction (GD++).
- Transformers with MLPs can solve nonlinear regression tasks by learning linear models on deep representations.

_Target models:_ linear self-attention-only Transformer, self-attention-only Transformer, Transformer with MLP

---

#### 2. Mass-Editing Memory in a Transformer

`2022-10-13` · **53** citations · _venue:_ ICLR

> **Research question.** How many memories can we add to a deep network by directly editing its weights? The paper investigates scaling up memory editing to thousands of associations in language models.

**Core contribution.** MEMIT is a method for directly updating a language model with many memories by editing MLP weights in a range of critical layers, scaling to thousands of associations while maintaining generalization, specificity, and fluency.

**Key findings.**
- MEMIT scales to 10,000 edits on GPT-J and GPT-NeoX, exceeding prior work by orders of magnitude.
- MEMIT outperforms fine-tuning, MEND, and ROME baselines on efficacy, generalization, and specificity metrics.
- MEMIT maintains fluency and consistency of generations after mass edits.
- MEMIT performs well across different categories of facts and when editing mixed sets of memories.

_Target models:_ GPT-J (6B), GPT-NeoX (20B)

---

### 2023 Q1  ·  2023-01-01 → 2023-03-31

#### 1. Progress measures for grokking via mechanistic interpretability

`2023-01-12` · **54** citations · _venue:_ ICLR

> **Research question.** How can we find continuous progress measures that underlie seemingly discontinuous qualitative changes (like grokking) in neural networks? The paper uses mechanistic interpretability to reverse-engineer learned behaviors and define such progress measures.

**Core contribution.** The paper uses mechanistic interpretability to define progress measures for grokking, showing that grokking arises from the gradual amplification of structured mechanisms (a Fourier multiplication algorithm) followed by removal of memorizing components, rather than being a sudden shift.

**Key findings.**
- The transformers implement modular addition using a Fourier multiplication algorithm that maps inputs to a circle and uses trigonometric identities.
- The model's weights and activations show periodic structure and are sparse in the Fourier domain, with key frequencies.
- Two progress measures (restricted loss and excluded loss) improve continuously prior to grokking, revealing hidden progress.
- Training can be split into three phases: memorization, circuit formation, and cleanup.

_Target models:_ one-layer transformer, two-layer transformer

---

### 2023 Q3  ·  2023-07-01 → 2023-09-30

#### 1. On Efficient Transformer-Based Image Pre-training for Low-Level Vision

`2023-08-01` · **51** citations · _venue:_ IJCAI

> **Research question.** How does pre-training act in low-level vision tasks, and how can effective pre-training be performed for image processing systems?

**Core contribution.** Pre-training introduces local information as an inductive bias to intermediate layers of transformers, significantly improving performance in low-level vision tasks like super-resolution and deraining, with multi-related-task pre-training being the most effective and data-efficient strategy.

**Key findings.**
- Pre-training introduces more local information to intermediate layers in super-resolution, yielding significant performance gains.
- Pre-training hardly affects internal feature representations in denoising, resulting in limited gains.
- Multi-related-task pre-training is more effective and data-efficient than single-task or multi-unrelated-task pre-training.
- Transformers obtain greater improvements from pre-training compared to CNNs.

_Target models:_ EDT, SwinIR

---
