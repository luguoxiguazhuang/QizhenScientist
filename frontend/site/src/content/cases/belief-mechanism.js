/* Discovery II - belief-state reasoning and belief heads.

   The page follows belief.tex, "Reveal mechanism theory underlying AI
   behaviors": behavior, localization, causal validation, development during
   pretraining, and the resulting mechanism theory of belief. */

export default {
  id: 'belief-mechanism',
  sections: [
    {
      type: 'chapter',
      title: 'When facts and attributed beliefs conflict',
      body: [
        'Language models acquire extensive world knowledge during pretraining, but using it correctly requires selecting the representation that matches the question. When a prompt introduces another person\'s conflicting belief, models can lose track of whether they should answer from reality or from that person\'s point of view.',
        'The failure appears across GPT, Gemini, Claude, Qwen, Pythia, and OLMo. A model may know that the 2026 World Cup final is held in New Jersey, yet answer Los Angeles when asked about reality after being told that James believes it is in Los Angeles. In the opposite direction, it may answer New Jersey when asked what James believes.',
      ],
    },
    {
      type: 'table',
      title: 'Three query frames separate the two tasks',
      caption:
        'WK provides the factual baseline. PB tests whether world knowledge survives a conflicting belief context. AB tests whether the model can report the belief attributed to the subject.',
      columns: [
        { key: 'frame', label: 'Frame' },
        { key: 'question', label: 'What it asks' },
        { key: 'target', label: 'Correct answer', mono: true },
      ],
      rows: [
        {
          frame: 'WK - World Knowledge',
          question: 'Where is the 2026 World Cup final held?',
          target: 'New Jersey',
        },
        {
          frame: 'PB - Personal Belief',
          question: 'James believes it is in Los Angeles. Where is it in reality?',
          target: 'New Jersey',
        },
        {
          frame: 'AB - Attributed Belief',
          question: 'James believes it is in Los Angeles. Where does James think it is?',
          target: 'Los Angeles',
        },
      ],
    },
    {
      type: 'figure',
      figureId: 'belief-a-heads',
      caption:
        'The three query frames expose two separable computations in Pythia-1B. L4.H1 is the highest-ranked attention head for attributed-belief queries; L9.H1, L7.H5, and L12.H1 are among the highest-ranked heads for preserving the factual answer in personal-belief queries.',
    },
    {
      type: 'chapter',
      title: 'Localizing belief-state computation',
      body: [
        'Mechanist used the Fisher information matrix to rank attention heads by their importance to PB and AB performance. Pythia is the main model family because its intermediate checkpoints make it possible to study not only where the computation is located, but when it forms during pretraining.',
        'In Pythia-1B, L4.H1 ranks highest for AB, while L9.H1, L7.H5, and L12.H1 rank among the most important heads for PB. The ranking identifies candidates; causal ablation is what establishes their functional roles.',
      ],
    },
    {
      type: 'chapter',
      title: 'Causal ablation separates PB from AB',
      body: [
        'Zeroing L4.H1 reduces AB accuracy from 0.86 to 0.34, while PB accuracy remains at 0.71 and Pile perplexity changes only from 7.96 to 8.05. The effect is selective: removing the AB head disrupts attributed-belief reporting without broadly degrading the model.',
        'Zeroing the three PB heads produces the complementary result. PB accuracy falls from 0.78 to 0.21, AB accuracy rises to 1.00, and Pile perplexity increases only to 8.23. Together, the interventions show that PB and AB depend on separable attention-head computations that can interfere with one another.',
      ],
    },
    {
      type: 'table',
      title: 'Causal effects in Pythia-1B',
      caption:
        'Random-head and random-parameter ablations produce little change, ruling out general model damage as the explanation for these targeted effects.',
      highlight: 'Zero PB heads L9.H1, L7.H5, L12.H1',
      columns: [
        { key: 'run', label: 'Model state' },
        { key: 'ab', label: 'AB accuracy', mono: true, align: 'right' },
        { key: 'pb', label: 'PB accuracy', mono: true, align: 'right' },
        { key: 'ppl', label: 'Pile perplexity', mono: true, align: 'right' },
      ],
      rows: [
        { run: 'Intact Pythia-1B', ab: '0.86', pb: '0.78', ppl: '7.96' },
        { run: 'Zero AB head L4.H1', ab: '0.34', pb: '0.71', ppl: '8.05' },
        { run: 'Zero PB heads L9.H1, L7.H5, L12.H1', ab: '1.00', pb: '0.21', ppl: '8.23' },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'The mechanism generalizes beyond one model',
      body:
        'Belief heads are also identified in Pythia-2.8B, and the same localization and ablation pattern is reproduced in OLMo. This cross-family evidence supports a general belief-state mechanism rather than a quirk of one Pythia checkpoint.',
    },
    {
      type: 'chapter',
      title: 'Watching the mechanism emerge during pretraining',
      body: [
        'Across Pythia-1B checkpoints, AB performance emerges early and is already high by 2,000 training steps. PB develops later and more gradually. The two capabilities therefore do not appear at the same stage of pretraining.',
        'From 2k to 143k steps, each capability develops alongside the causal importance of its corresponding heads. Masking the AB head increasingly disrupts AB performance, while masking the PB heads removes the later gains in PB. The behavioral capability and its localized mechanism emerge together.',
      ],
    },
    {
      type: 'figure',
      figureId: 'belief-b-formation',
      title: 'Behavior and causal importance develop together',
      caption:
        'Attributed-belief performance appears early, while personal-belief performance develops later. At each stage, masking the corresponding belief heads selectively removes the capability they support.',
    },
    {
      type: 'chapter',
      title: 'A mechanism theory of belief',
      body: [
        'The results support a mechanism theory in which models develop separable PB and AB heads for using acquired knowledge under different belief contexts. Errors arise when these belief-state computations are not coordinated correctly.',
        'PB failures resemble altercentric interference: another person\'s belief distorts a factual judgment. AB failures resemble egocentric interference: the model\'s own world knowledge overrides the belief attributed to someone else. Because the heads and their causal roles emerge progressively across checkpoints, belief-state reasoning appears to be acquired during pretraining rather than created only by inference-time prompting.',
      ],
    },
    { type: 'runSheet' },
  ],
}
