# Deferred reproductive capital: sex-specific invasion thresholds and sexually antagonistic cohort storage as drivers of reproductive evolvability

## Motivation

The original query asks what drives reproduction in living systems. In evolutionary ecology, a key answer is that heritable variation in reproductive timing shapes evolvability [Author et al., 2025](https://openalex.org/W4416670776), nonrandom mating can alter genetic variance and adaptation under changing climates [Author et al., 2021](https://openalex.org/W3141331266), sex-specific selection assigns different fitness consequences to male and female reproductive traits [Author et al., 2023](https://openalex.org/W4366817449), and reproduction-survival trade-offs shape sex-biased longevity [Author et al., 2025](https://openalex.org/W4412678672). However, these drivers remain separated: current work does not predict when a reproductive strategy increases fitness and evolvability versus when it becomes a constraint under unreliable phenological cues. The primary testable hypothesis is that a covariance-weighted deferred-capital threshold causally determines the invasion of sex-specific deferred recourse and, through sexually antagonistic cohort storage, the maintenance of additive genetic variance in reproductive timing. To avoid a same-field recombination, the idea imports elasticity-based resource valuation from economics [Author et al., 2013](https://openalex.org/W2036680378) and dynamic allocation optimization in temporally varying environments from economics [Author et al., 1986](https://openalex.org/W2029353030), then tests the resulting theory in a demogenetic individual-based framework from computational evolutionary modeling [Author et al., 2020](https://openalex.org/W3015117265).

## Method

This method is intended to solve the lack of a predictive, sex-aware, environmentally contingent mechanism linking genetic variance in reproductive timing, mate acquisition, and survival trade-offs; it can be divided into 5 parts: (1) deferred reproductive capital state variables, (2) a sex-specific invasion inequality, (3) sexually antagonistic cohort storage genetics, (4) a demogenetic individual-based implementation, and (5) controlled hypothesis tests.

**1. Deferred reproductive capital state and sex-specific conversion functions**

Represent each individual as having sex-specific deferred reproductive capital K_s, refractory delay tau_s, decay rate delta_s, maintenance cost m_s, and survival cost lambda_s. At each reproductive bout, an individual divides available reproductive resources between immediate effort and K_s. Female K_s converts into future gamete or offspring production, while male K_s converts into future mate attraction, competition, or mating effort, reflecting sex-specific selection on fertility and mating success [Author et al., 2023](https://openalex.org/W4366817449). The survival cost of stored capital is coupled to reproduction-survival trade-offs and sex-biased longevity [Author et al., 2025](https://openalex.org/W4412678672). Genetic variance in reproductive timing determines when stored capital can be deployed, linking the mechanism to trait evolvability [Author et al., 2025](https://openalex.org/W4416670776).

**2. Sex-specific invasion condition for deferred recourse**

Derive an invasion condition for a rare deferred-capital modifier. Let q_t be a cue to immediate mating or pollination opportunity and F_s(tau_s) be future opportunity after the refractory delay. The expected marginal benefit of storing one unit of capital is B_s = eta_s * l_s(tau_s) * E_s[dW/dK_s] * Cov(q_t, F_s(tau_s)), where eta_s is conversion efficiency, l_s is refractory survival, and E_s[dW/dK_s] is a sex-specific fitness elasticity. The cost is C_s = m_s * tau_s + delta_s * tau_s + lost immediate reproduction + survival decrement. The modifier invades when the sex-weighted sum of B_s - C_s is positive. The elasticity term is borrowed from economics resource-elasticity theory [Author et al., 2013](https://openalex.org/W2036680378), and the cue-contingent allocation rule adapts economic optimization in temporally varying environments [Author et al., 1986](https://openalex.org/W2029353030).

**3. Sexually antagonistic cohort storage**

Add genetic architecture in which deferred-capital alleles have sex-limited or antagonistic pleiotropic effects: an allele that increases female reserve banking or refractory delay reduces male immediate mating effort, display, or flowering duration, and vice versa, because both sexes draw on a shared resource budget. This creates cohort storage: alleles can be expressed later through deferred capital and can be beneficial in one sex or temporal cohort while costly in another. This mechanism is designed to maintain additive genetic variance in reproductive timing beyond simple environmental buffering [Author et al., 2025](https://openalex.org/W4416670776), to interact with assortative-mating effects on variance [Author et al., 2021](https://openalex.org/W3141331266), and to reflect sex-specific selection on reproductive traits [Author et al., 2023](https://openalex.org/W4366817449).

**4. Demogenetic individual-based implementation**

Implement the theory in an individual-based model that couples inheritance, demography, mate acquisition, fertility, survival, and environmental stochasticity, following demogenetic modeling approaches [Author et al., 2020](https://openalex.org/W3015117265). Individuals carry polygenic loci for reproductive timing [Author et al., 2025](https://openalex.org/W4416670776), a deferred-capital modifier locus, and trait loci for sex-specific reproductive traits. Mating requires temporal overlap and can later include assortative mating by reproductive timing [Author et al., 2021](https://openalex.org/W3141331266). Reproduction reduces survival according to sex-specific trade-offs [Author et al., 2025](https://openalex.org/W4412678672).

**5. Controlled comparisons and observables**

Define matched controls: immediate-only cue plasticity, fixed-delay, random-deferral, noncontingent reserve bank, sex-neutral deferred capital, and deferred capital without antagonistic pleiotropy. Observables include invasion frequency, additive genetic variance in reproductive timing, lag to environmental optimum, sex-specific lifetime reproductive success, longevity, and realized B_s/C_s. These controls separate information-based deferral from generic delay, storage, bet-hedging, and sex-specific mortality effects, while lag and variance metrics connect the mechanism to adaptation and evolvability [Author et al., 2021](https://openalex.org/W3141331266). Longevity and survival outputs connect it to life-history trade-offs [Author et al., 2025](https://openalex.org/W4412678672).

## References

1. Genetic variance in reproductive timing contributes to trait evolvability. 2025. https://openalex.org/W4416670776
2. Assortative mating can help adaptation of flowering time to a changing climate: Insights from a polygenic model. 2021. https://openalex.org/W3141331266
3. Sex-specific selection patterns in a dioecious insect-pollinated plant. 2023. https://openalex.org/W4366817449
4. Asymmetric life-history trade-offs shape sex-biased longevity patterns. 2025. https://openalex.org/W4412678672
5. Resource Elasticity of Offspring Survival and the Optimal Evolution of Sex Ratios. 2013. https://openalex.org/W2036680378
6. An optimisation principle for sex allocation in a temporally varying environment. 1986. https://openalex.org/W2029353030
7. A demogenetic individual based model for the evolution of traits and genome architecture under sexual selection. 2020. https://openalex.org/W3015117265
