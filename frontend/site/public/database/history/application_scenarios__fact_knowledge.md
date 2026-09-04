# Fact Knowledge

_A development timeline within **Application / Scenarios** — auto-generated_

## Background

Fact Knowledge covers how models store, retrieve, and edit factual associations — the ROME/MEMIT lineage among others.

## At a glance

- **Papers connected to this node in the DB:** 1960
- **Highlighted below (top by citation):** 30
- **Year span:** 2015 — 2023
- **Most-cited paper:** A mathematical theory of semantic development in deep neural networks — 239 citations

## Timeline

### 2015 Q3  ·  2015-07-01 → 2015-09-30

#### 1. Biologically Plausible, Human‐Scale Knowledge Representation

`2015-07-14` · **82** citations · _venue:_ Cognitive Science

> **Research question.** Can a neurally plausible model represent and manipulate structured knowledge at a human scale, specifically by encoding and decoding the main lexical relations in WordNet?

**Core contribution.** The paper presents a biologically plausible spiking neural network that uses a Vector Symbolic Architecture (VSA) to successfully encode and decode the structured knowledge in WordNet, demonstrating human-scale knowledge representation with plausible neural resource requirements.

**Key findings.**
- The model achieved 100% accuracy in decoding individual WordNet concepts.
- The model achieved 95.5% accuracy in traversing the WordNet hierarchy to arbitrary depth.
- The model achieved 99.6% accuracy in decoding sentences constructed from WordNet concepts bound to roles.
- The model uses about 2.5 million neurons, equivalent to approximately 14.7 mm² of cortex, which is biologically plausible and a significant improvement over prior approaches.

_Target models:_ spiking neural network (VSA-based)

---

### 2018 Q1  ·  2018-01-01 → 2018-03-31

#### 1. Pathologies of Neural Models Make Interpretations Difficult

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

#### 2. An Analysis of Attention Mechanisms: The Case of Word Sense Disambiguation in Neural Machine Translation

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

#### 3. An Interpretable Reasoning Network for Multi-Relation Question Answering

`2018-01-15` · **82** citations · _venue:_ COLING

> **Research question.** How to perform interpretable, hop-by-hop reasoning for multi-relation question answering over knowledge bases.

**Core contribution.** Introduces an interpretable reasoning network for multi-relation question answering that provides traceable, hop-by-hop reasoning paths.

**Key findings.**
- IRN outperforms baseline models on multiple QA datasets, including PathQuestion and WorldCup2014.
- IRN provides interpretable intermediate predictions, enabling traceable reasoning paths and failure diagnosis.
- IRN is robust to incomplete knowledge bases due to its multitask training schema.
- The model allows manual manipulation of intermediate predictions to improve final answer accuracy.

_Target models:_ Interpretable Reasoning Network (IRN)

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

### 2018 Q3  ·  2018-07-01 → 2018-09-30

#### 1. Integrated deep visual and semantic attractor neural networks predict fMRI pattern-information along the ventral object processing pathway

`2018-07-09` · **116** citations · _venue:_ Scientific Reports

> **Research question.** How does visual processing activate and interact with semantic representations during object recognition?

**Core contribution.** The paper combines a deep convolutional neural network model of vision with an attractor network model of semantics and shows that different stages of this integrated model explain fMRI pattern-information along the ventral object processing pathway.

**Key findings.**
- Visual layers of the DNN best explain activation patterns in early visual cortex.
- Posterior ventral temporal cortex is best explained by early stages of the semantic attractor network, corresponding to initial semantic processing.
- Perirhinal cortex is best explained by the final stages of the semantic attractor network, when detailed semantic representations are activated.
- The model learns associations between high-level visual regularities and semantic features, with shared semantic features activating more rapidly than distinctive features.

_Target models:_ Krizhevsky et al. DNN, attractor network, combined visuo-semantic model

---

### 2019 Q1  ·  2019-01-01 → 2019-03-31

#### 1. Self-Assembling Modular Networks for Interpretable Multi-Hop Reasoning

`2019-01-01` · **57** citations · _venue:_ EMNLP

> **Research question.** How can we perform interpretable multi-hop reasoning in question answering by dynamically assembling neural modules based on the question?

**Core contribution.** This paper presents an interpretable, controller-based self-assembling modular network for multi-hop reasoning, with novel modules (Find, Relocate, Compare, NoOp) designed for language reasoning, achieving improved performance and demonstrating interpretable compositional reasoning behavior.

**Key findings.**
- The proposed modular network significantly outperforms both a single-hop bi-attention baseline and the original convolution-based NMN on the HotpotQA dataset.
- The controller learns to decompose multi-hop questions into sub-questions and predicts module layouts that match expert-designed layouts with high accuracy.
- The model demonstrates robust compositional reasoning, as shown by strong performance on an adversarial evaluation that eliminates single-hop shortcuts.
- Intermediate modules can successfully infer bridge entities that connect distantly located supporting facts.

_Target models:_ Self-Assembling Neural Modular Network (NMN), BiDAF baseline, NMN (original)

---

### 2019 Q2  ·  2019-04-01 → 2019-06-30

#### 1. A mathematical theory of semantic development in deep neural networks

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

### 2019 Q3  ·  2019-07-01 → 2019-09-30

#### 1. How Does BERT Answer Questions? A Layer-Wise Analysis of Transformer Representations

`2019-09-11` · **42** citations · _venue:_ International Conference on Information and Knowledge Management

> **Research question.** How do Transformer models, specifically BERT, answer questions? The paper investigates whether Transformers answer questions decompositionally, whether specific layers solve different tasks, how fine-tuning influences the inner state, and whether layer-wise analysis can help understand prediction errors.

**Core contribution.** The paper shows that BERT's hidden states go through distinct phases (semantic clustering, entity matching, question-fact matching, answer extraction) when answering questions, similar to traditional NLP pipelines. Fine-tuning has minimal impact on semantic abilities, and errors can be detected early in the network.

**Key findings.**
- BERT's hidden states go through four phases: semantic clustering, connecting entities with mentions and attributes, matching questions with supporting facts, and answer extraction.
- Fine-tuning has little impact on the model's semantic abilities, as shown by probing tasks.
- Prediction errors can be recognized in the vector representations of even early layers.
- The positional embedding's effect is maintained even in late layers.

_Target models:_ BERT-base, BERT-large, GPT-2

---

### 2020 Q1  ·  2020-01-01 → 2020-03-31

#### 1. Interpreting Pretrained Contextualized Representations via Reductions to Static Embeddings

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

### 2020 Q2  ·  2020-04-01 → 2020-06-30

#### 1. Explaining Question Answering Models through Text Generation

`2020-04-12` · **44** citations · _venue:_ arXiv

> **Research question.** What is the knowledge in the LM used for answering a question?

**Core contribution.** Proposes a model for multi-choice question answering that generates textual hypotheses to explain the knowledge used by the language model, achieving performance comparable to end-to-end models.

**Key findings.**
- The model achieves 63.5% accuracy on the CSQA test set, comparable to end-to-end models using XLNet.
- Human evaluation shows generated hypotheses are reasonable, with a score of 0.74 for the best model (TOP-K=5 ST).
- Hypotheses provide insights into model errors, such as missing knowledge or semantic misunderstandings, aiding in debugging.
- The LM-based classifier relies on the hypotheses, as zeroing them out causes a performance drop of over 13% in some cases.

_Target models:_ GPT-2, XLNet

---

### 2020 Q4  ·  2020-10-01 → 2020-12-31

#### 1. Interpreting Graph Neural Networks for NLP With Differentiable Edge\n Masking

`2020-10-01` · **59** citations · _venue:_ ICLR

> **Research question.** How can we interpret Graph Neural Networks for NLP by identifying which edges in the input graph contribute to predictions?

**Core contribution.** Introduces GRAPH MASK, a post-hoc interpretation method for GNNs that learns to mask superfluous edges in a differentiable and amortized way, providing faithful attributions of edge importance.

**Key findings.**
- On a synthetic task, amortized GRAPH MASK accurately identifies important edges (F1=99.4), while baselines like erasure search and GNNExplainer suffer from hindsight bias and low recall.
- On QA, only 27% of edges are retained, with the majority in the bottom layer, and the model relies on COREF edges only when string match edges are not available.
- On SRL, the scalar gates in the original model act as scaling rather than filtering, and thus are not suitable for interpretation.
- For SRL, the GNN relies on dependency paths, especially for long-distance arguments, and the importance of paths varies between nominal and verbal predicates.

_Target models:_ R-GCN (synthetic task), De Cao et al. (2019) QA model, Marcheggiani & Titov (2017) SRL model

---

#### 2. Modifying Memories in Transformer Models

`2020-12-01` · **42** citations · _venue:_ arXiv

> **Research question.** How can we modify specific factual knowledge stored in Transformer models while ensuring the model's performance does not degrade on unmodified facts?

**Core contribution.** Introduces the task of modifying specific factual knowledge in Transformer models and shows that constrained layer-wise fine-tuning is an effective approach for this task.

**Key findings.**
- Constrained fine-tuning (using an ℓ∞ constraint on weight changes) effectively modifies factual knowledge while preserving accuracy on unmodified facts, outperforming unconstrained fine-tuning.
- Fine-tuning specific Transformer blocks (layers) is more effective than fine-tuning the entire model, with the best layer depending on the number of modified facts and the initial model state.
- Models with explicit symbolic memory (FaE) do not have a significant advantage in knowledge modification trade-offs compared to standard Transformer models like BERT-Large.
- Unconstrained fine-tuning on modified facts leads to catastrophic forgetting of unmodified facts, even when fine-tuning only a single layer.

_Target models:_ BERT-Base, BERT-Large, ALBERT-XXLarge, FaE

---

### 2021 Q1  ·  2021-01-01 → 2021-03-31

#### 1. Factual Probing Is [MASK]: Learning vs. Learning to Recall

`2021-01-01` · **235** citations · _venue:_ NAACL

> **Research question.** Can we interpret factual probing results as a lower bound on the factual information encoded in a language model, or do prompt-search methods learn from the training data?

**Core contribution.** Introduces OPTI PROMPT, a continuous prompt optimization method that improves factual probing accuracy, and shows that optimized prompts can exploit regularities in training data, complicating the interpretation of probing results.

**Key findings.**
- OPTI PROMPT improves top-1 accuracy on the LAMA benchmark by 6.4% over previous methods.
- Training data for factual probing contains regularities (e.g., class priors, lexical correlations) that can be exploited by prompt optimization methods.
- Optimized prompts can predict facts even when probing randomly initialized models, indicating they learn from training data rather than solely eliciting stored knowledge.
- Partitioning test facts into 'easy' (predictable from training data) and 'hard' subsets reveals that OPTI PROMPT improves on both, suggesting it is better at learning from data and eliciting facts from the language model.

_Target models:_ BERT-base-cased, BERT, RoBERTa, ALBERT

---

#### 2. Towards Interpreting and Mitigating Shortcut Learning Behavior of NLU models

`2021-01-01` · **63** citations · _venue:_ NAACL

> **Research question.** How can shortcut learning behavior in NLU models be explained by the long-tailed phenomenon, and how can it be mitigated?

**Core contribution.** The paper shows that shortcut learning in NLU models can be explained by a long-tailed distribution of features and introduces LTGR, a regularization method based on knowledge distillation to mitigate shortcut reliance and improve OOD generalization.

**Key findings.**
- NLU models have a strong preference for features at the head of the long-tailed distribution, which are shortcut features.
- Shortcut features are picked up during very early iterations of model training.
- LTGR improves generalization accuracy on out-of-distribution data while preserving accuracy on in-distribution data.
- LTGR can mitigate intentionally inserted shortcut features, such as in backdoor attacks.

_Target models:_ BERT base, DistilBERT

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

### 2021 Q2  ·  2021-04-01 → 2021-06-30

#### 1. Knowledge Neurons in Pretrained Transformers

`2021-04-18` · **42** citations · _venue:_ ACL

> **Research question.** How is factual knowledge stored in pretrained Transformers?

**Core contribution.** Introduces the concept of knowledge neurons and a gradient-based attribution method to identify them in pretrained Transformers, demonstrating their role in storing factual knowledge and enabling model editing.

**Key findings.**
- Knowledge neurons identified by the proposed attribution method are positively correlated with the expression of specific factual knowledge.
- Suppressing or amplifying the activation of identified knowledge neurons significantly decreases or increases the probability of the correct answer, respectively.
- Knowledge neurons are more activated by prompts expressing their corresponding fact than by control prompts.
- Knowledge neurons can be used to update or erase specific factual knowledge in the model with minimal impact on other knowledge.

_Target models:_ BERT-base-cased

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

#### 2. Knowledge Neurons in Pretrained Transformers

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

#### 3. KQA Pro: A Dataset with Explicit Compositional Programs for Complex Question Answering over Knowledge Base

`2022-01-01` · **73** citations · _venue:_ ACL

> **Research question.** How to create a dataset for complex question answering over knowledge bases that addresses the shortcomings of existing benchmarks by providing explicit reasoning processes and diverse, large-scale questions?

**Core contribution.** Introduces KQA Pro, a large-scale dataset for complex KBQA with explicit compositional programs (KoPL) and SPARQL queries, serving as a benchmark and diagnostic tool for evaluating reasoning capabilities.

**Key findings.**
- Existing state-of-the-art KBQA models perform significantly worse on KQA Pro compared to existing datasets, indicating its challenging nature.
- Models struggle with comparison reasoning due to lack of literal knowledge.
- Models perform poorly on questions whose answers are not observed in the training set.
- The KoPL parser can learn multiple semantically correct solutions for a question, similar to human learning.

_Target models:_ KVMemNet, EmbedKGQA, SRN, RGCN, RNN-based KoPL parser, BART-based KoPL parser

---

### 2022 Q4  ·  2022-10-01 → 2022-12-31

#### 1. Mass-Editing Memory in a Transformer

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

#### 2. Discovering Latent Knowledge in Language Models Without Supervision

`2022-12-07` · **45** citations · _venue:_ ICLR

> **Research question.** How can we discover latent knowledge in language models without supervision by finding consistent directions in activation space?

**Core contribution.** Introduces Contrast-Consistent Search (CCS), an unsupervised method to find latent knowledge in language model activations by enforcing logical consistency properties.

**Key findings.**
- CCS outperforms zero-shot accuracy by 4% on average across models and datasets.
- CCS is robust to misleading prompts, maintaining high accuracy even when models are prompted to generate incorrect answers.
- CCS finds a task-agnostic representation of truth that transfers well across different datasets.
- CCS does not merely recover model outputs and can leverage intermediate layers more effectively.

_Target models:_ T5, UnifiedQA, T0, GPT-J, RoBERTa, DeBERTa

---

### 2023 Q1  ·  2023-01-01 → 2023-03-31

#### 1. Editing Large Language Models: Problems, Methods, and Opportunities

`2023-01-01` · **78** citations · _venue:_ EMNLP

> **Research question.** How can we efficiently edit large language models to correct errors or update knowledge without negatively impacting performance on other inputs?

**Core contribution.** This paper provides a comprehensive survey and empirical analysis of model editing methods for large language models, and introduces a new benchmark for evaluating editing techniques.

**Key findings.**
- SERAC and ROME show superior performance on basic editing tasks, but SERAC struggles with portability.
- Model editing methods often fail to generalize to related content (portability) and can have side effects on locality.
- Some methods like MEMIT support batch editing up to 1000 edits but suffer from decreased locality.
- Sequential editing is challenging for methods that modify parameters, with performance degrading over multiple edits.

_Target models:_ T5, GPT-J, OPT-13B, GPT-NEOX-20B

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

#### 2. Language Models Don't Always Say What They Think: Unfaithful Explanations in Chain-of-Thought Prompting

`2023-05-07` · **75** citations · _venue:_ NeurIPS

> **Research question.** Do chain-of-thought (CoT) explanations faithfully represent the true reasons for a model's prediction, or can they be systematically unfaithful by being influenced by biasing features not mentioned in the explanations?

**Core contribution.** Chain-of-thought (CoT) explanations can be plausible yet systematically unfaithful; models can be influenced by biasing features (e.g., option order or suggested answers) without mentioning them in their explanations, rationalizing incorrect or biased predictions.

**Key findings.**
- Adding biasing features (e.g., 'Answer is Always A' or 'Suggested Answer') heavily influences model CoT predictions on BBH tasks, causing accuracy to drop by up to 36%.
- When biasing features point to incorrect answers, models frequently alter their CoT explanations to justify those incorrect bias-consistent predictions, sometimes with sound reasoning.
- On the social bias task (BBQ), models give plausible unfaithful explanations that support answers in line with stereotypes without mentioning the influence of stereotypes, using weak evidence inconsistently.

_Target models:_ GPT-3.5 (text-davinci-003), Claude 1.0

---

#### 3. Large Language Models as Commonsense Knowledge for Large-Scale Task Planning

`2023-05-23` · **41** citations · _venue:_ NeurIPS

> **Research question.** How can large language models be effectively used for large-scale task planning, and when is it better to use them as a world model versus as a policy?

**Core contribution.** Introduces LLM-MCTS, a method that combines LLMs as a commonsense world model and as a heuristic policy within Monte Carlo Tree Search for large-scale task planning, and proposes the minimum description length principle as a guide for choosing between model and policy use of LLMs.

**Key findings.**
- LLM-MCTS outperforms both MCTS alone and LLM-induced policies (GPT2 and GPT3.5) for complex, novel object rearrangement tasks.
- For multiplication and travel planning tasks, using LLM as a world model with an efficient search algorithm outperforms using LLM directly as a policy.
- The minimum description length (MDL) principle suggests that if the description length of the world model is substantially smaller than that of the policy, using LLM as a world model for planning is likely better than using it solely as a policy.
- In object rearrangement, LLM-MCTS effectively combines the LLM as a world model and as a heuristic policy to overcome the limitations of each individual approach.

_Target models:_ GPT2, GPT3.5, GPT4

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

#### 2. Language Models Represent Space and Time

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
