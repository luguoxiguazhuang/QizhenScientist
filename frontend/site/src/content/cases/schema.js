/* The block vocabulary a case body is written in.

   A case page used to be a fixed shape — hero, four numbered chapters, one
   chart, a run-details aside — and that shape is why the pages carried so
   little of the paper. There was nowhere to put a result table, a second study
   arm, a worked example, or a figure. Anything that was not a chapter simply
   did not get written.

   So the layout is now a list of typed blocks, and a case body is data.
   Somebody adding the pLDDT stratification table to the Evo2 case adds a
   `table` block to that case's file and touches no layout code at all.

   Every block may carry `size`, which is how it claims width from the content
   grid in CaseSections.css:

     'text'  (default) the 680px reading column
     'wide'  spills into the margins either side — charts, tables
     'bleed' edge to edge — full-width figures

   This file is the reference for what each type needs, and assertSections()
   below enforces it in development. It is not a type system and does not try
   to be one; it exists so that a missing `columns` key surfaces as a console
   warning naming the case and the block index, rather than as an exception
   from inside a table component. */

const REQUIRED = {
  /* A numbered narrative beat. Consecutive chapters are collected into one
     ordered list by the renderer, so the numbering survives a figure or a
     chart being dropped between two of them. */
  chapter: ['title', 'body'],
  /* Un-numbered narrative. Use when a passage is commentary rather than a step
     in the investigation. `body` may be a string or an array of paragraphs. */
  prose: ['body'],
  /* `chart` used to live here: data recreated as native SVG. All six were
     replaced by the paper's own panels, which carry annotations, confidence
     bands and reference lines that a recreation dropped — and which cannot
     disagree with the source, because they are the source. */
  table: ['columns', 'rows'],
  callout: ['title', 'body'],
  /* A panel exported from the paper by scripts/build-figures.py. `figureId`
     resolves through content/figures.generated.js. Set `inline: true` to keep
     the panel in the article body instead of the right-hand column. */
  figure: ['figureId'],
  /* Two halves of one published figure that have to be read against each
     other. Not a gallery — see FigureGrid.jsx. */
  figureGrid: ['items'],
  /* Two or more arms of the same study, side by side — the text and
     text-to-image halves of the subliminal case, for instance. */
  arms: ['arms'],
  /* Models, pipeline command and demo paths, pulled from the case record. */
  runSheet: [],
}

export const BLOCK_TYPES = Object.keys(REQUIRED)

export function assertSections(sections, caseId) {
  if (!import.meta.env.DEV) return
  if (!Array.isArray(sections)) {
    console.warn(`[case:${caseId}] sections is not an array`)
    return
  }
  sections.forEach((block, index) => {
    const where = `[case:${caseId}] block ${index}`
    if (!block || typeof block !== 'object') {
      console.warn(`${where} is not an object`)
      return
    }
    const required = REQUIRED[block.type]
    if (!required) {
      console.warn(`${where} has unknown type "${block.type}" — known: ${BLOCK_TYPES.join(', ')}`)
      return
    }
    required.forEach((key) => {
      if (block[key] == null) console.warn(`${where} (${block.type}) is missing "${key}"`)
    })
    if (block.size && !['text', 'wide', 'bleed'].includes(block.size)) {
      console.warn(`${where} has unknown size "${block.size}"`)
    }
  })
}
