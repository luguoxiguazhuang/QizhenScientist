/* The run the home page plays.
 *
 * Transcribed from a real session: the Evo2-7B α-helix steering run, whose raw
 * record lives in Mechanist-DNA/auto-experiment-dir/. Five steps, staged as one
 * sentence plus one drawing each — the panel is a typewriter that narrates the
 * run, and the stage under each sentence draws what the sentence says.
 *
 * Every number below is from the record, not invented:
 *
 *   graphs      13,936 interpretability papers / 26 cross-disciplinary domains
 *               — the counts the Database page publishes (database/manifest.json
 *               totals.interp_papers, and mechanistContent.js).
 *   routing     refine-logs/MECHANISM_ROUTING.md — chosen_family, the two
 *               candidate paths, and the three lines of the composition plan.
 *   dictionary  Layer-26 BatchTopK SAE at blocks.26.post_norm, expansion-8,
 *               k=64, ~32,768 atoms (MECHANISM_ROUTING.md §Candidates).
 *   features    results/m0_feature_set.json — S_size 19, helix_features[0]
 *               = 28741 at helix_rank 0 with AUROC 0.643, set-level AUROC
 *               0.901 (mean_steer_organism_set_auroc).
 *   sweep       paper_figure/panel_c_data.csv (see heroSweepData.js).
 *   structures  the published Fig. 5d Case-1 crop.
 *
 * ── the tool lines ────────────────────────────────────────────────────────
 *
 * Each step opens with the call that actually made it happen, written the way
 * an agent client writes one: name, arguments, and the value that came back.
 * These are not dressing. Every name is a real entry point in the record and
 * every argument is the value it ran with:
 *
 *   mechanic-db.search          RESEARCH_LIT.md — cloud SEARCH, top_k=300
 *   mechanism.route             MECHANISM_ROUTING.md — Mode B, MECHANISM=given
 *   m0_feature_selectivity.py   code/ — screens the Layer-26 dictionary
 *   m2_dose_response.py         code/ — 10 doses × 3 seeds × 300 prompts
 *   verify                      verify/ — C1, C2, C3, all PASS, robustness 1.00
 *
 * `doneAt` is the beat at which the call stops spinning and reports.
 *
 * ── timing ────────────────────────────────────────────────────────────────
 *
 * The three working acts narrate in the present progressive — the panel is
 * describing a run happening while the reader watches it, and the past tense
 * had each sentence reporting a step its own drawing was still in the middle
 * of. The last act keeps the plain present: it states what the run concluded,
 * which is not something in progress.
 *
 * `ms` is the step's own length; `beats` are offsets inside it. The driver only
 * sets a beat index — four or five state changes per step, no per-frame React —
 * and every continuous motion is a CSS animation keyed off `data-beat`. That is
 * the whole reason this replays smoothly at 60fps on a laptop.
 */

/* The four stages the progress axis counts off, and what each act belongs to.
 * Five acts, four stages: Localise and Sweep are both execution — screening the
 * dictionary and sweeping the dose are one stage of the pipeline doing its two
 * halves, and the axis is a map of the pipeline, not of the acts. */
export const HERO_STAGES = [
  'Hypothesis Generation',
  'Experiment Design',
  'Experiment Execution',
  'Result',
]

export const HERO_RUN = {
  command: '/mechanist:mguide',

  question:
    'Generate DNA sequences with high α-helical content using Evo2-7B.',
  questionEmphasis: 'high α-helical content',

  steps: [
    {
      id: 'retrieve',
      stage: 0,
      rail: 'Retrieve',
      /* Five beats: three sources answer one after another; the hypothesis tip
         lands with the last reply so the stage closes on its result.
         `ms` is only a short beat past the last mark — long enough to read the
         tip, not long enough to sit on a finished frame before the next act. */
      ms: 4100,
      beats: [0, 700, 1600, 2500, 3400],
      line: {
        text:
          'Searching Interpretability Knowledge Graph and Cross-disciplinary Knowledge Graph ...',
        em: [
          'Interpretability Knowledge Graph',
          'Cross-disciplinary Knowledge Graph',
        ],
      },
      /* Three calls, one per source. `stat` is what each one holds — for the two
         graphs, the counts the Database page publishes; for the web search, the
         indexes it goes out to — and `out` is what came back.
         
         The titles the search actually returned (Evo2, InterPLM, Gemma Scope;
         α-helix propensity, DSSP assignment, pLDDT confounding) are not listed
         here: at this size a card reports that a list came back, and the list
         itself belongs on the Database page. */
      sources: [
        {
          id: 'interp',
          name: 'Interpretability Knowledge Graph',
          stat: '13,936 papers',
          out: 'Return Paper List',
        },
        {
          id: 'cross',
          name: 'Cross-disciplinary Knowledge Graph',
          stat: '26 domains',
          out: 'Return Paper List',
        },
        {
          id: 'web',
          name: 'Web Search',
          stat: 'arXiv · Semantic Scholar',
          out: 'Return Paper List',
        },
      ],
      /* What the stage converges on once the three stores have answered — the
         falsifiable claim that Experiment Design then routes a method for. */
      hypothesis: {
        label: 'Hypothesis',
        text: 'α-helical content is encoded as a steerable SAE feature in Evo2-7B.',
        em: 'steerable SAE feature',
      },
    },

    {
      id: 'route',
      stage: 1,
      rail: 'Route',
      /* Two design products, stacked: Mechanism Methods is consulted first,
         then the plan is written against it so the next stage can run itself.
         No catalogue reel — the method is a label on the plan. */
      ms: 4000,
      beats: [0, 900, 2200, 3400],
      line: {
        text:
          'Using Mechanism Methods to write an experiment plan with phenomenon checks, gates, fallbacks, and controls ...',
        em: 'Mechanism Methods',
      },
      /* Two calls, in the order they depend on each other. The method is looked
         up in the Mechanism Methods catalogue and answers first; the plan is
         then written against it, which is why it cannot start until the lookup
         has landed. Both report the way every other call on this panel does — a
         ring while they work, a tick when they are done. */
      method: {
        cap: 'Mechanism Methods',
        name: 'Feature Dictionary Learning',
        note: '',
        out: 'Method selected',
      },
      /* The plan, in four lines — what lets the next stage run unattended:
         a phenomenon check, an experiment gate, a fallback when a gate misses,
         and controls that keep the claim causal. Each is one line and has to
         stay one line: the stage is about 220px and this block sits under the
         method block, so a clause that wraps at 820px pushes the last row off
         the bottom of the window. */
      design: {
        cap: 'EXPERIMENT_PLAN.md',
        out: 'Plan written',
        rows: [
          {
            label: 'Phenomenon',
            text: 'α-helix content is measurable without steering',
          },
          {
            label: 'Gate',
            text: 'Selectivity AUROC and ORF-validity floors',
          },
          {
            label: 'Fallback',
            text: 'Narrow the feature set · skip dose sweep · abort cleanly',
          },
          {
            label: 'Controls',
            text: 'Unsteered baseline · random features at matched α',
          },
        ],
      },
    },

    /* One act, two halves. Finding the feature and dosing it were two acts and
       two drawings, which put a scene break between the screen and the sweep it
       feeds — the reader saw a dictionary searched, then, separately, a curve.
       Side by side the causal link is the layout: the coefficient rises on the
       right and the atom on the left is driven harder as it does. */
    {
      id: 'execute',
      stage: 2,
      rail: 'Execute',
      /* Slow. The search is a search — the glass casts back and forth for 2.6s
         before it settles — and the dose then goes in over 3.4s so the curve on
         the right and the atom on the left can be watched climbing together.
         The hold after the last beat stays short so Result picks up promptly. */
      ms: 10600,
      beats: [0, 1000, 2100, 5100, 6300, 10000],
      line: {
        text: 'Identifying and steering the SAE feature for α-helical content in Evo2-7B.',
        em: 'Identifying and steering',
      },
      blocks: 32,
      landing: 26,
      /* What the panel names the place. The record's own hook site is
         blocks.26.post_norm (MECHANISM_ROUTING.md); this is the same site said
         the way a reader of the homepage can use. */
      dictionary: 'SAE on Layer 26',
      /* Real indices and selectivity scores, from m0_feature_set.json. Their
         positions in the field are decorative — the field is a window onto the
         dictionary, not a 32,768-cell grid drawn to scale — but the indices,
         the count, and the scores are the record's own. */
      hits: [28741, 23441, 19897, 17281, 26736, 29297, 7510, 2300, 19670, 5040,
             25679, 11182, 18641, 14170, 2989, 13545, 29541, 6797, 9367],
      top: { id: 'f/28741', rank: 1, auroc: '0.64' },
      setAuroc: '0.90',
    },

    {
      id: 'conclude',
      stage: 3,
      rail: 'Result',
      ms: 3600,
      beats: [0, 650, 1500, 2400],
      /* The claim is the narration; the metric under the steps is the
         measured gain at α = 8 (≈12.8 points over the unsteered baseline,
         rounded). */
      line: {
        text:
          'Result: Biological properties encoded in model Evo2-7B can be identified and causally manipulated to steer output generation toward desired biological outcomes.',
        em: 'causally manipulated',
      },
      summary: [
        'Identify the Feature for α-helical within Model',
        'Steer the α-helical feature during forward propagation',
        'Generate Target DNA Sequence',
      ],
      finding: {
        text:
          'Steering raised α-helix content by about +12.8% while preserving valid sequence generation.',
        em: '+12.8%',
      },
      figureId: 'science-d-case1',
    },
  ],
}
