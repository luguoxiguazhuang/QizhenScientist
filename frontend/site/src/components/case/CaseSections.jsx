import { useMemo } from 'react'
import { FIGURES } from '../../content/figures.generated.js'
import { assertSections } from '../../content/cases/schema.js'
import Reveal from '../motion/Reveal.jsx'
import BLOCKS from './blockRegistry.js'
import ChapterList from './blocks/ChapterList.jsx'
import './CaseSections.css'

/* Renders a case body.
 *
 * Two columns: the argument runs down the left, and the panel illustrating a
 * passage sits to its right, beside it rather than under it. That is how these
 * read on paper, and it is what stops a case from being a column of prose
 * interrupted every few paragraphs by a picture the reader has to scroll past
 * to get back to the sentence.
 *
 * Three kinds of block opt out, because a 380px right-hand column would
 * destroy them:
 *
 *   strip figures  panels at 3:1 or wider, whose axis labels stop being
 *                  legible well before that width. They run full-bleed.
 *   tables         several numeric columns need the horizontal room.
 *   paired figures two halves of one published figure, read against each
 *                  other; splitting them across a column boundary is the one
 *                  thing that arrangement exists to prevent.
 *
 * Two other things this file does, both easy to lose:
 *
 * - Consecutive `chapter` blocks are collected into one list so they share
 *   spacing as a run rather than as separate rows.
 * - Every row is wrapped in <Reveal> here, so nothing in blocks/ imports
 *   motion and nobody has to remember to add it.
 */

/* Above this a panel is a strip, not a picture. */
const STRIP_RATIO = 3

/* Blocks that always take a row to themselves.

   `callout` is here rather than in the text column because of what these
   actually hold: a replication on a second model family, the criteria a
   localization had to meet, what a related method could already do. They are
   asides from the argument, not part of its measure — set at the text width
   they read as another paragraph with a coloured edge, and at full width they
   read as the step out of the argument that they are.

   A `figure` with `inline: true` also takes its own row, in document order,
   instead of the right-hand column. Use that when the panel is part of the
   argument rather than an illustration sitting beside it. */
const FULL_WIDTH = new Set(['table', 'arms', 'figureGrid', 'runSheet', 'callout'])

const SCALED = new Set(['figure', 'figureGrid', 'table'])

function isStripFigure(block) {
  if (block.type !== 'figure') return false
  const figure = FIGURES[block.figureId]
  if (!figure?.width || !figure?.height) return false
  return figure.width / figure.height >= STRIP_RATIO
}

function isInlineFigure(block) {
  return block.type === 'figure' && block.inline === true
}

const isFullWidth = (block) =>
  FULL_WIDTH.has(block.type) || isStripFigure(block) || isInlineFigure(block)
const isSideFigure = (block) =>
  block.type === 'figure' && !isStripFigure(block) && !isInlineFigure(block)

export default function CaseSections({ sections, caseId, item }) {
  const rows = useMemo(() => buildRows(sections), [sections])

  if (import.meta.env.DEV) assertSections(sections, caseId)

  return (
    <div className="case-sections">
      {rows.map((row) => {
        if (row.kind === 'full') {
          const Component = BLOCKS[row.block.type]
          if (!Component) {
            if (import.meta.env.DEV) {
              console.warn(`[case:${caseId}] no renderer for block type "${row.block.type}"`)
            }
            return null
          }
          const bleed = isStripFigure(row.block) || row.block.type === 'figureGrid'
          return (
            <Reveal
              key={row.key}
              as="section"
              variant={SCALED.has(row.block.type) ? 'rise' : 'fadeUp'}
              className="case-body-row case-body-row--full"
              data-block={row.block.type}
              data-size={bleed ? 'bleed' : 'content'}
            >
              <Component block={row.block} caseId={caseId} item={item} />
            </Reveal>
          )
        }

        const imageFocus = hasImageOnlySide(row)
        const className = [
          'case-body-row',
          row.side.length ? null : 'case-body-row--text-only',
          imageFocus ? 'case-body-row--image-focus' : null,
        ].filter(Boolean).join(' ')

        return (
          <Reveal
            key={row.key}
            as="section"
            className={className}
            data-size="content"
          >
            <div className="case-body__text">
              {row.left.map((entry) =>
                entry.kind === 'chapters' ? (
                  <ChapterList key={entry.key} chapters={entry.blocks} />
                ) : (
                  <BlockOne key={entry.key} block={entry.block} caseId={caseId} item={item} />
                )
              )}
            </div>
            {row.side.length ? (
              <div className="case-body__side">
                {row.side.map((block) => (
                  <BlockOne key={block.figureId} block={block} caseId={caseId} item={item} />
                ))}
              </div>
            ) : null}
          </Reveal>
        )
      })}
    </div>
  )
}

function hasImageOnlySide(row) {
  return row.side.some((block) => block.type === 'figure' && block.imageOnly === true)
}

function BlockOne({ block, caseId, item }) {
  const Component = BLOCKS[block.type]
  if (!Component) {
    if (import.meta.env.DEV) {
      console.warn(`[case:${caseId}] no renderer for block type "${block.type}"`)
    }
    return null
  }
  return <Component block={block} caseId={caseId} item={item} />
}

function buildRows(sections) {
  const rows = []
  let index = 0

  while (index < sections.length) {
    const block = sections[index]

    if (isFullWidth(block)) {
      rows.push({ kind: 'full', key: `full-${index}`, block })
      index += 1
      continue
    }

    /* A figure with no text of its own to sit beside joins the row above it,
       so a run of panels stacks in one right-hand column rather than starting
       a new half-empty row each time. */
    if (isSideFigure(block)) {
      const last = rows[rows.length - 1]
      if (last && last.kind === 'pair') {
        last.side.push(block)
      } else {
        rows.push({ kind: 'pair', key: `pair-${index}`, left: [], side: [block] })
      }
      index += 1
      continue
    }

    const left = []
    const rowKey = `pair-${index}`
    while (
      index < sections.length &&
      !isFullWidth(sections[index]) &&
      !isSideFigure(sections[index])
    ) {
      const entry = sections[index]
      if (entry.type === 'chapter') {
        const run = []
        const runKey = `chapters-${index}`
        while (index < sections.length && sections[index].type === 'chapter') {
          run.push(sections[index])
          index += 1
        }
        left.push({ kind: 'chapters', key: runKey, blocks: run })
        continue
      }
      left.push({ kind: 'block', key: `${entry.type}-${index}`, block: entry })
      index += 1
    }

    const side = []
    while (index < sections.length && isSideFigure(sections[index])) {
      side.push(sections[index])
      index += 1
    }

    rows.push({ kind: 'pair', key: rowKey, left, side })
  }

  return rows
}
