/** Shared copy for the QiZhen Scientist site. */

export const SITE = {
  title: {
    lines: [
      '启真 Scientist',
      '面向化学的知识—实验闭环智能系统',
    ],
  },
  positioning: '面向化学的 AI Scientist',
  subtitle: '启于知识，验于实验，求真于科学。让 AI 从读文献、提建议，走向懂知识、做实验、会判断、能进化。',
  githubUrl: 'https://github.com/luguoxiguazhuang/QizhenScientist',
  paperAuthorCount: 19,
}

/* Two palettes per case, not one.

   `accent` / `bg` / `bgDeep` are the light-mode set, used by the case cards and
   the thumbnail artwork on the index. `accentDeep` / `deepBg` are the dark set,
   used by the case hero and the canvas field behind it.

   They cannot be the same values. All four `accent`s measure between 2:1 and
   3:1 against near-black — #4f46e5 indigo is the worst at about 2.1:1 — so on
   a dark hero they read as a smudge rather than as a colour, and any 12px mono
   label set in them is unreadable. Each `accentDeep` is the same hue lifted to
   roughly 7:1 on its own `deepBg`.

   The four `deepBg`s are near-black but not the same near-black: each is
   nudged a few points toward its case's hue, so the four heroes are
   distinguishable from one another without any of them stopping being black.
   The site's shared --section-deep (#16191a) is the neutral of the family. */
export const CASE_THEMES = {
  'subliminal-lab-safety': {
    accent: '#c4652d',
    bg: '#faf3eb',
    bgDeep: '#f2e4d4',
    accentDeep: '#e8925c',
    deepBg: '#1a1614',
    symbol: 'lab',
  },
  'belief-mechanism': {
    accent: '#4f46e5',
    bg: '#f2f2fb',
    bgDeep: '#e8e8f8',
    accentDeep: '#8f89f0',
    deepBg: '#15161f',
    symbol: 'network',
  },
  'belief-intervention': {
    accent: '#0f766e',
    bg: '#ecf7f5',
    bgDeep: '#d9efe8',
    accentDeep: '#5eb5aa',
    deepBg: '#121a19',
    symbol: 'signal',
  },
  'evo2-alpha-helix': {
    accent: '#15803d',
    bg: '#edf7f0',
    bgDeep: '#d8ebde',
    accentDeep: '#5cbd7c',
    deepBg: '#141a15',
    symbol: 'dna',
  },
}

/* One identity colour per sub-page, drawn from the four case accents above
   rather than from a second palette — the site should not have two unrelated
   colour systems in it.

   Assignment follows the nav order (Cases, Database, Skills, Quick Start), and
   Database keeps teal because the graph page was already built on it
   (--db-teal in DatabasePage.css points at --primary).

   Used for the rule under a page header and the rules over its figure rail.
   Measured on --section-base (#fbfaf7): database 5.24:1, skills 6.02:1,
   quickStart 4.81:1 all clear 4.5:1 and are safe on text; cases (#c4652d) is
   3.83:1 and is not. So the shared treatment stays decorative, and a page that
   wants its accent on text has to be one of the three that can carry it —
   which is why the install panel's success line uses it and nothing else
   does. */
export const PAGE_ACCENTS = {
  /* The home page has section rules like every other page, so it needs one too.
     --primary is the site's own colour rather than a fifth borrowed from a
     case, which is right for the page that is about the whole thing. It is the
     same value the Database page carries; the two are never on screen together,
     and inventing a fifth hue to avoid that would be worse. */
  home: '#0f766e',
  cases: CASE_THEMES['subliminal-lab-safety'].accent,
  database: CASE_THEMES['belief-intervention'].accent,
  skills: CASE_THEMES['belief-mechanism'].accent,
  quickStart: CASE_THEMES['evo2-alpha-helix'].accent,
}

/* The two knowledge-graph channels shown on the home foundation block and
   again in the Database page header — one source so the counts cannot drift. */
export const DATABASE_CHANNELS = [
  {
    kicker: '跨学科背景',
    title: '全学科知识图谱',
    metrics: [
      { value: '43M', label: '论文' },
      { value: '157M', label: '实体节点' },
    ],
  },
  {
    kicker: '聚焦证据',
    title: '解释性知识图谱',
    metrics: [
      { value: '13.9k', label: '论文' },
      { value: '27', label: '精选分类' },
    ],
  },
]


/* PIPELINE_MODES used to live here: six named modes, one per cell of the
   3 x 2 grid (behavior-source x mechanism). Nothing imported it — QuickStartPage
   defines its own list — and the two had drifted apart in wording, ordering and
   naming. The repo README is the authority and it names four: it says "all
   3 x 2 = 6 combinations are valid. The four most common patterns are listed
   below." The names for the other two were this file's invention, so the copy
   that survives is the one in QuickStartPage that matches the README. */

/* The two modules the four stages run on — the second half of the system, and
   the half a reader is most likely to skim past, so the home page now names
   them as modules and gives them the same weight as the stages rather than
   listing them as footnotes underneath.

   Counts are read off the repository rather than quoted from prose:
   skills/mechanism-skills holds 11 family directories and 32 leaf submethod
   directories beneath them. Corpus sizes are from README.md §Mechanic-DB. */
export const PIPELINE_SUPPORT = [
  {
    id: 'mechanic-db',
    name: 'Knowledge Graphs',
    role: 'Evidence',
    /* Read at the claim stage and nowhere else. In `/auto` the only skills that
       reach mechanic-db are `auto-claim` and the `research-lit` step inside it
       (auto/SKILL.md:90 — "mechanic-db-search must be executed, not skipable").
       Experiment, verify and iterate never open it. This line used to read
       "Queried when a stage needs prior work", which described a corpus
       consulted throughout the run; that is what the Database page's own title
       says it is not. */
    desc: 'Two knowledge graphs work together:\nA curated interpretability knowledge graph grounds the hypothesis;\nA cross-disciplinary knowledge graph brings in theory and methods from beyond AI.',
    highlights: [
      'curated interpretability knowledge graph',
      'cross-disciplinary knowledge graph',
    ],
    points: [
      {
        title: 'Cross-disciplinary Knowledge Graph',
        desc: 'Draw inspiration from other scientific fields.',
      },
      {
        title: 'Interpretability Knowledge Graph',
        desc: 'Track fine-grained advances in mechanistic interpretability.',
      },
    ],
    figures: [
      { value: '13.9k', label: 'Interpretability papers' },
      { value: '26', label: 'Cross-disciplinary domains' },
      { value: '157M', label: 'Graph nodes' },
    ],
    to: '/knowledge-graphs',
    cta: 'Explore the knowledge graphs',
  },
  {
    id: 'mechanism-skills',
    name: 'Mechanism Methods',
    role: 'Method',
    desc: 'Mechanism methods provide research tools for AI interpretability. They help Mechanist design and run each experiment, routing the hypothesis to the analysis method best suited to test it.',
    highlights: ['research tools for AI interpretability'],
    figures: [
      { value: '11', label: 'Families' },
      { value: '32', label: 'Methods' },
    ],
    to: '/methods',
    cta: 'Explore the method library',
  },
]

export const PIPELINE_STAGES = [
  {
    id: 'hypothesis',
    name: 'Hypothesis Generation',
    stageAlias: 'Claim',
    hint: 'hypothesis · novelty · plan',
    desc: 'Literature retrieval, hypothesis formulation, novelty and impact checks converge on a falsifiable claim plus an experiment plan.',
    homeDesc: 'Search prior work and turn the question into a falsifiable claim.',
    artifact: 'EXPERIMENT_PLAN.md',
    output: 'Experiment plan',
  },
  {
    id: 'experiment',
    name: 'Experiment Execution',
    stageAlias: 'Experiment',
    hint: 'route · implement · deploy',
    desc: 'Mechanism routing picks the interpretability method, then the agent implements code, deploys to GPU, and collects results.',
    homeDesc: 'Choose a mechanism method, run the code, and collect evidence.',
    artifact: 'EXPERIMENT_RESULTS.md',
    output: 'Results report',
  },
  {
    id: 'verify',
    name: 'Verification',
    stageAlias: 'Verify',
    hint: 'swap method · data · model',
    desc: 'Each claim is stress-tested by swapping method, dataset, and model; robustness is scored under double integrity audits.',
    homeDesc: 'Change method, data, and model to test whether the result holds.',
    artifact: 'VERIFY_REPORT.md',
    output: 'Verification report',
  },
  {
    id: 'iterate',
    name: 'Iteration',
    stageAlias: 'Iteration',
    hint: 'review · route · rerun',
    desc: 'An external LLM reviewer routes weak or failed results to targeted fixes and reruns the relevant stages.',
    homeDesc: 'Review weak evidence, revise the plan, and rerun what failed.',
    artifact: 'CLAIMS_LEDGER.md',
    output: 'Claims ledger',
  },
]

/* Each case carries a `gist`: what the run found, in language someone who has
   not read the paper can follow. That is what the listing shows, and it is all
   it shows.

   `headline`, `headlineDetail` and `metrics` used to live here and were the
   first thing both the index card and the case hero put in front of a reader.
   They are gone: a listing that leads with "48.6% unsafe responses" asks
   somebody to weigh a figure before they know what was asked, and it frames
   four end-to-end investigations as four scores. The numbers are all still on
   the site — in the case bodies, beside the paper panel that measured them,
   which is the only place they mean anything. */
/* Publications listed on /research. Placeholder entries stay here so
   the page can grow without inventing structure later. `status: 'in-progress'`
   means no link yet — render as a static row, not a card that looks clickable. */
export const PUBLICATIONS = [
  {
    id: 'comparison-interpretability-methods',
    categories: [],
    title: 'Comparison of Interpretability Methods',
    status: 'in-progress',
    summary:
      'A systematic comparison of interpretability methods.',
  },
]

/* `track` on each case is the title of the paper subsection that case sits in
   (results.tex:3, 58, 104, 121), shortened to fit a one-line label:
     Discover novel behaviors in AI systems
     Reveal mechanism theory underlying AI behaviors
     Enhance AI intelligence through mechanism intervention
     Advance interdisciplinary discovery through mechanism intervention

   Two of them used to be cut shorter still — "Reveal mechanism theory" and
   "Enhance through intervention" — and both cuts removed the object the verb
   needed. Theory is not revealed and nothing is enhanced, so they read as
   slogans rather than as the paper's claims. The current forms keep the object
   and drop the instrument, which the case page states anyway. */
export const DISCOVERY_CASES = [
  {
    id: 'subliminal-lab-safety',
    date: 'Aug 12, 2026',
    categories: [],
    track: 'Discover risk behaviors in AI systems',
    homeTitle: 'Discover risk behaviors in AI System',
    homeSummary:
      'Unsafe behavior can reappear after fine-tuning, even when the training data looks safe.',
    title: 'Subliminal learning through filtered data',
    gist:
      'A model can pick up unsafe habits from training data that every safety filter marks as clean — even when the lesson crosses from text into images.',
    summary:
      'Mechanist shows that filtering the training data is not always enough. A hidden unsafe behavior can reappear after fine-tuning, and a banana preference can survive even after every banana image is removed.',
    /* Two sub-studies, four models. Text: Qwen2.5-7B-Instruct teaches,
       Qwen2.5-3B-Instruct learns (demo/demo_subliminal_text/task.md:11-12).
       Multimodal: Qwen3.5-9B is both teacher and student
       (demo/demo_subliminal_multimodal/task.md:7); the text-to-image arm
       fine-tunes Qwen-Image (paper §2.1). Listing them flat, as this used to,
       read as one four-model study. */
    models: [
      { name: 'Qwen2.5-7B-Instruct', role: 'Teacher (text)' },
      { name: 'Qwen2.5-3B-Instruct', role: 'Student (text)' },
      { name: 'Qwen3.5-9B', role: 'Teacher + student (multimodal)' },
      { name: 'Qwen-Image', role: 'Student (text-to-image)' },
    ],
    autoCommand: '/auto — behavior-source: given-validation, mechanism: discovery',
  },
  {
    id: 'belief-mechanism',
    date: 'Aug 12, 2026',
    categories: [],
    track: 'Reveal mechanism theory underlying AI behaviors',
    homeTitle: 'Reveal mechanism theory underlying AI behaviors',
    homeSummary:
      'Identify separable attention heads that govern how models preserve facts and report attributed beliefs in conflicting contexts.',
    title: 'Belief-state reasoning and belief heads',
    gist:
      'Separable attention heads support two competing demands: preserving factual knowledge and reporting what another person believes.',
    summary:
      'Mechanist develops a mechanism theory of belief, identifying separable personal-belief and attributed-belief heads that govern how models use learned knowledge in complex context scenarios.',
    models: [
      { name: 'Pythia-410M', role: 'Scale sweep' },
      { name: 'Pythia-1B', role: 'Primary model' },
      { name: 'Pythia-2.8B', role: 'Scale sweep' },
    ],
    autoCommand: '/auto — behavior-source: given, mechanism: given',
  },
  {
    id: 'belief-intervention',
    date: 'Aug 12, 2026',
    categories: [],
    track: 'Enhance AI intelligence through mechanism theory of belief',
    homeTitle: 'Enhance AI Reliability by Mechanism Intervention',
    homeSummary:
      "Selectively amplifies belief heads to preserve factual knowledge or report another person's belief, depending on the query.",
    title: 'Dynamic belief-head intervention',
    gist:
      'A lightweight probe selects the required belief state, then amplifies the corresponding heads during inference to improve accuracy without retraining the model.',
    summary:
      'Guided by the mechanism theory of belief, Mechanist adaptively steers belief heads to resolve conflicting information and reason about others’ beliefs, improving response accuracy and consistency.',
    models: [
      { name: 'Pythia-410M', role: 'Scale sweep' },
      { name: 'Pythia-1B', role: 'Primary model' },
      { name: 'Pythia-2.8B', role: 'Scale sweep' },
    ],
    autoCommand: '/auto — behavior-source: given, mechanism: given',
  },
  {
    id: 'evo2-alpha-helix',
    date: 'Aug 12, 2026',
    categories: [],
    track: 'Advance interdisciplinary discovery through mechanism design',
    homeTitle: 'Advance interdisciplinary discovery through mechanistic design',
    homeSummary:
      'Identifies biological features in scientific foundation models and steers them toward desired outcomes.',
    title: 'Mechanism-guided DNA generation (Evo2)',
    gist:
      'The same idea works outside language. Steering one interpretable feature inside a DNA model shifts the shape of the proteins it designs — no trial-and-error resampling.',
    summary:
      'Mechanist identifies target biological features in scientific foundation models and causally steers them toward desired biological outcomes, providing a direct alternative to computationally intensive generate-and-rerank approaches.',
    models: [{ name: 'Evo2-7B', role: 'Genome model under study' }],
    autoCommand: '/auto — behavior-source: given-validation, mechanism: given',
  },
]

export function getDiscoveryCase(id) {
  return DISCOVERY_CASES.find((item) => item.id === id)
}

export function getCaseTrackIndex(caseId) {
  return DISCOVERY_CASES.findIndex((item) => item.id === caseId)
}
