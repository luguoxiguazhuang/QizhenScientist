import { useId } from 'react'
import './HeaderMotif.css'

/* A drawn figure behind a page header, in grey.
 *
 *   graph   a knowledge graph — nodes of three sizes joined by edges, a few
 *           hubs carrying most of the connections. The Database page.
 *   probe   a magnifying glass over a small feedforward network, the part
 *           under the lens drawn heavier than the part outside it. The Skills
 *           page, whose subject is methods that look inside a model.
 *   runs    four write-ups in a fanned stack, the front one open: ruled lines
 *           of prose, a figure block, and a checked verdict at the foot. The
 *           Cases index, whose lede traces each run from research question to
 *           pipeline, evidence and verified claims — the drawing is that
 *           sentence.
 *
 *           It replaced four ruled tracks with gate marks on them. That figure
 *           was accurate about the pipeline and looked like four dotted rules
 *           at this weight — thin line work with nothing to recognise. A page
 *           of documents is an object; four horizontal lines are a texture.
 *   checklist five rows, a checkbox and a rule of text beside each — three
 *           checked, two open. The Quick Start page, which is five numbered
 *           steps and nothing more clever than that.
 *
 *           It replaced a shell window with typed commands and a blinking
 *           cursor, which in turn replaced a dialog with a mouse cursor
 *           clicking a submit button. Both read as trying too hard: a prop
 *           the viewer has to decode before recognising what it's for. A
 *           checklist next to a page of numbered steps needs no decoding.
 *
 * Not a tiled pattern, unlike CaseMotif. Those motifs repeat because they sit
 * behind surfaces of wildly different sizes; these are single figures — a
 * magnifying glass cannot tile, and a knowledge graph drawn as a repeat stops
 * being a graph and becomes a mesh.
 *
 * Coordinates are written out rather than generated. A figure placed by a
 * random number generator renders differently on every build, which makes a
 * visual regression impossible to see and a screenshot impossible to trust.
 *
 * Everything strokes and fills in `currentColor`; the colour, the opacity and
 * the fade across the copy all live in the stylesheet.
 */

const FIGURES = { graph: Graph, probe: Probe, runs: Runs, checklist: Checklist }

export default function HeaderMotif({ kind }) {
  const Figure = FIGURES[kind]
  /* Two headers never coexist today, but the clip path below is referenced by
     id and a duplicate would silently retarget. */
  const id = useId().replace(/:/g, '')

  if (!Figure) return null

  return (
    <div className="header-motif" data-kind={kind} aria-hidden="true">
      <svg
        viewBox="0 0 420 260"
        /* Whole figure, anchored to the top right. `slice` was cropping it —
           the magnifier lost its handle off the bottom edge — and a header that
           is much wider than it is tall on a desktop and nearly square on a
           laptop would have cropped it differently at every width. */
        preserveAspectRatio="xMaxYMin meet"
      >
        <Figure id={id} />
      </svg>
    </div>
  )
}

/* ── knowledge graph ────────────────────────────────────────────────────── */

/* Three tiers, the way the corpus is actually shaped: a few hubs, a ring of
   category nodes around them, and leaves hanging off those. */
const HUBS = [
  [292, 96],
  [206, 156],
  [346, 186],
]
const MIDS = [
  [246, 44],
  [354, 122],
  [162, 92],
  [258, 218],
  [396, 66],
  [132, 186],
  [318, 246],
]
const LEAVES = [
  [200, 26],
  [398, 152],
  [110, 126],
  [178, 240],
  [292, 148],
  [232, 112],
  [378, 222],
  [86, 64],
  [140, 44],
  [244, 176],
]
const EDGES = [
  // hub to hub
  [[292, 96], [206, 156]],
  [[292, 96], [346, 186]],
  [[206, 156], [346, 186]],
  // hubs out to the ring
  [[292, 96], [246, 44]],
  [[292, 96], [354, 122]],
  [[292, 96], [232, 112]],
  [[292, 96], [396, 66]],
  [[206, 156], [162, 92]],
  [[206, 156], [258, 218]],
  [[206, 156], [132, 186]],
  [[206, 156], [244, 176]],
  [[346, 186], [318, 246]],
  [[346, 186], [398, 152]],
  [[346, 186], [378, 222]],
  [[346, 186], [292, 148]],
  // ring out to leaves
  [[246, 44], [200, 26]],
  [[246, 44], [140, 44]],
  [[162, 92], [110, 126]],
  [[162, 92], [86, 64]],
  [[258, 218], [178, 240]],
  [[132, 186], [110, 126]],
  [[354, 122], [398, 152]],
  [[232, 112], [292, 148]],
  [[258, 218], [244, 176]],
]

function Graph() {
  return (
    <g fill="none" stroke="currentColor">
      <g strokeWidth="1" opacity="0.5">
        {EDGES.map(([[x1, y1], [x2, y2]]) => (
          <line x1={x1} y1={y1} x2={x2} y2={y2} key={`${x1},${y1}-${x2},${y2}`} />
        ))}
      </g>
      {LEAVES.map(([cx, cy]) => (
        <circle cx={cx} cy={cy} r="2.6" fill="currentColor" stroke="none" opacity="0.55" key={`l${cx},${cy}`} />
      ))}
      {MIDS.map(([cx, cy]) => (
        <circle cx={cx} cy={cy} r="5" fill="currentColor" stroke="none" opacity="0.72" key={`m${cx},${cy}`} />
      ))}
      {/* Hollow, so the three that carry the graph read as the biggest marks
          without becoming the darkest. */}
      {HUBS.map(([cx, cy]) => (
        <circle cx={cx} cy={cy} r="8.5" strokeWidth="2" key={`h${cx},${cy}`} />
      ))}
    </g>
  )
}

/* ── magnifier over a network ───────────────────────────────────────────── */

const LAYERS = [
  { x: 118, ys: [58, 106, 154, 202] },
  { x: 236, ys: [40, 88, 136, 184, 232] },
  { x: 348, ys: [76, 130, 184] },
]

function netEdges() {
  const out = []
  for (let i = 0; i < LAYERS.length - 1; i += 1) {
    const a = LAYERS[i]
    const b = LAYERS[i + 1]
    for (const y1 of a.ys) for (const y2 of b.ys) out.push([a.x, y1, b.x, y2])
  }
  return out
}
const NET_EDGES = netEdges()
const LENS = { cx: 300, cy: 128, r: 74 }

function Net({ edgeWidth, edgeOpacity, nodeOpacity }) {
  return (
    <g fill="none" stroke="currentColor">
      <g strokeWidth={edgeWidth} opacity={edgeOpacity}>
        {NET_EDGES.map(([x1, y1, x2, y2]) => (
          <line x1={x1} y1={y1} x2={x2} y2={y2} key={`${x1},${y1}-${x2},${y2}`} />
        ))}
      </g>
      <g opacity={nodeOpacity}>
        {LAYERS.map((layer) =>
          layer.ys.map((y) => (
            <circle cx={layer.x} cy={y} r="5.5" fill="currentColor" stroke="none" key={`${layer.x},${y}`} />
          )),
        )}
      </g>
    </g>
  )
}

function Probe({ id }) {
  return (
    <g>
      {/* The network as it is: faint. */}
      <Net edgeWidth="0.7" edgeOpacity="0.28" nodeOpacity="0.4" />

      {/* The same network again, clipped to the lens and drawn heavier. Two
          copies rather than one with a filter, because what the lens does here
          is not magnify — it resolves. That is the claim the Skills page makes
          about the method library, and it is worth drawing accurately. */}
      <clipPath id={`${id}-lens`}>
        <circle cx={LENS.cx} cy={LENS.cy} r={LENS.r} />
      </clipPath>
      <g clipPath={`url(#${id}-lens)`}>
        <Net edgeWidth="1.4" edgeOpacity="0.85" nodeOpacity="1" />
      </g>

      <g fill="none" stroke="currentColor" strokeLinecap="round">
        {/* The glass, then the rim, then the handle running off the corner. */}
        <circle cx={LENS.cx} cy={LENS.cy} r={LENS.r} fill="currentColor" opacity="0.05" stroke="none" />
        <circle cx={LENS.cx} cy={LENS.cy} r={LENS.r} strokeWidth="3.5" opacity="0.9" />
        <line x1="352" y1="180" x2="404" y2="232" strokeWidth="7" opacity="0.9" />
      </g>
    </g>
  )
}

/* ── four write-ups, the front one open ────────────────────────────────── */

/* The sheets behind, fanned back and to the left. Each is nudged so the stack
   reads as four rather than as a thick edge. */
const SHEETS = [
  { x: 60, y: 74, w: 210, h: 168, o: 0.3 },
  { x: 76, y: 62, w: 210, h: 168, o: 0.4 },
  { x: 92, y: 50, w: 210, h: 168, o: 0.52 },
]
/* Ruled lines on the open sheet: prose at the top, then the figure block, then
   two more lines and the verdict. Widths vary the way set text does. */
const RULES = [
  [128, 96, 232],
  [128, 112, 246],
  [128, 128, 198],
  [128, 208, 240],
  [128, 224, 176],
]
const FIGURE_BLOCK = { x: 128, y: 146, w: 148, h: 46 }
const CHECK = { x: 128, y: 252 }

function Runs() {
  return (
    <g fill="none" stroke="currentColor">
      {SHEETS.map((sheet) => (
        <rect
          x={sheet.x}
          y={sheet.y}
          width={sheet.w}
          height={sheet.h}
          rx="4"
          strokeWidth="1.6"
          opacity={sheet.o}
          key={sheet.x}
        />
      ))}

      {/* The front sheet, taller than the others because it is the one being
          read. */}
      <rect x="108" y="38" width="210" height="238" rx="4" strokeWidth="2" opacity="0.85" />

      <g strokeWidth="2" strokeLinecap="round" opacity="0.5">
        {RULES.map(([x, y, x2]) => (
          <line x1={x} y1={y} x2={x2} y2={y} key={`${x},${y}`} />
        ))}
      </g>

      {/* What the paper reports, drawn as the one filled shape on the page. */}
      <rect
        x={FIGURE_BLOCK.x}
        y={FIGURE_BLOCK.y}
        width={FIGURE_BLOCK.w}
        height={FIGURE_BLOCK.h}
        rx="2"
        fill="currentColor"
        stroke="none"
        opacity="0.24"
      />
      <rect
        x={FIGURE_BLOCK.x}
        y={FIGURE_BLOCK.y}
        width={FIGURE_BLOCK.w}
        height={FIGURE_BLOCK.h}
        rx="2"
        strokeWidth="1.4"
        opacity="0.5"
      />

      {/* What survived being checked. */}
      <g strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
        <path d={`M${CHECK.x} ${CHECK.y}l7 7 13-15`} />
      </g>
      <line
        x1={CHECK.x + 30}
        y1={CHECK.y + 4}
        x2="296"
        y2={CHECK.y + 4}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </g>
  )
}

/* ── checklist, five rows, the last two still open ────────────────────────── */

/* A plain checklist: a checkbox and a rule of text beside it, one row per
   step on the page below — there are five Step components in
   QuickStartPage.jsx, so there are five rows here. The first three are
   checked; the last two are open boxes with no rule filled in yet, since the
   reader hasn't done them. Nothing to decode — it is the list of steps,
   drawn. */
const BOX = { x: 130, size: 22 }
const TEXT_X = BOX.x + BOX.size + 16
const ROWS = [
  { y: 46, w: 132, done: true },
  { y: 92, w: 158, done: true },
  { y: 138, w: 108, done: true },
  { y: 184, w: 146, done: false },
  { y: 230, w: 100, done: false },
]

function ChecklistRow({ y, w, done }) {
  const boxY = y - BOX.size / 2
  return (
    <g>
      <rect
        x={BOX.x}
        y={boxY}
        width={BOX.size}
        height={BOX.size}
        rx="5"
        strokeWidth="1.8"
        opacity={done ? 0.6 : 0.35}
      />
      {done && (
        <path
          d={`M${BOX.x + 5} ${y}l5 5 9-11`}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.85"
        />
      )}
      <line
        x1={TEXT_X}
        y1={y}
        x2={TEXT_X + w}
        y2={y}
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity={done ? 0.4 : 0.25}
      />
    </g>
  )
}

function Checklist() {
  return (
    <g fill="none" stroke="currentColor">
      {ROWS.map((row) => (
        <ChecklistRow key={row.y} {...row} />
      ))}
    </g>
  )
}
