/* Discovery III - mechanism-guided belief-head intervention.

   The page follows belief.tex, "Enhance AI intelligence through mechanism
   theory of belief": route the query, amplify the relevant heads, and compare
   the resulting gains and break rates with prompt hints. */

export default {
  id: 'belief-intervention',
  sections: [
    {
      type: 'chapter',
      title: 'From explaining the mechanism to using it',
      body:
        'The belief-head analysis identifies separate attention-head computations for preserving factual knowledge and reporting an attributed belief. The next question is whether that mechanism can be used directly: can the model be steered toward the belief state required by the query, without retraining the language model?',
    },
    {
      type: 'chapter',
      title: 'Route the query, then amplify the relevant heads',
      body: [
        'A lightweight probe first classifies the incoming query as World Knowledge (WK), Personal Belief (PB), or Attributed Belief (AB). That prediction determines which belief heads should be amplified during the forward pass.',
        'For a query asking for reality under a conflicting belief context, the intervention amplifies the PB heads. For a query asking what a person believes, it amplifies the AB head. The model weights remain unchanged; the intervention acts directly on the localized belief-state computation at inference time.',
      ],
    },
    {
      type: 'table',
      title: 'The same mechanism supports two different targets',
      caption:
        'Selective amplification steers the model toward the belief state required by the question, rather than toward one answer type in every context.',
      columns: [
        { key: 'frame', label: 'Query frame' },
        { key: 'context', label: 'Conflicting context' },
        { key: 'query', label: 'Question target' },
        { key: 'change', label: 'Prediction after intervention', mono: true },
      ],
      rows: [
        {
          frame: 'PB',
          context: 'James believes malaria is treated with antibiotics.',
          query: 'What is malaria really treated with?',
          change: 'antibiotics -> antimalarials',
        },
        {
          frame: 'AB',
          context: 'The speaker believes hydrogen has atomic number 3.',
          query: 'What does the speaker think?',
          change: '1 -> 3',
        },
      ],
    },
    {
      type: 'figure',
      figureId: 'belief-c-intervention',
      caption:
        'Mechanism-guided intervention improves belief-state reasoning across Pythia model scales and knowledge categories. In the malaria example, amplifying the PB heads restores the factual answer when the prompt contains James\'s conflicting belief.',
    },
    {
      type: 'chapter',
      title: 'Mechanism-guided intervention outperforms prompt hints',
      body: [
        'The comparison baseline is an oracle-style prompt hint that tells the model which belief frame the answer should follow. Prompt hints produce only small net gains: +1.6% for Pythia-410M, +3.1% for Pythia-1B, and +0.1% for Pythia-2.8B.',
        'Directly amplifying the relevant belief heads yields larger gains on all three models: +15.3%, +8.8%, and +3.5%, respectively. The result turns a mechanistic explanation into a targeted inference-time intervention.',
      ],
    },
    {
      type: 'table',
      title: 'Accuracy gains and preserved predictions',
      caption:
        'Break rate is the share of previously correct predictions that become incorrect after intervention. Low break rates show that the gains do not come from indiscriminately shifting model outputs.',
      columns: [
        { key: 'model', label: 'Model' },
        { key: 'hint', label: 'Prompt hint', mono: true, align: 'right' },
        { key: 'intervention', label: 'Head intervention', mono: true, align: 'right' },
        { key: 'breakRate', label: 'Break rate', mono: true, align: 'right' },
      ],
      rows: [
        { model: 'Pythia-410M', hint: '+1.6%', intervention: '+15.3%', breakRate: '1.4%' },
        { model: 'Pythia-1B', hint: '+3.1%', intervention: '+8.8%', breakRate: '1.4%' },
        { model: 'Pythia-2.8B', hint: '+0.1%', intervention: '+3.5%', breakRate: '1.1%' },
      ],
    },
    {
      type: 'chapter',
      title: 'The gains are broad and selective',
      body: [
        'Improvements appear across medical, chemical, and everyday knowledge categories. The intervention is therefore not limited to the examples used to illustrate it.',
        'At the same time, break rates remain low at 1.4%, 1.4%, and 1.1% across the three model scales. The intervention usually preserves answers the model already gets right while correcting belief-state errors.',
      ],
    },
    {
      type: 'callout',
      tone: 'caveat',
      title: 'What the result establishes',
      body:
        'This is a targeted improvement on belief-state reasoning, not a claim that attention-head amplification improves every kind of intelligence. It shows that a causally localized mechanism can be selected dynamically and modulated to improve the behavior it supports.',
    },
    { type: 'runSheet' },
  ],
}
