# Math

_A development timeline within **Application / Scenarios** — auto-generated_

## Background

Math scenarios study arithmetic, algebra, and multi-step reasoning inside language models.

## At a glance

- **Papers connected to this node in the DB:** 1222
- **Highlighted below (top by citation):** 19
- **Year span:** 1986 — 2025
- **Most-cited paper:** Learning at the Knowledge Level — 202 citations

## Timeline

### 1986 Q3  ·  1986-07-01 → 1986-09-30

#### 1. Learning at the Knowledge Level

`1986-09-01` · **202** citations · _venue:_ Machine Learning

> **Research question.** How can the knowledge level (introduced by Newell) be applied to describe and classify machine learning programs?

**Core contribution.** The paper classifies learning systems into symbol level learning (SLL) and knowledge level learning (KLL), and further divides KLL into deductive (DKLL) and nondeductive (NKLL) types, analyzing the possibility of developing theories for each.

**Key findings.**
- The knowledge level provides a useful framework for classifying learning systems.
- Symbol level learning (SLL) systems improve performance without changing their knowledge level description.
- Knowledge level learning (KLL) systems exhibit an increase in their knowledge at the knowledge level.
- Deductive KLL (DKLL) can be described as knowledge flowing from the environment.

_Target models:_ LEX, LEX2, MRS, AQ11, ID3

---

### 2013 Q1  ·  2013-01-01 → 2013-03-31

#### 1. Modeling language and cognition with deep unsupervised learning: a tutorial overview

`2013-01-01` · **67** citations · _venue:_ Frontiers in Psychology

> **Research question.** How can deep unsupervised learning be used to model language and cognitive processing, and how do structured and abstract representations emerge from deep generative learning?

**Core contribution.** This tutorial overview argues that deep generative models offer a more plausible model of cortical learning and provide a way to bridge the gap between emergentist connectionist models and structured Bayesian models of cognition.

**Key findings.**
- Deep unsupervised learning in hierarchical generative models can discover structured and abstract representations of sensory data.
- Linear read-out accuracy of internal representations improves with the depth of the network, indicating more explicit encoding of relevant features.
- The approach can simulate human-like behavior in tasks such as numerosity comparison, producing psychometric functions that match human data.

_Target models:_ Restricted Boltzmann Machine (RBM), Deep Belief Network (DBN), Boltzmann Machine

---

### 2015 Q2  ·  2015-04-01 → 2015-06-30

#### 1. Tree-structured composition in neural networks without tree-structured architectures

`2015-06-16` · **40** citations · _venue:_ NeurIPS

> **Research question.** Can neural sequence models like LSTMs discover and implicitly use recursive compositional structure, and how do they compare to tree-structured models in exploiting such structure?

**Core contribution.** The paper demonstrates that LSTM sequence models can learn to exploit recursive tree structure in an artificial language, but they are less efficient than tree-structured models, requiring more data to achieve similar generalization.

**Key findings.**
- LSTM sequence models can generalize to unseen large recursive structures when given enough training data.
- Tree-structured models (TreeRNN, TreeRNTN, TreeLSTM) outperform LSTM sequence models in exploiting recursive structure, achieving better generalization with less data.
- All tested models (tree and sequence) are able to effectively interpret sentences with complex unseen recursive structures.
- The LSTM's performance decays more quickly and abruptly than tree models when training data is limited to smaller structures.

_Target models:_ LSTM, TreeRNN, TreeRNTN, TreeLSTM

---

### 2016 Q1  ·  2016-01-01 → 2016-03-31

#### 1. Diagnostic Classifiers: Revealing how Neural Networks Process Hierarchical Structure

`2016-01-01` · **38** citations · _venue:_ ICLR

> **Research question.** How do neural networks process hierarchical structure, and what strategies do they use for compositional semantics?

**Core contribution.** Introduces diagnostic classifiers as a method to test hypotheses about the strategies neural networks use, and shows that a GRU follows an incremental strategy for processing hierarchical arithmetic expressions.

**Key findings.**
- TreeRNNs can learn to compute the meaning of arithmetic expressions and generalize to longer expressions.
- The TreeRNN solution can be understood geometrically through projection, summation, and squashing steps.
- GRUs can also learn the task and generalize to longer expressions, but performance deteriorates with length and is worse for right-branching expressions.
- Diagnostic classifiers reveal that the GRU follows an incremental strategy rather than a recursive one.

_Target models:_ TreeRNN, Simple Recurrent Network (SRN), Gated Recurrent Unit (GRU)

---

### 2016 Q4  ·  2016-10-01 → 2016-12-31

#### 1. Capacity and Trainability in Recurrent Neural Networks

`2016-11-29` · **82** citations · _venue:_ ICML

> **Research question.** What are the capacity (per-parameter and per-unit) and trainability differences among various RNN architectures, and are gated models more computationally powerful or simply easier to train?

**Core contribution.** All common RNN architectures achieve similar per-parameter capacity (approximately 5 bits per parameter) and per-unit capacity, with performance differences primarily driven by trainability rather than inherent computational power; two novel architectures (UGRNN and +RNN) are introduced, with +RNN being easier to train for deep stacks.

**Key findings.**
- RNNs can store approximately 5 bits of task information per parameter.
- RNNs can store approximately one real number from their input history per hidden unit.
- Vanilla RNNs have slightly higher capacity but are far more difficult to train than gated architectures.
- Gated architectures (LSTM, GRU) are easier to train, especially for difficult tasks and deeper networks.

_Target models:_ vanilla RNN, IRNN, UGRNN, GRU, LSTM, +RNN

---

### 2018 Q1  ·  2018-01-01 → 2018-03-31

#### 1. Compositional Attention Networks for Machine Reasoning

`2018-03-08` · **132** citations · _venue:_ ICML

> **Research question.** How to design a neural network architecture that facilitates explicit and expressive reasoning for complex problem solving, specifically for visual question answering.

**Core contribution.** Introduces the MAC network, a differentiable architecture that performs explicit multi-step reasoning through a recurrent cell with separated control and memory, achieving state-of-the-art accuracy on the CLEVR visual reasoning dataset.

**Key findings.**
- The MAC network achieves state-of-the-art accuracy (98.9%) on CLEVR, halving the error rate of previous models.
- The model is computationally and data efficient, requiring 5x less data to achieve strong results and training faster than other models.
- The model performs particularly well on counting and numerical comparison questions, which are challenging for other VQA models.
- The separation between control and memory is a key design choice that improves generalization and learning speed.

_Target models:_ MAC network

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

#### 2. The Devil is in the Detail: Simple Tricks Improve Systematic Generalization of Transformers

`2021-01-01` · **54** citations · _venue:_ EMNLP

> **Research question.** How can simple tricks in model and training configurations improve the systematic generalization of Transformers on compositional reasoning tasks?

**Core contribution.** By revisiting basic model configurations (embedding scaling, early stopping, relative positional embedding, and Universal Transformer variants), the systematic generalization of Transformers can be drastically improved on several benchmark datasets.

**Key findings.**
- Relative positional embedding mitigates the EOS decision problem and significantly improves length generalization, achieving 100% accuracy on SCAN length split with cutoff 26.
- Early stopping based on IID validation data can be harmful for generalization; training longer often leads to better generalization performance.
- Embedding scaling, specifically Position Embedding Downscaling (PED), consistently improves generalization accuracy compared to standard scaling methods.
- Universal Transformers with relative positional embeddings often outperform standard Transformers on systematic generalization tasks.

_Target models:_ Transformers, Universal Transformers

---

### 2022 Q1  ·  2022-01-01 → 2022-03-31

#### 1. Grokking: Generalization Beyond Overfitting on Small Algorithmic Datasets

`2022-01-06` · **76** citations · _venue:_ arXiv

> **Research question.** How do neural networks generalize beyond memorization on small algorithmic datasets, and what is the phenomenon of 'grokking' where generalization improves long after overfitting?

**Core contribution.** Introduces and studies the 'grokking' phenomenon where neural networks suddenly generalize long after overfitting on small algorithmic datasets, and shows that weight decay significantly improves data efficiency.

**Key findings.**
- Neural networks exhibit 'grokking', a sudden improvement in generalization from chance to perfect performance long after overfitting, on small algorithmic datasets.
- Smaller training datasets require exponentially more optimization steps to achieve generalization, while converged performance remains perfect.
- Weight decay is highly effective at improving data efficiency, more than other regularization techniques like dropout or gradient noise.
- Visualization of learned embeddings reveals structures that correspond to the underlying mathematical objects, such as circular topology for modular addition.

_Target models:_ transformer

---

### 2022 Q2  ·  2022-04-01 → 2022-06-30

#### 1. Teaching Models to Express Their Uncertainty in Words

`2022-05-28` · **54** citations · _venue:_ TMLR

> **Research question.** Can a language model learn to express calibrated uncertainty about its own answers in natural language, and how does this compare to uncertainty from model logits?

**Core contribution.** GPT-3 can learn to express calibrated uncertainty about its own answers in natural language, and this calibration generalizes under distribution shift.

**Key findings.**
- GPT-3 can be fine-tuned to produce verbalized probabilities that are calibrated.
- Verbalized probability generalizes reasonably well to out-of-distribution tasks (Multi-answer and Multiply-divide).
- Verbalized probability is not simply reproducing the model's logits.
- The model's ability to generalize calibration relies on pre-existing latent representations that correlate with epistemic uncertainty.

_Target models:_ GPT-3, GPT-3 (davinci), GPT-3-175B

---

### 2022 Q3  ·  2022-07-01 → 2022-09-30

#### 1. What Can Transformers Learn In-Context? A Case Study of Simple Function Classes

`2022-08-01` · **59** citations · _venue:_ NeurIPS

> **Research question.** Can we train a model to in-context learn a function class? What is the relationship between tasks on which in-context learning succeeds and the training data?

**Core contribution.** Transformers can be trained from scratch to perform in-context learning of simple function classes (e.g., linear functions) with performance comparable to optimal estimators, and this ability generalizes under distribution shifts and extends to more complex function classes.

**Key findings.**
- Transformers can be trained to in-context learn linear functions with error comparable to the optimal least squares estimator.
- The trained model generalizes to out-of-distribution prompts, including shifts in input distributions, label noise, and mismatches between in-context examples and query inputs.
- Transformers can in-context learn more complex function classes (sparse linear functions, two-layer neural networks, decision trees) with performance matching or exceeding specialized algorithms like Lasso or gradient descent.
- Model capacity and problem dimensionality affect in-context learning performance; larger models handle higher dimensions and distribution shifts better.

_Target models:_ Transformer

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

#### 2. What learning algorithm is in-context learning? Investigations with linear models

`2022-11-28` · **85** citations · _venue:_ ICLR

> **Research question.** How does in-context learning in transformers work? Does it implicitly implement standard learning algorithms like gradient descent and ridge regression?

**Core contribution.** Transformers can implement standard learning algorithms like gradient descent and ridge regression during in-context learning, and trained in-context learners match these algorithms, transitioning between them based on model size and noise.

**Key findings.**
- Transformers can theoretically implement gradient descent and ridge regression for linear regression with sufficient depth and width.
- Trained in-context learners closely match ordinary least squares predictions on noiseless data.
- With noisy data, in-context learners match the minimum Bayes risk predictor (ridge regression with appropriate regularization).
- As model depth increases, in-context learners transition from gradient descent-like to ridge regression-like to ordinary least squares-like behavior.

_Target models:_ Transformer decoder

---

#### 3. Thinking Fast and Slow in Large Language Models

`2022-12-10` · **38** citations · _venue:_ PubMed

> **Research question.** Do large language models exhibit human-like intuitive reasoning errors, and how do more advanced models avoid these errors?

**Core contribution.** The paper shows that LLMs exhibit human-like intuitive errors (System 1), but more advanced models (ChatGPT, GPT-4) avoid these errors through chain-of-thought reasoning and well-developed intuition, performing hyperrationally.

**Key findings.**
- Early/smaller LLMs (up to GPT-3-curie) often give atypical responses, indicating poor task comprehension.
- Larger pre-ChatGPT models (GPT-3-davinci family) show a high tendency to give intuitive but incorrect responses, similar to human System 1 errors.
- ChatGPT models (especially GPT-4) show a high fraction of correct responses, often using chain-of-thought reasoning.
- Instructing GPT-3-davinci-003 to use chain-of-thought reasoning reduces intuitive errors and increases correct responses.

_Target models:_ GPT-1, GPT-2, GPT-3-babbage, GPT-3-curie, GPT-3-davinci-003, ChatGPT-3.5

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

### 2023 Q2  ·  2023-04-01 → 2023-06-30

#### 1. Faith and Fate: Limits of Transformers on Compositionality

`2023-05-29` · **71** citations · _venue:_ NeurIPS

> **Research question.** What are the limitations of transformer LLMs on compositional tasks, and are their errors incidental or do they signal fundamental limitations?

**Core contribution.** Transformer LLMs solve compositional tasks via linearized subgraph matching rather than systematic reasoning, and they exhibit exponential error accumulation with increased complexity.

**Key findings.**
- Transformers' accuracy on compositional tasks drops to near zero as task complexity increases.
- Fine-tuning on task-specific data leads to near-perfect in-domain performance but poor out-of-domain generalization.
- Transformers learn surface patterns (e.g., via relative information gain) rather than underlying algorithms.
- Correct predictions correlate with frequency of subgraph patterns in training data, indicating pattern matching.

_Target models:_ GPT3, ChatGPT, GPT4

---

#### 2. Large Language Models as Commonsense Knowledge for Large-Scale Task Planning

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

### 2025 Q3  ·  2025-07-01 → 2025-09-30

#### 1. The Illusion of Thinking

`2025-09-23` · **66** citations · _venue:_ SuperIntelligence - Robotics - Safety & Alignment

> **Research question.** What are the fundamental capabilities, scaling properties, and limitations of Large Reasoning Models (LRMs) that generate detailed thinking processes?

**Core contribution.** This paper systematically investigates the reasoning capabilities of Large Reasoning Models (LRMs) using controllable puzzle environments, revealing three performance regimes based on problem complexity and a fundamental scaling limit where reasoning effort decreases beyond a critical complexity threshold despite adequate token budget.

**Key findings.**
- Frontier LRMs face a complete accuracy collapse beyond certain problem complexities across different puzzle environments.
- There exist three distinct performance regimes: low-complexity tasks where standard LLMs outperform LRMs, medium-complexity tasks where LRMs show an advantage, and high-complexity tasks where both models collapse.
- LRMs exhibit a counterintuitive scaling limit: reasoning effort (thinking tokens) increases with problem complexity up to a point, then declines despite having an adequate token budget.
- Analysis of reasoning traces shows that in simpler problems, LRMs often identify correct solutions early but inefficiently continue exploring (overthinking), while at moderate complexity correct solutions emerge only after extensive exploration of incorrect paths.

_Target models:_ Claude 3.7 Sonnet (thinking), Claude 3.7 Sonnet, DeepSeek-R1, DeepSeek-V3, o3-mini, DeepSeek-R1-Qwen-32B

---
