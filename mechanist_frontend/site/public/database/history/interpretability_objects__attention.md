# Attention

_A development timeline within **Interpretability Objects** — auto-generated_

## Background

Attention heads route information between token positions; their roles, biases, and interactions have driven much of mech-interp.

## At a glance

- **Papers connected to this node in the DB:** 2483
- **Highlighted below (top by citation):** 35
- **Year span:** 2015 — 2023
- **Most-cited paper:** LoRA: Low-Rank Adaptation of Large Language Models — 2373 citations

## Timeline

### 2015 Q3  ·  2015-07-01 → 2015-09-30

#### 1. Reasoning about Entailment with Neural Attention

`2015-09-22` · **427** citations · _venue:_ ICLR

> **Research question.** Can an end-to-end differentiable neural network with a word-by-word attention mechanism outperform existing methods for recognizing textual entailment (RTE)?

**Core contribution.** The paper introduces a neural model based on LSTMs with a word-by-word attention mechanism for recognizing textual entailment, which outperforms previous neural and feature-based models, achieving state-of-the-art accuracy on the SNLI dataset.

**Key findings.**
- Conditional encoding (processing the hypothesis conditioned on the premise) improves performance over encoding sentences independently.
- Incorporating an attention mechanism provides further performance gains by allowing the model to focus on relevant parts of the premise.
- Word-by-word attention yields the best performance, enabling fine-grained reasoning over entailments of individual words and phrases.
- Two-way attention (attending in both directions) does not improve performance, likely due to the asymmetric nature of entailment.

_Target models:_ LSTM

---

### 2018 Q1  ·  2018-01-01 → 2018-03-31

#### 1. Constituency Parsing with a Self-Attentive Encoder

`2018-01-01` · **484** citations · _venue:_ ACL

> **Research question.** How can self-attention be used for constituency parsing?

**Core contribution.** Proposes a constituency parsing model based on self-attention that achieves state-of-the-art results on the Penn Treebank and Chinese Treebank.

**Key findings.**
- The self-attention parser achieves high F1 scores, outperforming previous recurrent and convolutional models.
- Attention heads in the model capture syntactic relationships such as subject-verb dependencies.
- The model demonstrates the effectiveness of self-attention for syntactic parsing tasks.

_Target models:_ Self-attention based constituency parser

---

#### 2. An Analysis of Encoder Representations in Transformer-Based Machine Translation

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

#### 3. An Analysis of Attention Mechanisms: The Case of Word Sense Disambiguation in Neural Machine Translation

`2018-01-01` · **107** citations · _venue:_ Zurich Open Repository and Archive (University of Zurich)

> **Research question.** How do encoder-decoder attention mechanisms handle ambiguous words in neural machine translation? Specifically, do they pay more attention to context tokens for disambiguation?

**Core contribution.** Attention mechanisms in NMT do not primarily use context tokens for word sense disambiguation; instead, they focus more on the ambiguous word itself. Contextual information for disambiguation is encoded in the encoder hidden states. In Transformer models, early attention layers learn token alignment, while later layers learn to extract features from unaligned context tokens.

**Key findings.**
- Word sense disambiguation in NMT is challenging, with data sparsity being a main issue.
- Attention mechanisms distribute more attention to the ambiguous noun itself rather than to context tokens when translating ambiguous nouns.
- Encoder-decoder attention is not the main mechanism for incorporating contextual information for WSD; models encode this information in the encoder hidden states.
- In Transformer attention mechanisms, the first few layers learn to align source and target tokens, while the last few layers learn to capture features from related but unaligned context tokens.

_Target models:_ RNNS2S, Transformer

---

### 2018 Q2  ·  2018-04-01 → 2018-06-30

#### 1. Relational Deep Reinforcement Learning

`2018-06-05` · **159** citations · _venue:_ arXiv

> **Research question.** How can incorporating structured perception and relational reasoning via self-attention improve the efficiency, generalization, and interpretability of deep reinforcement learning agents?

**Core contribution.** Introduces a deep RL agent architecture that uses self-attention for relational reasoning, leading to improved sample efficiency, generalization, and interpretable representations compared to convolutional baselines.

**Key findings.**
- The relational agent with self-attention blocks outperforms convolutional baselines in the Box-World task, solving more levels and showing better sample complexity.
- The relational agent achieves state-of-the-art performance on six StarCraft II mini-games, surpassing human grandmaster performance on four.
- Visualization of attention weights reveals interpretable relational computations, such as keys attending to the locks they can unlock.
- The relational agent demonstrates zero-shot generalization to longer solution paths and unseen key-lock combinations in Box-World.

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

#### 2. Analyzing Multi-Head Self-Attention: Specialized Heads Do the Heavy Lifting, the Rest Can Be Pruned

`2019-01-01` · **1008** citations · _venue:_ Data Archiving and Networked Services (DANS)

> **Research question.** To what extent does translation quality depend on individual encoder heads? Do individual encoder heads play consistent and interpretable roles? Which types of model attention are most sensitive to the number of heads? Can we significantly reduce the number of attention heads while preserving translation quality?

**Core contribution.** The paper shows that only a small subset of attention heads in the Transformer are important for translation, and these heads perform interpretable functions (positional, syntactic, rare words). It introduces a pruning method based on stochastic gates and L0 penalty relaxation that can remove the majority of heads with minimal performance drop.

**Key findings.**
- Only a small subset of attention heads are important for translation.
- Important heads have specialized and interpretable functions, such as attending to adjacent tokens (positional), tracking specific syntactic dependencies, or attending to rare words.
- The proposed pruning method can remove the vast majority of heads without seriously affecting performance (e.g., pruning 38 out of 48 encoder heads results in only 0.15 BLEU drop on WMT EN-RU).
- Specialized heads (positional and syntactic) are the last to be pruned, confirming their importance.

_Target models:_ Transformer

---

#### 3. Attention is not Explanation

`2019-02-26` · **489** citations · _venue:_ NAACL

> **Research question.** To what extent do attention weights provide meaningful explanations for model predictions in neural NLP models?

**Core contribution.** The paper demonstrates that standard attention modules in neural NLP models do not provide meaningful explanations for predictions, as attention weights correlate poorly with feature importance measures and can be adversarially manipulated without changing predictions.

**Key findings.**
- Learned attention weights are frequently uncorrelated with gradient-based and leave-one-out measures of feature importance.
- One can construct adversarial attention distributions that are maximally different from the original but yield equivalent predictions.
- Randomly permuting attention weights often induces only minimal changes in model output.
- Attention weights in simple feedforward (average) encoders show better correlation with feature importance than those in BiLSTM encoders.

_Target models:_ BiLSTM, Average encoder, ConvNet

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

#### 2. Understanding the Behaviors of BERT in Ranking

`2019-04-16` · **146** citations · _venue:_ arXiv

> **Research question.** What are the performances and behaviors of BERT in ranking tasks on MS MARCO and TREC Web Track?

**Core contribution.** BERT is effective for QA-focused passage ranking due to its interaction-based seq2seq matching, but less effective for ad hoc document ranking where user click signals are more beneficial.

**Key findings.**
- BERT-based rankers outperform previous neural IR models on MS MARCO passage ranking.
- BERT is not effective as a representation-based model for ranking; it relies on cross-sequence interactions.
- On TREC ad hoc ranking, BERT underperforms compared to feature-based learning to rank and models pre-trained on user clicks.
- BERT's attention focuses on marker tokens and stopwords, but stopwords have minimal impact on performance.

_Target models:_ BERT, BERT-Large

---

#### 3. Interpreting and improving natural-language processing (in machines) with natural language-processing (in the brain)

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

### 2019 Q3  ·  2019-07-01 → 2019-09-30

#### 1. Language Modeling with Deep Transformers

`2019-09-13` · **177** citations · _venue:_ Interspeech

> **Research question.** How to configure Transformer models for language modeling in speech recognition, and whether positional encoding is necessary for deep autoregressive Transformer language models?

**Core contribution.** Deep Transformer language models outperform LSTM-RNN baselines for speech recognition, and positional encoding is not required for autoregressive Transformers as they can inherently use positional information from the sequence.

**Key findings.**
- Deep Transformer language models outperform LSTM-RNN baselines on both word-level and BPE-level language modeling for speech recognition.
- Removing positional encoding slightly improves performance in deep autoregressive Transformer language models.
- The first layer of the Transformer with positional encoding learns to create n-gram features, while without positional encoding it focuses on the new input token.
- Other layers in the Transformer exhibit three categories: 'blur' layers, 'window' layers, and 'structured' layers.

_Target models:_ Transformer, LSTM-RNN, Universal Transformers

---

### 2019 Q4  ·  2019-10-01 → 2019-12-31

#### 1. On the Relationship between Self-Attention and Convolutional Layers

`2019-11-08` · **89** citations · _venue:_ ICML

> **Research question.** Do self-attention layers operate similarly to convolutional layers?

**Core contribution.** The paper provides theoretical proof and empirical evidence that self-attention layers can express convolutional layers, and shows that in practice they often learn to do so.

**Key findings.**
- A multi-head self-attention layer with sufficient heads can express any convolutional layer (Theorem 1).
- With quadratic positional encoding, self-attention heads learn to attend to grid-like patterns around each query pixel, similar to convolutional kernels.
- With learned positional encoding, some heads also learn localized attention patterns, while others use content-based attention.
- Self-attention models can learn a combination of local (convolution-like) and global attention.

_Target models:_ self-attention model

---

#### 2. Do Attention Heads in BERT Track Syntactic Dependencies?

`2019-11-27` · **88** citations · _venue:_ arXiv

> **Research question.** Do attention heads in BERT and RoBERTa implicitly capture syntactic dependency relations?

**Core contribution.** Some attention heads in BERT and RoBERTa specialize in tracking specific syntactic dependency types, but no single head performs holistic parsing well, and fine-tuning has limited impact on attention patterns.

**Key findings.**
- Some attention heads capture dependency types like nsubj and obj with high accuracy compared to baselines.
- No attention head forms complete parse trees effectively, as shown by the MST method.
- Fine-tuning on MNLI improves accuracy for long-distance clausal dependencies but degrades short-distance ones.
- Fine-tuning on CoLA does not significantly affect dependency tracking accuracy.

_Target models:_ BERT (cased), BERT (uncased), RoBERTa, CoLA-BERT, MNLI-BERT, random BERT

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

#### 2. exBERT: A Visual Analysis Tool to Explore Learned Representations in Transformer Models

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

#### 3. Theoretical Limitations of Self-Attention in Neural Sequence Models

`2020-03-31` · **124** citations · _venue:_ TACL

> **Research question.** What are the theoretical computational capabilities of self-attention to model formal languages, specifically hierarchical structures and periodic finite-state languages?

**Core contribution.** The paper shows that self-attention cannot model periodic finite-state languages (like PARITY) or hierarchical structure (like DYCK) unless the number of layers or heads increases with input length.

**Key findings.**
- Transformers with hard attention cannot recognize the regular language PARITY or the context-free language DYCK.
- For soft attention, transformers cannot achieve perfect cross-entropy when modeling distributions over these formal languages.
- The limitations hold unless the number of layers or heads grows with the input length.
- The results are asymptotic and may not apply to short input sequences.

---

### 2020 Q2  ·  2020-04-01 → 2020-06-30

#### 1. Synthesizer: Rethinking Self-Attention in Transformer Models

`2020-05-02` · **198** citations · _venue:_ ICML

> **Research question.** What is the true importance and contribution of the dot product-based self-attention mechanism in Transformer models? Can we do without dot product self-attention and content-based memory-like self-attention altogether?

**Core contribution.** Proposes Synthesizer, a Transformer model that learns synthetic attention weights without token-token interactions, and shows that dot product self-attention is not strictly necessary for competitive performance.

**Key findings.**
- Random alignment matrices perform competitively with dot product attention.
- Learning attention weights from token-token interactions is useful but not crucial.
- Synthesizer models achieve competitive performance across machine translation, language modeling, text generation, and language understanding benchmarks.
- When composed with dot product attention, Synthesizers consistently outperform vanilla Transformers.

_Target models:_ Transformer, Synthesizer, Dynamic Convolutions, LightConv, Linformer, Universal Transformer

---

#### 2. Knowledge Distillation from Internal Representations

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

#### 1. The Stem Cell Hypothesis: Dilemma behind Multi-Task Learning with Transformer Encoders

`2021-01-01` · **103** citations · _venue:_ EMNLP

> **Research question.** Why does multi-task learning (MTL) with transformer encoders on distinct core NLP tasks lead to worse performance than single-task learning, and is there a subset of attention heads that are naturally talented for many tasks but cannot be jointly trained for all?

**Core contribution.** The paper proposes the Stem Cell Hypothesis, which states that a subset of attention heads (stem cells) are naturally talented for many tasks but cannot be jointly trained for multiple distinct tasks, leading to interference and worse performance in multi-task learning.

**Key findings.**
- Multi-task learning on five core NLP tasks (POS, NER, DEP, CON, SRL) results in lower performance than single-task learning for all tasks.
- Pruning analysis reveals that all five tasks rely on a similar set of attention heads, primarily in middle layers (5-8), which are termed 'stem cells'.
- Even without fine-tuning, certain attention heads (stem cells) show high probing accuracy for specific linguistic labels, demonstrating their pluripotency.
- During single-task learning, stem cells become specialized for the task, but during multi-task learning, they lose specialization due to conflicting training signals.

_Target models:_ BERT, RoBERTa, ELECTRA, DeBERTa

---

#### 2. Pretrained Transformers as Universal Computation Engines

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

#### 3. Attention is Not All You Need: Pure Attention Loses Rank Doubly\n Exponentially with Depth

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

### 2021 Q2  ·  2021-04-01 → 2021-06-30

#### 1. LoRA: Low-Rank Adaptation of Large Language Models

`2021-06-17` · **2373** citations · _venue:_ ICLR

> **Research question.** How can we efficiently adapt large pre-trained language models to downstream tasks without the high cost of full fine-tuning?

**Core contribution.** Proposes Low-Rank Adaptation (LoRA), which freezes pre-trained model weights and injects trainable rank decomposition matrices into each Transformer layer, greatly reducing the number of trainable parameters for downstream tasks while maintaining or improving model quality.

**Key findings.**
- LoRA reduces the number of trainable parameters by 10,000 times and GPU memory requirement by 3 times for GPT-3 175B compared to full fine-tuning.
- LoRA performs on-par or better than fine-tuning in model quality on RoBERTa, DeBERTa, GPT-2, and GPT-3, despite having fewer trainable parameters and no additional inference latency.
- The adaptation matrix ΔW has a low intrinsic rank; for GPT-3, a rank as low as 1 or 2 suffices for good performance on the studied tasks.
- LoRA amplifies task-specific directions in the weight matrices that are present but not emphasized in the pre-trained model.

_Target models:_ RoBERTa, DeBERTa, GPT-2, GPT-3

---

#### 2. Self-Attention Attribution: Interpreting Information Interactions Inside Transformer

`2021-05-18` · **163** citations · _venue:_ AAAI

> **Research question.** How do input features interact with each other inside Transformer to reach predictions? The paper proposes a self-attention attribution method to interpret these information interactions.

**Core contribution.** Proposes a self-attention attribution method (ATTATTR) based on integrated gradients to interpret information interactions inside Transformer, and demonstrates its utility for head pruning, visualizing information flow, and adversarial attacks.

**Key findings.**
- Attention weights do not always correlate well with their contributions to model prediction.
- The proposed attribution method can identify important attention heads, and pruning heads based on attribution scores is effective.
- The important heads are consistent across different datasets for similar tasks.
- Attribution trees can visualize the hierarchical information flow inside Transformer.

_Target models:_ BERT-base-cased

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

### 2023 Q1  ·  2023-01-01 → 2023-03-31

#### 1. Why Can GPT Learn In-Context? Language Models Secretly Perform Gradient Descent as Meta-Optimizers

`2023-01-01` · **135** citations · _venue:_ ACL

> **Research question.** What is the working mechanism of in-context learning in GPT models? The paper investigates whether in-context learning can be understood as a form of implicit finetuning.

**Core contribution.** The paper explains in-context learning as implicit finetuning by showing a dual form between Transformer attention and gradient descent, and provides empirical evidence that ICL behaves similarly to explicit finetuning.

**Key findings.**
- Transformer attention has a dual form of gradient descent.
- In-context learning updates attention outputs and weights in a direction similar to explicit finetuning.
- In-context learning covers most of the correct predictions made by a finetuned model.
- In-context learning and finetuning pay similar attention to training tokens.

_Target models:_ GPT 1.3B, GPT 2.7B, GPT 350M

---
