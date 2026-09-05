# Perceptual-boundary-constrained generative inverse design with structured serendipity capture for discovering new inorganic color pigments

## Motivation

The original query asks whether more color pigments can be discovered. The historical record suggests yes, because accidental inorganic phases such as YInMn Blue remain possible, but the deeper bottleneck is not a shortage of hypothetical compounds; it is the absence of a controlled route from desired perceived color and practical constraints to synthesizable candidate materials. This can be framed by problematizing the assumption that pigment discovery is exhausted and by redirecting attention to the discovery pathway itself [Alvesson et al., 2011](https://doi.org/10.5465/amr.2011.59330882). Current pigment discovery remains empirical because composition, crystal structure, defects, optical absorption, perceived color, stability, toxicity, and manufacturability are not jointly optimized. A constrained generative search over historical formulation spaces provides a transferable mechanism for proposing candidates under multiple practical constraints [Meda et al., 2025](https://doi.org/10.63665/aajed.v01i01.02). At the same time, pigment chemistry still produces unexpected colors and phases, so a structured way to capture anomalies and failed routes can convert serendipity into evidence rather than discarded noise [Hauser et al., 2020](https://doi.org/10.2533/chimia.2020.247). The proposed idea therefore targets new pigment materials, not new human color categories, by making pigment search inverse, perception-aware, and anomaly-sensitive.

## Method

This method is intended to solve the lack of a falsifiable, perception-aware inverse route to new practical inorganic pigments; it can be divided into five parts: a latent generative model of feasible pigment compositions and structure prototypes, a human-vision-aware color and novelty evaluator, a constrained posterior sampler that proposes candidates conditioned on stability and perceptual-boundary targets, an anomaly-capture ledger that converts unexpected synthesis outcomes into labeled training cases, and a closed-loop experimental validation and model-update protocol.

**1. Feasible-pigment latent space from historical and computed materials data**

Build a latent generative model over inorganic pigment compositions and structure prototypes using known pigments, stable inorganic phases, and failed synthesis records. The model learns feasible regions of composition-structure space through historical clustering and constraint-aware latent representations, analogous to generative exploration of constrained formulation spaces in paint innovation [Meda et al., 2025](https://doi.org/10.63665/aajed.v01i01.02). Input features include oxidation-state balance, ionic-radius compatibility, electronegativity, predicted formation energy, toxicity flags, and earth-abundance indicators. The output is a proposal distribution, not a final answer, so that downstream constraints can shape candidate selection.

**2. Human-vision-aware color and novelty evaluator**

Convert predicted or measured spectral reflectance into perceptual color coordinates and compute novelty relative to the known pigment gamut. A surrogate optical model estimates reflectance from composition, structure, defect, and particle-morphology features when direct measurement is unavailable. This operationalizes the problematized distinction between physical spectral novelty and perceived color relevance [Alvesson et al., 2011](https://doi.org/10.5465/amr.2011.59330882). The evaluator estimates hue, saturation, brightness, color strength, metamerism risk, and distance from the convex hull of known pigments under multiple standard illuminants. Candidates are scored not merely by unusual spectra but by whether the spectrum yields a practically distinguishable, stable, and useful visual color.

**3. Constraint-aware inverse posterior sampler**

Use Markov Chain Monte Carlo or related posterior sampling in the latent pigment space to propose candidates conditioned on target perceptual novelty, phase stability or metastability, non-toxicity, synthesis feasibility, and scalability. This adapts constraint-aware generative search from paint formula innovation to inorganic pigment inverse design [Meda et al., 2025](https://doi.org/10.63665/aajed.v01i01.02). The sampler can be conditioned on a desired region near the boundary of the known perceptual gamut, thereby seeking pigments that expand usable color performance without requiring impossible new color categories.

**4. Structured serendipity capture ledger**

Record unexpected colors, phases, morphologies, stability behaviors, and failed reactions in a structured ledger that assigns each anomaly a follow-up priority. This borrows the principle that unexpected outcomes can be organized into a productive discovery loop rather than treated as waste, as demonstrated in serendipitous odorant discovery [Hauser et al., 2020](https://doi.org/10.2533/chimia.2020.247). The ledger links each anomaly to synthesis conditions, characterization evidence, predicted parent composition, and a decision rule for retesting, model updating, or discard.

**5. Closed-loop validation and model updating**

Iterate prediction, synthesis, characterization, and validation, updating the latent model with both intended candidates and anomaly-ledger entries. The loop uses constraint-aware proposal generation to focus the search and structured anomaly capture to preserve unexpected leads [Meda et al., 2025](https://doi.org/10.63665/aajed.v01i01.02); [Hauser et al., 2020](https://doi.org/10.2533/chimia.2020.247). Success is defined by phase-pure or retained metastable material, acceptable safety, durable color, and perceptual novelty, not merely by a new composition.

## References

1. Matas Alvesson, J. Sandberg. GENERATING RESEARCH QUESTIONS THROUGH PROBLEMATIZATION. 2011. Academy of Management Review. https://doi.org/10.5465/amr.2011.59330882
2. Raviteja Meda. Enhancing Paint Formula Innovation Using Generative AI and Historical Data Analytics. 2025. American Advanced Journal for Emerging Disciplinaries. https://doi.org/10.63665/aajed.v01i01.02
3. Nicole Hauser, P. Kraft, E. M. Carreira. The Serendipitous Discovery of a Rose Odorant. 2020. CHIMIA International Journal for Chemistry. https://doi.org/10.2533/chimia.2020.247
