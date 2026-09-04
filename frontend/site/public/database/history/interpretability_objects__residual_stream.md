# Residual Stream

_A development timeline within **Interpretability Objects** — auto-generated_

## Background

The residual stream is the shared bus between transformer blocks — an additive, decomposable channel that carries information end-to-end.

## At a glance

- **Papers connected to this node in the DB:** 1520
- **Highlighted below (top by citation):** 21
- **Year span:** 2019 — 2023
- **Most-cited paper:** What Does BERT Learn about the Structure of Language? — 1179 citations

## Timeline

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

#### 2. Open Sesame: Getting inside BERT’s Linguistic Knowledge

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

### 2019 Q2  ·  2019-04-01 → 2019-06-30

#### 1. Just Say No to Single Embeddings: Why Your AI Needs Multiple Perspectives

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

#### 2. How multilingual is Multilingual BERT?

`2019-06-04` · **138** citations · _venue:_ ACL

> **Research question.** Why is Multilingual BERT (M-BERT) effective at zero-shot cross-lingual model transfer?

**Core contribution.** M-BERT learns multilingual representations from monolingual corpora, enabling zero-shot cross-lingual transfer, but transfer effectiveness depends on typological similarity and script consistency.

**Key findings.**
- M-BERT can perform cross-lingual transfer even between languages with different scripts, indicating deep multilingual representations beyond vocabulary memorization.
- Transfer performance is higher for typologically similar languages, suggesting that the model maps structures but does not learn systematic transformations for different word orders.
- M-BERT generalizes to code-switched text when trained on monolingual data, showing its multilingual representation capability.
- The model struggles with transliterated text, indicating limitations in handling non-standard scripts without explicit training.

_Target models:_ Multilingual BERT, English BERT

---

### 2019 Q3  ·  2019-07-01 → 2019-09-30

#### 1. On Identifiability in Transformers

`2019-08-12` · **76** citations · _venue:_ ICLR

> **Research question.** What is the identifiability of attention weights and token embeddings in Transformers, and how does context aggregate into hidden tokens?

**Core contribution.** Attention weights are not identifiable and thus not directly interpretable; effective attention and hidden token attribution are proposed as tools to better understand transformers.

**Key findings.**
- Attention weights are not identifiable for sequences longer than the attention head dimension, meaning there are infinitely many attention weights yielding the same output.
- Effective attention, which removes the null space component, can diverge from raw attention and provide more reliable explanations.
- Contextual word embeddings retain their identity (input token) to a large degree across layers, with identity information encoded in the angle.
- Input tokens mix strongly in hidden embeddings, with the contribution of the original token decreasing monotonically with depth but remaining the largest individual contributor in most cases.

_Target models:_ BERT-Base

---

### 2019 Q4  ·  2019-10-01 → 2019-12-31

#### 1. Transformers without Tears: Improving the Normalization of Self-Attention

`2019-10-14` · **130** citations · _venue:_ International Workshop on Spoken Language Translation

> **Research question.** How can Transformer training be improved through normalization-centric changes, specifically by using pre-norm residual connections, smaller initializations, and a new scaled ℓ2 normalization?

**Core contribution.** Proposes three simple, normalization-centric changes to Transformer training: pre-norm residual connections (PRENORM) for stability, scaled ℓ2 normalization (SCALE NORM) for speed and performance, and fixed word embedding normalization (FIXNORM), which together improve low-resource neural machine translation.

**Key findings.**
- Pre-norm residual connections (PRENORM) enable warmup-free training with large learning rates and are more stable than post-norm, especially in low-resource settings.
- Scaled ℓ2 normalization (SCALE NORM) is faster than LayerNorm and improves performance on low-resource translation tasks.
- Fixing word embedding norms (FIXNORM) provides additional gains, particularly on certain language pairs.
- Combining PRENORM, SCALE NORM, and FIXNORM yields an average improvement of +1.1 BLEU on five low-resource translation pairs.

_Target models:_ Transformer

---

### 2020 Q1  ·  2020-01-01 → 2020-03-31

#### 1. Reformer: The Efficient Transformer

`2020-01-13` · **323** citations · _venue:_ ICML

> **Research question.** How can Transformer models be made more memory-efficient and faster, especially on long sequences?

**Core contribution.** Introduces two techniques—locality-sensitive hashing attention and reversible layers—to make Transformer models much more memory-efficient and faster on long sequences without sacrificing performance.

**Key findings.**
- Shared query-key attention does not harm performance compared to standard attention.
- Reversible layers perform similarly to standard residual layers while saving memory.
- LSH attention approximates full attention well with multiple hashes, and models trained with LSH attention can achieve near-perfect accuracy.
- The Reformer model matches the performance of standard Transformers while being more memory-efficient and faster, especially on long sequences.

_Target models:_ Transformer, Reformer

---

#### 2. Understanding the Difficulty of Training Transformers

`2020-01-01` · **155** citations · _venue:_ EMNLP

> **Research question.** What complicates Transformer training? The paper investigates the root causes of instability in training Transformers, focusing on the amplification effect due to dependency on residual branches.

**Core contribution.** The paper identifies the amplification effect—where heavy dependency on residual branches amplifies parameter perturbations and destabilizes training—as the root cause of Transformer training instability, and proposes Admin, an adaptive initialization method that controls this dependency to stabilize training and improve performance.

**Key findings.**
- Unbalanced gradients are not the root cause of training instability in Transformers.
- The amplification effect, caused by heavy dependency on residual branches, is the main cause of instability in Post-LN Transformers.
- Pre-LN Transformers are more stable but have limited model potential due to lighter dependency on residual branches.
- Admin initialization stabilizes training by controlling dependency on residual branches early and allowing more flexibility later.

_Target models:_ Post-LN Transformer, Pre-LN Transformer, Transformer-small, Transformer-base

---

#### 3. exBERT: A Visual Analysis Tool to Explore Learned Representations in Transformer Models

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

### 2020 Q2  ·  2020-04-01 → 2020-06-30

#### 1. Knowledge Distillation from Internal Representations

`2020-04-03` · **155** citations · _venue:_ AAAI

> **Research question.** Can distilling the internal representations (self-attention probabilities and hidden states) of a large teacher model into a smaller student model improve knowledge distillation compared to only using output probabilities?

**Core contribution.** Proposes distilling internal representations (self-attention probabilities and hidden states) in addition to output probabilities for knowledge distillation, which consistently outperforms standard soft-label distillation on GLUE tasks.

**Key findings.**
- Internal knowledge distillation (using KL-divergence on attention and cosine similarity on hidden states) consistently outperforms standard soft-label distillation across four GLUE datasets.
- The method effectively compresses the internal behavior of the teacher into the student, as evidenced by lower KL-divergence in attention patterns.
- The performance gap between internal and standard distillation increases when training data size is smaller.
- The student model trained with internal distillation tends to replicate the teacher's correct and incorrect predictions more closely than a student trained with standard distillation.

_Target models:_ BERT_base

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

#### 1. Attention is Not All You Need: Pure Attention Loses Rank Doubly\n Exponentially with Depth

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

#### 2. Understanding and Overcoming the Challenges of Efficient Transformer Quantization

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

#### 3. All Bark and No Bite: Rogue Dimensions in Transformer Language Models Obscure Representational Quality

`2021-01-01` · **56** citations · _venue:_ EMNLP

> **Research question.** How informative are standard similarity measures (cosine similarity, Euclidean distance) in contextualized language models, and how do rogue dimensions dominate these measures, obscuring representational quality?

**Core contribution.** Standard similarity measures in contextual language models are dominated by a small number of rogue dimensions, and simple postprocessing techniques like standardization can correct for this, revealing underlying representational quality that is preserved across all layers.

**Key findings.**
- A small number of rogue dimensions (1-5) dominate cosine similarity and Euclidean distance in contextual language models.
- Rogue dimensions are centered far from the origin and have disproportionately high variance.
- The rogue dimensions that dominate similarity measures do not dominate model behavior; ablating them has little effect on the language modeling distribution.
- Rogue dimensions are often correlated with specific tokens (e.g., punctuation) and positions (e.g., position zero).

_Target models:_ BERT, RoBERTa, GPT-2, XLNet

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

#### 1. Locating and Editing Factual Associations in GPT

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

#### 2. Transformer Language Models without Positional Encodings Still Learn Positional Information

`2022-01-01` · **48** citations · _venue:_ ACL

> **Research question.** Can transformer language models learn positional information without explicit positional encodings, and how do they do it?

**Core contribution.** Transformer language models without explicit positional encodings (NoPos) can learn implicit positional information and achieve competitive performance, and this ability is due to the causal attention mask.

**Key findings.**
- NoPos models achieve competitive perplexity compared to models with explicit positional encodings across different datasets, model sizes, and sequence lengths.
- Probing experiments show that NoPos models learn an implicit notion of absolute positions in their hidden representations, similar to models with learned positional embeddings.
- The success of NoPos models is unique to causal language models; masked language models fail to converge without positional encodings.
- Shuffling the prefix tokens leads to a dramatic increase in loss, indicating that the model uses the learned positional information.

_Target models:_ NoPos, Learned, Sinusoidal, ALiBi, RoBERTa large

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

#### 1. Emergent World Representations: Exploring a Sequence Model Trained on a Synthetic Task

`2022-10-24` · **60** citations · _venue:_ ICLR

> **Research question.** Does a sequence model trained on a synthetic task (Othello game transcripts) learn an internal representation of the board state, and is that representation causal to its predictions?

**Core contribution.** The paper provides evidence that a GPT model trained on Othello game transcripts learns a nonlinear internal representation of the board state, which is causally involved in its predictions. It introduces intervention techniques and latent saliency maps for interpretability.

**Key findings.**
- Othello-GPT predicts legal moves with high accuracy, and this is not due to memorization.
- Nonlinear probes can accurately decode the board state from internal activations, while linear probes perform poorly.
- Intervention experiments show that the board representation is causal to the model's predictions.
- Latent saliency maps reveal differences between models trained on synthetic vs. championship data, indicating different learned strategies.

_Target models:_ Othello-GPT

---

### 2023 Q4  ·  2023-10-01 → 2023-12-31

#### 1. Language Models Represent Space and Time

`2023-10-03` · **40** citations · _venue:_ ICLR

> **Research question.** Do large language models learn coherent linear representations of space and time, i.e., do they form a world model?

**Core contribution.** Large language models learn linear representations of space and time that are robust to prompting and unified across entity types, and individual 'space' and 'time' neurons exist that encode these coordinates.

**Key findings.**
- Linear probes can recover spatial and temporal coordinates from internal activations, with performance increasing with model size and plateauing in middle layers.
- Spatial and temporal features are linearly represented, as nonlinear probes do not improve performance.
- Representations are robust to variations in prompting, though random tokens or capitalization degrade performance.
- Probes generalize across entity types and to held-out geographic or temporal blocks, indicating unified representations.

_Target models:_ Llama-2-7B, Llama-2-13B, Llama-2-70B, Pythia-160M, Pythia-410M, Pythia-1B

---
