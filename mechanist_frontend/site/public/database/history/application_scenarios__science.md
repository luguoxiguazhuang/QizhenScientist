# Science

_A development timeline within **Application / Scenarios** — auto-generated_

## Background

Science scenarios ground interpretability in scientific problem solving — reasoning, retrieval, verification.

## At a glance

- **Papers connected to this node in the DB:** 927
- **Highlighted below (top by citation):** 14
- **Year span:** 1986 — 2022
- **Most-cited paper:** Crystal Graph Convolutional Neural Networks for an Accurate and Interpretable Prediction of Material Properties — 2432 citations

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

### 2017 Q1  ·  2017-01-01 → 2017-03-31

#### 1. Deep Learning Models of the Retinal Response to Natural Scenes

`2017-02-06` · **164** citations · _venue:_ NeurIPS

> **Research question.** Can deep convolutional neural networks (CNNs) accurately model retinal responses to natural scenes, and what insights can they provide about retinal circuit mechanisms?

**Core contribution.** Convolutional neural networks (CNNs) accurately model retinal ganglion cell responses to natural scenes, outperform traditional linear-nonlinear and generalized linear models, generalize better across stimulus classes, and their internal structure reveals biological mechanisms like feedforward inhibition and adaptation.

**Key findings.**
- CNNs significantly outperform linear-nonlinear (LN) models and Generalized Linear Models (GLMs) in predicting retinal responses to both white noise and natural scenes.
- CNNs are less susceptible to overfitting than LN models and generalize better when tested on stimuli from a different distribution (e.g., natural scenes vs. white noise).
- CNNs trained on natural scenes learn a richer set of spatiotemporal features compared to those trained on white noise.
- Training CNNs with injected latent noise enables them to capture the sub-Poisson spiking variability observed in real retinal ganglion cells.

_Target models:_ convolutional neural network (CNN), recurrent neural network (RNN)

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

#### 1. Machine Learning Topological Invariants with Neural Networks

`2018-02-06` · **263** citations · _venue:_ Physical Review Letters

> **Research question.** Can neural networks learn topological invariants from local inputs and generalize to predict winding numbers for Hamiltonians with larger winding numbers not seen during training?

**Core contribution.** This paper demonstrates that neural networks can successfully learn global topological invariants from local Hamiltonian inputs, generalize to predict winding numbers beyond the training range, and internally learn the discrete winding number formula.

**Key findings.**
- Neural networks can predict topological winding numbers with nearly 100% accuracy, even for Hamiltonians with larger winding numbers not included in the training data.
- Convolutional networks outperform fully-connected networks due to their inherent translation symmetry, which matches the symmetry of the winding number problem.
- By analyzing the internal function of the convolutional network, the authors confirm it learns the discrete version of the winding number formula.
- Regularization techniques like L2 regularization can harm generalization when training data are noise-free, but become beneficial when noise is present.

_Target models:_ linear model, fully-connected network, convolutional network

---

### 2018 Q2  ·  2018-04-01 → 2018-06-30

#### 1. Crystal Graph Convolutional Neural Networks for an Accurate and Interpretable Prediction of Material Properties

`2018-04-06` · **2432** citations · _venue:_ Physical Review Letters

> **Research question.** How can we develop a machine learning framework that directly learns material properties from the atomic connection in a crystal, providing both accurate predictions and interpretable chemical insights?

**Core contribution.** The paper introduces the Crystal Graph Convolutional Neural Networks (CGCNN) framework, which directly learns material properties from crystal graphs, achieving DFT-level accuracy for diverse properties and enabling the extraction of local chemical environment contributions for interpretability.

**Key findings.**
- CGCNN achieves prediction accuracy comparable to DFT calculations for eight different material properties using around 10^4 training data points.
- The framework is interpretable, allowing extraction of site-specific energy contributions, as demonstrated for perovskite structures.
- The learned site energy information can be used to derive empirical rules for material design, significantly reducing the search space for high-throughput screening.
- A modified convolution function (Eq. 5) that differentiates interaction strengths between neighbors significantly improves prediction performance over a simpler version (Eq. 4).

_Target models:_ Crystal Graph Convolutional Neural Networks (CGCNN)

---

### 2019 Q2  ·  2019-04-01 → 2019-06-30

#### 1. Using attribution to decode binding mechanism in neural network models for chemistry

`2019-05-24` · **112** citations · _venue:_ Proceedings of the National Academy of Sciences

> **Research question.** Why do virtual screening models make the predictions they do? The paper aims to assess the influence of dataset biases on the prediction of protein binding.

**Core contribution.** The paper introduces a framework that uses attribution methods (Integrated Gradients) to test hypotheses about binding logic and reveal dataset bias in neural network models for chemistry, showing that models can achieve perfect accuracy while learning spurious correlations.

**Key findings.**
- Models trained on synthetic binding logics achieve perfect accuracy on held-out test sets but often have low attribution-AUC, indicating they learn spurious correlations.
- Attribution methods (Integrated Gradients) can be used to identify dataset biases and construct adversarial examples that fool the model.
- The attribution-AUC metric quantifies how well the model's attributions align with the hypothesized binding logic.
- In the ADRB2 dataset, the model achieves perfect accuracy but very low attribution-AUC, indicating it does not learn the correct binding logic.

_Target models:_ molecular graph convolution (GC) model, message passing neural network (MPNN)

---

### 2019 Q4  ·  2019-10-01 → 2019-12-31

#### 1. Uncertainty and interpretability in convolutional neural networks for semantic segmentation of colorectal polyps

`2019-11-20` · **176** citations · _venue:_ Medical Image Analysis

> **Research question.** How can recent advances in uncertainty estimation and interpretability be incorporated into Fully Convolutional Networks for polyp segmentation, and what performance improvements do they yield?

**Core contribution.** The paper demonstrates that enhancing Fully Convolutional Networks with batch normalization, transfer learning, and incorporating Monte Carlo Dropout for uncertainty estimation and Guided Backpropagation for interpretability leads to improved performance in polyp segmentation and provides insights into model predictions.

**Key findings.**
- EFCN-8 achieves a mean IoU of 76.06%, outperforming previous state-of-the-art methods.
- Inclusion of batch normalization and transfer learning significantly improves segmentation accuracy.
- ESegNet, with fewer parameters, achieves comparable results to FCN-8 but is outperformed by EFCN-8 when enhanced.
- Uncertainty estimation via Monte Carlo Dropout reveals high uncertainty at polyp borders and in false positive regions.

_Target models:_ EFCN-8, ESegNet

---

#### 2. Representation learning of genomic sequence motifs with convolutional neural networks

`2019-12-19` · **126** citations · _venue:_ PLoS Computational Biology

> **Research question.** How does CNN architecture, specifically convolutional filter size and max-pooling, influence the extent that sequence motif representations are learned by first layer filters?

**Core contribution.** The paper shows that CNN architecture controls whether first layer filters learn whole motif representations (localist) or partial motifs (distributed), with large max-pooling limiting hierarchical learning and encouraging interpretable filters.

**Key findings.**
- Large max-pool sizes relative to filter size encourage first layer filters to learn whole motif representations.
- Small max-pool sizes allow deeper layers to assemble partial motifs into whole motifs, leading to distributed representations in first layer.
- The representation learning principles generalize from synthetic sequences to in vivo genomic data.
- Overparameterizing the number of first layer filters reduces the fraction that learn motifs due to optimization dynamics.

_Target models:_ CNN

---

### 2020 Q2  ·  2020-04-01 → 2020-06-30

#### 1. Interpretation of machine learning models using shapley values: application to compound potency and multi-target activity predictions

`2020-05-02` · **639** citations · _venue:_ Journal of Computer-Aided Molecular Design

> **Research question.** How can Shapley values (SHAP) be used to interpret machine learning models, and how does the model-independent kernel SHAP compare to the exact tree SHAP for decision tree models? Additionally, how can SHAP be applied to interpret compound potency predictions and multi-target activity predictions?

**Core contribution.** The paper evaluates and applies the SHAP methodology for interpreting machine learning models in chemoinformatics, demonstrating that kernel SHAP provides reliable approximations compared to exact tree SHAP, and shows SHAP's utility for interpreting compound potency predictions and multi-target activity predictions.

**Key findings.**
- Kernel SHAP and tree SHAP yield highly correlated feature importance rankings for decision tree-based models in activity and potency prediction.
- SHAP analysis provides meaningful explanations for compound potency predictions and multi-target activity predictions, revealing features that drive model decisions.
- SHAP helps rationalize model errors by identifying features whose absence or presence leads to incorrect predictions.

_Target models:_ decision tree, random forest, extremely randomized trees, gradient boosting, deep neural network, multi-task deep neural network

---

#### 2. Discovering Symbolic Models from Deep Learning with Inductive Biases

`2020-06-19` · **269** citations · _venue:_ NeurIPS

> **Research question.** How can we combine deep learning and symbolic regression to extract interpretable symbolic models from neural networks, specifically Graph Neural Networks, to discover physical laws and improve generalization?

**Core contribution.** The paper introduces a framework that combines deep learning (specifically Graph Neural Networks with strong inductive biases) and symbolic regression to distill interpretable symbolic models from neural networks, enabling the discovery of physical laws and improving generalization.

**Key findings.**
- The method can extract known physical equations (e.g., force laws and Hamiltonians) from the learned representations of Graph Neural Networks.
- Applied to a cosmology dataset, the framework discovered a new analytic formula for predicting dark matter halo concentration from the mass distribution of nearby structures.
- The extracted symbolic expressions generalized to out-of-distribution data better than the original Graph Neural Network model.
- The framework demonstrates that neural networks can learn representations that are linear transformations of true physical quantities (e.g., forces) when appropriate inductive biases are applied.

_Target models:_ Graph Neural Network (GNN), Flattened Hamiltonian Graph Network (FlatHGN)

---

#### 3. On the Bottleneck of Graph Neural Networks and its Practical\n Implications

`2020-06-09` · **147** citations · _venue:_ ICLR

> **Research question.** Why do graph neural networks (GNNs) struggle to propagate information between distant nodes? The paper proposes that a bottleneck in aggregating messages across long paths causes over-squashing, hindering GNNs in long-range tasks.

**Core contribution.** Introduces the over-squashing phenomenon as a novel explanation for GNNs' limitation in long-range tasks and shows that breaking the bottleneck with a simple fully-adjacent layer improves performance without additional tuning.

**Key findings.**
- GNNs suffer from over-squashing when aggregating messages across long paths, which hinders long-range information propagation.
- GCN and GIN are more susceptible to over-squashing than GAT and GGNN.
- In synthetic benchmarks, over-squashing prevents GNNs from fitting long-range patterns even in training.
- Adding a fully-adjacent layer (FA) to existing GNN models improves performance on real-world datasets (QM9, ENZYMES, NCI1, VARMISUSE) without additional tuning.

_Target models:_ GCN, GIN, GAT, GGNN

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

### 2021 Q3  ·  2021-07-01 → 2021-09-30

#### 1. Biologically informed deep neural network for prostate cancer discovery

`2021-09-22` · **398** citations · _venue:_ Nature

> **Research question.** Can a biologically informed deep learning model achieve superior predictive performance and reveal novel molecular drivers of treatment resistance in prostate cancer?

**Core contribution.** The paper introduces P-NET, a biologically informed deep neural network that accurately predicts prostate cancer state and, through complete interpretability, reveals established and novel molecular drivers of treatment resistance, such as MDM4 and FGFR1.

**Key findings.**
- P-NET outperforms other machine learning models (e.g., linear models, SVMs, decision trees) in predicting prostate cancer state (primary vs. metastatic).
- P-NET's interpretability identified known prostate cancer drivers (AR, PTEN, RB1, TP53) and novel candidates (MDM4, FGFR1).
- MDM4 was validated in vitro as a contributor to treatment resistance and as a potential therapeutic target in TP53-wild-type prostate cancer.
- P-NET scores for primary tumors misclassified as resistant were associated with biochemical recurrence, suggesting clinical predictive utility.

_Target models:_ P-NET

---

### 2022 Q2  ·  2022-04-01 → 2022-06-30

#### 1. Interpretable and Explainable Machine Learning for Materials Science and Chemistry

`2022-06-03` · **271** citations · _venue:_ Accounts of Materials Research

> **Research question.** How can interpretability and explainability techniques be applied to machine learning models in materials science and chemistry to improve scientific discovery, build trust, and unveil correlations?

**Core contribution.** This paper summarizes applications of interpretability and explainability techniques for materials science and chemistry, discussing how these techniques can improve scientific studies by providing insights beyond predictive power, building trust, and revealing unexpected correlations.

**Key findings.**
- Interpretability in scientific machine learning involves trade-offs between explainability, completeness, and scientific validity (correctness).
- Intrinsically interpretable models (e.g., linear models, decision trees) offer direct interpretations but may lack correctness for complex phenomena.
- Extrinsic interpretation methods (e.g., SHAP, salience maps, attention mechanisms) can provide insights for complex models like deep neural networks.
- Interpretability techniques can generate scientific hypotheses and guide experiments, but they require careful validation to avoid over-interpretation and confusion with causation.

---
