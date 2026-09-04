# SHAP

_A development timeline within **Mechanism Methods** — auto-generated_

## Background

SHAP attributes model outputs to input features via Shapley values, providing consistent local explanations.

## At a glance

- **Papers connected to this node in the DB:** 405
- **Highlighted below (top by citation):** 3
- **Year span:** 2017 — 2021
- **Most-cited paper:** A Unified Approach to Interpreting Model Predictions — 7621 citations

## Timeline

### 2017 Q2  ·  2017-04-01 → 2017-06-30

#### 1. A Unified Approach to Interpreting Model Predictions

`2017-05-22` · **7621** citations · _venue:_ NeurIPS

> **Research question.** How can we unify existing methods for interpreting model predictions and assign feature importance values that satisfy desirable properties?

**Core contribution.** Introduces SHAP, a unified framework for interpreting model predictions that unifies six existing methods and provides a unique solution with desirable properties, leading to new methods with improved computational performance and consistency with human intuition.

**Key findings.**
- SHAP unifies six existing feature attribution methods: LIME, DeepLIFT, Layer-Wise Relevance Propagation, Shapley regression values, Shapley sampling values, and Quantitative Input Influence.
- SHAP values are the unique solution in the class of additive feature attribution methods that satisfy local accuracy, missingness, and consistency.
- Kernel SHAP provides more accurate estimates with fewer model evaluations than previous sampling-based methods like Shapley sampling values.
- SHAP values are more consistent with human intuition than LIME and DeepLIFT in user studies on simple models.

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

### 2021 Q3  ·  2021-07-01 → 2021-09-30

#### 1. SHAP and LIME: An Evaluation of Discriminative Power in Credit Risk

`2021-09-17` · **267** citations · _venue:_ Frontiers in Artificial Intelligence

> **Research question.** How do SHAP and LIME compare in their ability to discriminate observations into groups using local feature weights in credit risk estimation?

**Core contribution.** SHAP values demonstrate superior discriminative power compared to LIME weights when used for clustering and prediction tasks on credit risk data, suggesting that XAI parameters can enhance data analysis methodologies.

**Key findings.**
- SHAP values yield higher silhouette scores and lower Davies-Bouldin indices than LIME weights in unsupervised clustering, indicating better cluster separation and cohesion.
- When used as input for Random Forest prediction, SHAP values achieve a higher mean AUC (0.864) compared to LIME weights (0.839), with statistical significance.
- The study confirms that XAI model parameters can be effectively used for post-processing feature extraction in credit risk applications.

_Target models:_ XGBoost

---
