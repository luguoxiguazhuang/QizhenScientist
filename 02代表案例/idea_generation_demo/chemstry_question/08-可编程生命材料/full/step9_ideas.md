# Cleavage-Nucleated Condensate Controllers for Set-Point Programming of Living Hydrogel Materials

## Motivation

Programming nonliving matter into living materials requires more than immobilizing cells; it requires a controller that senses local material state, computes a response, and resets without continuous human intervention. Hybrid sol-gel materials can host living microorganisms and connect them to inorganic/organic matrices [Author et al., 2022](https://openalex.org/W4220814513). PenTag provides site-specific covalent protein-polymer conjugation, addressing unstable noncovalent interfacing [Author et al., 2023](https://openalex.org/W4377098401). Phase-separated synthetic organelles demonstrate that biomolecular condensates can organize sensing and regulation in living systems [Author et al., 2024](https://openalex.org/W4402617058). Photodegradable hydrogels show that light can impose spatiotemporal control on bacterial transport and delivery [Author et al., 2025](https://openalex.org/W4413929537). The remaining bottleneck is not a single part but a closed-loop programming layer that couples matrix damage to localized biological actuation while preserving viability and avoiding diffusible crosstalk. Control engineering supplies the missing organizing principle: robust closed-loop feedback can maintain a controlled variable despite disturbances [Author et al., 2020](https://openalex.org/W3214605415), and stochastic model predictive control shows how noisy biological states can be regulated under constraints [Author et al., 2024](https://openalex.org/W4403706347). The proposed idea transfers this principle into the material itself: photocleavage of engineered PenTag anchors creates a local error signal, and the released multivalent fragment directly nucleates a phase-separated condensate that acts as a local controller, recruits repair effectors, and is consumed during repair.

## Method

This method is intended to solve the lack of a localized, closed-loop programming layer for living materials; it can be divided into 4 parts: (1) a covalent photocleavable PenTag anchor that converts matrix damage into a local multivalent fragment, (2) a cleavage-nucleated phase-separated condensate that serves as the local damage detector/controller, (3) a repair-and-reset module that restores crosslinks and consumes the damage signal, and (4) an optional external model-predictive light scheduler for spatiotemporal target tracking. The primary hypothesis is that cleavage-generated multivalent fragments, by directly nucleating local condensates, cause spatially confined repair and stiffness set-point maintenance, and that this effect is not explained by soluble ligand diffusion, nonspecific enzyme adsorption, or light-induced matrix changes.

**1. Covalent photocleavable PenTag damage-to-signal anchor**

A PenTag-compatible anchor protein is covalently attached to a living-cell hydrogel or sol-gel matrix [Author et al., 2022](https://openalex.org/W4220814513) [Author et al., 2023](https://openalex.org/W4377098401). The anchor contains, in order, a matrix-binding domain, a photocleavable peptide linker, a multivalent condensate-nucleating domain, and an effector-recognition motif. The design is inspired by photodegradable matrices that translate light into controlled degradation [Author et al., 2025](https://openalex.org/W4413929537), but here cleavage is not only a release event; it creates a defined biochemical controller fragment. In intact material the nucleator is immobilized and below the effective saturation threshold; after local damage it is released in the wounded voxel.

**2. Cleavage-nucleated condensate controller**

The released multivalent fragment directly nucleates a phase-separated condensate at the damaged site, using the same physical principle as synthetic organelles but with material cleavage, not a diffusible metabolite, as the initiating cue [Author et al., 2024](https://openalex.org/W4402617058). Reversible weak interactions with residual matrix or cell-surface anchors keep the condensate local, making phase separation itself the spatial damage detector. In control-theoretic terms, the condensate volume fraction is the controller state and the cleaved-anchor concentration is the error signal [Author et al., 2020](https://openalex.org/W3214605415).

**3. Repair effector and autonomous reset**

Condensates recruit a repair effector, such as a covalent crosslinking enzyme or PenTag-compatible ligase, through a client-binding motif [Author et al., 2023](https://openalex.org/W4377098401). The condensate also recruits a reset protease or adapter that consumes the nucleator fragment after repair. This creates negative feedback: as crosslink density or local stiffness recovers, the controller fragment is degraded or sequestered, condensate volume decreases, and actuation stops. This implements an embodied anti-windup/reset law rather than a one-shot induction, following robust biological feedback design [Author et al., 2020](https://openalex.org/W3214605415).

**4. Predictive light programmer for secondary spatiotemporal targets**

After the local controller is validated, an external stochastic model-predictive controller selects light dose patterns from time-lapse measurements of cleavage fluorescence, condensate size, stiffness surrogate, and viability. The MPC treats light as the actuator and imposes constraints on maximum condensate saturation, cell viability, and allowed degradation, adapting the receding-horizon control concept used for stochastic gene regulatory networks [Author et al., 2024](https://openalex.org/W4403706347). This component is secondary and is used only after the primary local mechanism is established.

## References

1. Preparation of Hybrid Sol-Gel Materials Based on Living Cells of Microorganisms and Their Application in Nanotechnology. 2022. https://openalex.org/W4220814513
2. PenTag, a Versatile Platform for Synthesizing Protein-Polymer Biohybrid Materials. 2023. https://openalex.org/W4377098401
3. Metabolite-responsive Control of Transcription by Phase Separation-based Synthetic Organelles. 2024. https://openalex.org/W4402617058
4. Photodegradable Hydrogel Matrices for Spatiotemporal Control of Bacteria Transport and Delivery. 2025. https://openalex.org/W4413929537
5. Systems and control theoretic approaches to engineer robust biological systems. 2020. https://openalex.org/W3214605415
6. A computational framework for optimal and Model Predictive Control of stochastic gene regulatory networks. 2024. https://openalex.org/W4403706347
