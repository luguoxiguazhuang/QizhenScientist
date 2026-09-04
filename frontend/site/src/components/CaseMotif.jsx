import { useId } from 'react'
import { CASE_THEMES } from '../content/mechanistContent.js'
import './CaseMotif.css'

/* A drawn motif per case, in that case's colour.
 *
 * Four different figures, one each, and each of them is about its own case
 * rather than about transformers in general:
 *
 *   subliminal    a sieve — a fine mesh with strokes running clean through it.
 *                 The finding is that something crosses a filter which reports
 *                 everything it passed as clean.
 *   belief        a sparse network of links with a few nodes standing on it.
 *                 A handful of heads out of thousands.
 *   intervention  concentric arcs opening outward from a point. Amplification.
 *   evo2          two strands out of phase with rungs between them.
 *
 * Drawn as SVG patterns rather than as one big picture, so the motif keeps its
 * density whether it is behind a 330px card or a 1400px hero — a single
 * stretched drawing would be coarse in one place and cramped in the other.
 * `scale` shrinks the tile where the surface is short: the tiles are 64–120px
 * and a card band is under 100px tall, so at full size the band shows one
 * fragment of a figure rather than a repeating pattern, which reads as a stray
 * squiggle.
 *
 * Line work throughout, no dot matrix: an even field of small marks reads as
 * noise at this scale and says nothing about which case it belongs to.
 *
 * Everything is stroked in `currentColor` and the caller sets the colour, so
 * one motif serves the light card and the dark hero without a second copy.
 */

const MOTIFS = {
  'subliminal-lab-safety': Sieve,
  'belief-mechanism': Network,
  'belief-intervention': Signal,
  'evo2-alpha-helix': Helix,
}

export default function CaseMotif({ caseId, tone = 'light', scale = 1, className = '' }) {
  const theme = CASE_THEMES[caseId]
  /* useId, because a page can carry four of these at once and two <pattern>
     elements sharing an id means three cards render the fourth one's motif. */
  const id = useId().replace(/:/g, '')
  const Motif = MOTIFS[caseId]

  if (!theme || !Motif) return null

  return (
    <div
      className={`case-motif ${className}`.trim()}
      data-tone={tone}
      style={{ color: tone === 'dark' ? theme.accentDeep : theme.accent }}
      aria-hidden="true"
    >
      <svg width="100%" height="100%">
        <defs>
          <Motif id={id} scale={scale} />
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
    </div>
  )
}

/* A mesh, with three strokes passing straight through it. The mesh is the
   content filter; the strokes are what the filter did not stop. */
function Sieve({ id, scale }) {
  return (
    <pattern id={id} width="72" height="72" patternUnits="userSpaceOnUse" patternTransform={`scale(${scale})`}>
      <path
        d="M0 18h72M0 36h72M0 54h72M18 0v72M36 0v72M54 0v72"
        stroke="currentColor"
        strokeWidth="0.75"
        opacity="0.34"
        fill="none"
      />
      <path
        d="M-8 64L64 -8M28 80L100 8"
        stroke="currentColor"
        strokeWidth="1.6"
        opacity="0.75"
        fill="none"
        strokeLinecap="round"
      />
    </pattern>
  )
}

/* Links, mostly. Three nodes sit on them — the sparse set a mechanism study is
   about — and the rest of the figure is the wiring they are embedded in. */
function Network({ id, scale }) {
  return (
    <pattern id={id} width="96" height="96" patternUnits="userSpaceOnUse" patternTransform={`scale(${scale})`}>
      <path
        d="M12 12L48 30L84 12M48 30V66M12 84L48 66L84 84M0 48h20M76 48h20"
        stroke="currentColor"
        strokeWidth="0.9"
        opacity="0.4"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="48" cy="30" r="3.1" fill="currentColor" opacity="0.85" />
      <circle cx="48" cy="66" r="2.2" fill="currentColor" opacity="0.55" />
      <circle cx="12" cy="12" r="1.8" fill="currentColor" opacity="0.45" />
    </pattern>
  )
}

/* Arcs opening outward from a point on the left, each one wider and fainter
   than the last. */
function Signal({ id, scale }) {
  return (
    <pattern id={id} width="110" height="88" patternUnits="userSpaceOnUse" patternTransform={`scale(${scale})`}>
      <g stroke="currentColor" fill="none" strokeLinecap="round">
        <path d="M14 44a16 16 0 0 1 16-16" strokeWidth="1.7" opacity="0.8" />
        <path d="M14 44a30 30 0 0 1 30-30" strokeWidth="1.3" opacity="0.55" />
        <path d="M14 44a44 44 0 0 1 44-44" strokeWidth="1.05" opacity="0.36" />
        <path d="M14 44a16 16 0 0 0 16 16" strokeWidth="1.7" opacity="0.8" />
        <path d="M14 44a30 30 0 0 0 30 30" strokeWidth="1.3" opacity="0.55" />
        <path d="M14 44a44 44 0 0 0 44 44" strokeWidth="1.05" opacity="0.36" />
      </g>
      <circle cx="14" cy="44" r="2.6" fill="currentColor" opacity="0.9" />
    </pattern>
  )
}

/* Two strands a half period apart, with rungs where they cross. */
function Helix({ id, scale }) {
  return (
    <pattern id={id} width="120" height="64" patternUnits="userSpaceOnUse" patternTransform={`scale(${scale})`}>
      <g stroke="currentColor" fill="none" strokeLinecap="round">
        <path d="M0 32C15 6 45 6 60 32S105 58 120 32" strokeWidth="1.5" opacity="0.72" />
        <path d="M0 32C15 58 45 58 60 32S105 6 120 32" strokeWidth="1.5" opacity="0.72" />
        <path
          d="M15 19v26M30 12v40M45 19v26M75 45v-26M90 52v-40M105 45v-26"
          strokeWidth="0.85"
          opacity="0.34"
        />
      </g>
    </pattern>
  )
}
