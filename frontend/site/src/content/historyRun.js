/* What /mhistory does, as the Database page replays it.
 *
 * Transcribed from skills/mhistory/SKILL.md. The step order is the skill's own
 * (Step 0 → Step 1a/1b → Step 2 → Step 3), the tool names and arguments are the
 * ones it actually issues, and the filenames are the ones it writes.
 *
 * Note on the two corpora: /mhistory does NOT pick between interp_db and
 * sciatlas_db. It runs `search_papers` twice against the same service, and only
 * `temporal_mode` differs between the passes. Which corpora that service covers
 * is a property of mechanic-db, described in the docs — so it belongs in the
 * prose beside this panel, not as a step in it.
 */

export const HISTORY_RUN = {
  command: '/mhistory',
  topic: 'the evolution of circuit-level interpretability',

  steps: [
    {
      id: 'parse',
      name: 'Parse the topic',
      /* One polished English query naming the topic and its key sub-fields,
         at most 80 words, plus a slug for the cache paths. */
      lines: [
        'One polished English query, at most 80 words, naming the topic and its key sub-fields. Both database passes get the same string — only the temporal mode differs — so the two are directly comparable.',
      ],
      out: 'slug: circuit_level_interpretability',
    },
    {
      id: 'hist',
      name: 'Searching the long arc',
      tools: [
        { name: 'search_papers', args: 'temporal_mode=history · top_k=100', out: '5-year buckets, even across eras' },
      ],
      lines: [
        'The history pass buckets results into five-year windows, so an era is not crowded out by whichever one published most.',
      ],
      file: '<slug>__hist.json',
    },
    {
      id: 'recent',
      name: 'Searching the frontier',
      tools: [
        { name: 'search_papers', args: 'temporal_mode=recent · top_k=100', out: 'recency-boosted, modern frontier' },
      ],
      lines: [
        'Issued in the same turn as the pass above. Each call blocks for three to twenty minutes, so running them concurrently halves the wait.',
      ],
      file: '<slug>__recent.json',
    },
    {
      id: 'web',
      name: 'Searching the web for missing pieces',
      /* Two to four queries per purpose; these are the skill's own templates
         with this topic substituted in. */
      tools: [
        {
          name: 'WebSearch',
          args: '"circuit-level interpretability" seminal foundational paper before 2020 site:arxiv.org',
          out: 'classics the corpus predates',
        },
        {
          name: 'WebSearch',
          args: '"circuit-level interpretability" arxiv 2026',
          out: 'the months indexing has not reached',
        },
      ],
      lines: [
        'Two things the corpus cannot supply: foundational work older than it, and the last one to six months of arXiv. Whatever comes back carries a [Web] tag through to the reference list.',
      ],
    },
    {
      id: 'merge',
      name: 'Merge into a timeline',
      tools: [{ name: 'dedupe', args: 'by paper_id', out: 'one ordered bundle' }],
      lines: [
        'Both cached passes load, anything marked skipped drops out, and what survives is ordered into eras — several at once where a field ran more than one line.',
      ],
      /* Illustrative of the shape a timeline takes, not a claim about any
         particular field's dates. */
      timeline: [
        { era: 'pre-2018', weight: 2 },
        { era: '2018–20', weight: 4 },
        { era: '2021–22', weight: 6 },
        { era: '2023–24', weight: 9 },
        { era: '2025–26', weight: 7 },
      ],
    },
  ],

  result: {
    artifact: 'development_history.md',
    facts: [
      { label: 'Length', value: '2,500–4,500 words' },
      { label: 'Order', value: 'by era, parallel lines where they ran' },
      { label: 'References', value: 'split [DB] / [Web]' },
    ],
    headline:
      'Ends with "Tensions and Open Questions" — the live disagreements in the area, stated as they stand rather than resolved.',
  },
}
