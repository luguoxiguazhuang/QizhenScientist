import { useId, useMemo } from 'react'
import { HERO_SWEEP } from '../../content/heroSweepData.js'

/* Step 3 — find the feature, then turn it up, in one picture.
 *
 * These were two acts. Screening the dictionary was one drawing and the dose
 * sweep was another, and between them sat a scene break — which is exactly
 * where the causal claim lives. The reader saw a search, then, separately, a
 * curve, and had to be told they were about the same thing.
 *
 * Side by side, the layout says it instead. The coefficient climbs on the right
 * and the atom under the glass on the left is driven harder as it climbs: one
 * beat drives both, so the amplification is not illustrated next to the curve,
 * it happens with it.
 *
 * ── left: into the model, and then finding one atom ───────────────────────
 *
 *   the way in   a network is drawn, magnified until it is bigger than the
 *                frame, and gone — and the field of atoms is already there
 *                behind it. Node and atom are the same mark at the same size,
 *                so the lattice reads as what you arrive at by going far enough
 *                in, rather than as a second picture that replaced the first.
 *                No layer is singled out on the way: the caption says which
 *                dictionary this is, and a scene that stopped to point at one
 *                block first had to explain why that block.
 *   found        a magnifying glass casts back and forth across the field until
 *                it settles on one atom. The rim is empty glass: what makes it
 *                a magnifier is that the atoms under it swell while it is over
 *                them and settle back to size once it has moved on.
 *
 * ── right: what the dose bought, and what it cost ─────────────────────────
 *
 * One line rises: α-helix content against steering coefficient. Under it, at a
 * sixth of the height, valid-ORF. The cost belongs here and it belongs small —
 * past α = 8 it falls, which is why α = 8 is the dose that was kept rather than
 * the α = 24 that scores higher on helicity. A chart that showed only the
 * rising line would be a nicer picture and a worse one.
 *
 * Nineteen atoms are α-helix-selective and the one drawn here, f/28741, is the
 * top-ranked, at rank 1 with AUROC 0.64 (m0_feature_set.json). Both series and
 * both bands are panel_c_data.csv (see heroSweepData.js). Where that atom sits
 * in the lattice is decorative — no 32,768-cell grid fits in half a stage — but
 * the index, the rank and the score are the record's own.
 *
 * Beats: 0 the tower · 1 it comes apart · 2 through block 26, the glass sets
 *        off · 3 it lands, nineteen light, one is read · 4 the sweep runs and
 *        the atom is driven with it · 5 α = 8 is kept, the cost is shaded.
 */

/* ── left half ──────────────────────────────────────────────────────────── */

const FW = 520
const FH = 250
/* Half as dense as it was. At a 12px pitch the field read as a grey wash rather
   than as a countable set of things, and the magnifier had nothing individual
   to pass over — every lens position covered the same porridge. */
const PITCH = 24
const LENS = 30
/* The steered set, and the route that finds it.
 *
 * The run does not steer one atom. Nineteen α-helix-selective features are
 * driven together, at set-level AUROC 0.90 (m0_feature_set.json), and a picture
 * with a single lit dot under the glass said the opposite — that the
 * intervention was one knob. Six are drawn beside the top-ranked one. Six marks
 * for nineteen atoms is the same convention as the field itself, which is a
 * window onto 32,768 and not a grid of them.
 *
 * Positions first, route second, and that order is the point. Deriving the set
 * from the hunt — walk the path, keep whatever the lens happened to be over —
 * looked principled and drew badly: the picks inherit the shape of the path, so
 * a path that sweeps left-to-right hands back a row of dots however the
 * candidates are filtered. Choosing where the atoms are and then routing the
 * glass through them gives a scatter that was designed and a search that still
 * genuinely finds each one, because the lens passes over it by construction.
 *
 * They are lattice points, they are at least three pitches from each other and
 * from the named atom so the dose can swell them without merging, and two sit
 * below and right of the glass so the set surrounds it rather than trailing off
 * to one side. The order is the order the glass visits them, which zigzags:
 * consecutive stops are on opposite sides of the field, so the hunt reads as
 * casting about rather than as a tour. */
const TOP = { x: 11 * PITCH + PITCH / 2, y: 4 * PITCH + PITCH / 2 }
const HUNT_START = { x: 24, y: 108 }
const SET_POINTS = [
  { x: 228, y: 36 },
  { x: 60, y: 156 },
  { x: 348, y: 156 },
  { x: 84, y: 60 },
  { x: 420, y: 180 },
  { x: 180, y: 180 },
]

/* The hunt, in the top atom's own coordinates, `at` being the fraction of the
   search elapsed. Built from the stops above rather than typed out, so the
   route and the atoms it is a route through cannot drift apart.

   These same numbers are the `glass-hunt` keyframes in the stylesheet, and they
   are also what times the atoms lighting up underneath — each atom is lit at
   the moment the lens first reaches it, which is computed from this path rather
   than from a guess. Change a stop here and the CSS must change with it, which
   is why the two lists are written in the same order and shape. */
const GLASS_PATH = [HUNT_START, ...SET_POINTS, TOP].map((p, i, all) => ({
  at: Math.round((i / (all.length - 1)) * 100) / 100,
  x: p.x - TOP.x,
  y: p.y - TOP.y,
}))
/* How long the search runs, and when it starts, in the beat's own time. 3200,
   up from 2600: the route has seven legs now rather than five, and at the old
   length each swing crossed a third of the field in under 400ms, which reads as
   flustered rather than as looking. The trail delays are computed against
   these, and the landing still falls inside the beat — the callout waits on
   beat 3 plus its own 620ms, which is past the end of the hunt. */
const HUNT_MS = 3200
const HUNT_DELAY = 300

/* The network, laid out on the atom lattice.
 *
 * Every node sits exactly where a lattice dot is — columns four pitches apart,
 * rows one — so when the field fades up behind the zoom the nodes are not near
 * the dots, they are on them. The zoom keeps it that way: it scales by whole
 * numbers about NET_ORIGIN, which is itself a lattice point, and an integer
 * scale about a lattice point maps every lattice point to another one.
 *
 * That is also why this SVG uses `slice` like the field rather than `meet` —
 * two different fits of the same viewBox into the same box put the two pictures
 * on two different grids, and nothing lines up however well it is placed.
 *
 * Laid out once at module scope: the same picture every replay, and rebuilding
 * it per render would be a hundred and nineteen allocations a beat. */
const NET_ORIGIN = { x: PITCH / 2 + 10 * PITCH, y: PITCH / 2 + 5 * PITCH }
const NET_COLUMNS = [5, 7, 7, 5]
const NET_NODES = NET_COLUMNS.flatMap((count, c) =>
  Array.from({ length: count }, (_, i) => ({
    key: `${c}-${i}`,
    c,
    x: PITCH / 2 + (4 + c * 4) * PITCH,
    y: NET_ORIGIN.y + (i - (count - 1) / 2) * PITCH,
  })),
)
const NET_EDGES = NET_NODES.flatMap((a) =>
  NET_NODES.filter((b) => b.c === a.c + 1).map((b) => ({
    key: `${a.key}>${b.key}`,
    x1: a.x,
    y1: a.y,
    x2: b.x,
    y2: b.y,
  })),
)

/* ── right half ─────────────────────────────────────────────────────────── */

const W = 500
const H = 184
const X0 = 52
const X1 = 484
/* hi is 95 against an 86.0 maximum. The headroom is not decorative: at hi = 90
   the 90 tick landed on the axis title and the top of the plot had no air
   above the α = 24 point. */
const HELIX = { top: 6, h: 120, lo: 40, hi: 95 }
const ORF = { top: 134, h: 20, lo: 0.6, hi: 0.95 }

const x = (alpha) => X0 + (alpha / 32) * (X1 - X0)
const yH = (v) => HELIX.top + HELIX.h * (1 - (v - HELIX.lo) / (HELIX.hi - HELIX.lo))
const yO = (v) => ORF.top + ORF.h * (1 - (v - ORF.lo) / (ORF.hi - ORF.lo))

export default function SceneExecute({ step, beat }) {
  const uid = useId().replace(/:/g, '')
  const wipeClip = `sc-exec-wipe-${uid}`

  const top = TOP

  /* The atoms the glass goes over, and when it first reaches each one.

     The lattice is walked once, and every dot the lens comes within reach of at
     any point along the hunt is kept, tagged with the earliest moment it was
     reached. That is what makes the field react to the search instead of to a
     stopwatch: on the way back the glass re-crosses atoms it has already lit,
     and those stay lit rather than flashing again.

     The steered set is timed off the same walk. Its positions are chosen up at
     module scope, but when each one lights is not: it is the moment the lens
     first covers it, so the set accumulates across the hunt and the reader
     watches a dictionary being screened and a handful being kept. */
  const { trail, lit } = useMemo(() => {
    const SAMPLES = 240
    const at = (u) => {
      const k = GLASS_PATH.findIndex((p, i) => i > 0 && p.at >= u)
      const a = GLASS_PATH[k - 1]
      const b = GLASS_PATH[k]
      const f = (u - a.at) / (b.at - a.at)
      return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f }
    }
    const seen = new Map()
    for (let s = 0; s <= SAMPLES; s += 1) {
      const u = s / SAMPLES
      const c = at(u)
      const cx = top.x + c.x
      const cy = top.y + c.y
      const lo = (v) => Math.floor((v - LENS) / PITCH)
      const hi = (v) => Math.ceil((v + LENS) / PITCH)
      for (let gx = lo(cx); gx <= hi(cx); gx += 1) {
        for (let gy = lo(cy); gy <= hi(cy); gy += 1) {
          const px = gx * PITCH + PITCH / 2
          const py = gy * PITCH + PITCH / 2
          if (px < 0 || px > FW || py < 0 || py > FH) continue
          if (Math.hypot(px - cx, py - cy) > LENS * 0.78) continue
          const key = `${px}-${py}`
          const t = HUNT_DELAY + u * HUNT_MS
          const rec = seen.get(key)
          /* First contact opens the window and the last moment of that same
             pass closes it. A pass is "the same" while the samples keep
             arriving — a gap means the glass left and came back, and the atom
             has already been and gone by then. */
          if (!rec) seen.set(key, { x: px, y: py, from: t, to: t, live: true })
          else if (rec.live && t - rec.to < HUNT_MS / SAMPLES + 1) rec.to = t
          else rec.live = false
        }
      }
      seen.forEach((rec) => {
        if (rec.live && HUNT_DELAY + u * HUNT_MS - rec.to > HUNT_MS / SAMPLES + 1) rec.live = false
      })
    }
    /* 300ms is the floor: an atom the lens only grazes still has to be seen to
       swell and settle, and under that it reads as a flicker.

       `lit` is first contact per lattice key, which is what the steered marks
       are delayed by. +60ms against the trail's −120: the atom underneath is at
       the top of its swell when the mark that keeps it arrives, so the set
       reads as picked out of the search rather than as printed over it. */
    const litAt = new Map()
    seen.forEach((r, key) => litAt.set(key, Math.round(r.from + 60)))
    return {
      trail: [...seen.values()].map((r) => ({
        x: r.x,
        y: r.y,
        d: Math.round(r.from - 120),
        h: Math.round(Math.max(300, r.to - r.from + 240)),
      })),
      lit: litAt,
    }
  }, [top.x, top.y])

  /* The marks, and the ripples, from one list — so a position can never be
     drawn in one and missed in the other.

     The named atom is forced to the end of the hunt rather than to its own
     first contact. The route passes within a lens-radius of it on the way to a
     stop further right, and a callout that appears while the glass is still off
     somewhere else says the search was over before it finished. */
  const steered = useMemo(
    () =>
      [...SET_POINTS, TOP].map((p, i, all) => ({
        x: p.x,
        y: p.y,
        i,
        top: i === all.length - 1,
        d: i === all.length - 1 ? HUNT_DELAY + HUNT_MS : (lit.get(`${p.x}-${p.y}`) ?? HUNT_DELAY),
      })),
    [lit],
  )

  const geom = useMemo(() => build(), [])
  const selected = HERO_SWEEP.points.find((p) => p.alpha === HERO_SWEEP.selectedAlpha)

  return (
    <div className="sc sc--bare">
      <div className="sc__body sc-exec" data-beat={beat}>

        <section className="sc-exec__find">
          {/* One caption, and only once there is something to caption. While the
              tower is coming apart the picture says what it is doing; naming
              the block count and then the block being opened was the drawing's
              own commentary, printed next to the drawing. */}
          <p className="sc-exec__cap">
            <b>Evo2-7B</b>
            <span>{beat < 2 ? '' : step.dictionary}</span>
          </p>

          <div className="sc-dive__well">
            {/* No caption inside the well. It named the model in the one place
                the model is already named — the caption above the panel reads
                "Evo2-7B" — and it was never styled, so it printed at body size
                in the well's own flow while the drawing underneath it was
                absolutely positioned. The zoom then ran the network straight
                through the words. */}

            {/* The model, and then the way in.
                A network is drawn, then magnified until its nodes are further
                apart than the frame is wide, and by the time it has gone the
                field of atoms is already there — same size of dot, same spacing,
                so the lattice reads as what you arrive at by going in far
                enough rather than as a second picture that replaced the first. */}
            <svg className="sc-dive__net" viewBox={`0 0 ${FW} ${FH}`} preserveAspectRatio="xMidYMid slice">
              <g className="sc-dive__net-zoom">
                <g className="sc-dive__net-edges">
                  {NET_EDGES.map((e) => (
                    <line key={e.key} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} />
                  ))}
                </g>
                <g className="sc-dive__net-nodes">
                  {NET_NODES.map((n) => (
                    <circle key={n.key} cx={n.x} cy={n.y} r="4.2" />
                  ))}
                </g>
              </g>
            </svg>

            <svg className="sc-dive__field" viewBox={`0 0 ${FW} ${FH}`} preserveAspectRatio="xMidYMid slice">
              <defs>
                {/* The lattice, split in two.
                    Both patterns tile at twice the pitch and each carries one
                    diagonal of a 2×2 cell, so together they paint exactly the
                    lattice a single pattern painted before. Apart, they can
                    breathe on different clocks — which is the difference between
                    a field that is alive and a field that blinks in unison.

                    fill is set on the circles themselves: pattern content does
                    not resolve `currentColor` against the element referencing
                    the pattern, so inheriting the colour from the rect left the
                    whole lattice — the 32,768 the scene is about — invisible. */}
                <pattern id={`atoms-a-${uid}`} width={PITCH * 2} height={PITCH * 2} patternUnits="userSpaceOnUse">
                  <circle className="sc-dive__atom" cx={PITCH * 0.5} cy={PITCH * 0.5} r="1.8" fill="var(--atom-ink, #c3c8c2)" />
                  <circle className="sc-dive__atom" cx={PITCH * 1.5} cy={PITCH * 1.5} r="1.8" fill="var(--atom-ink, #c3c8c2)" />
                </pattern>
                <pattern id={`atoms-b-${uid}`} width={PITCH * 2} height={PITCH * 2} patternUnits="userSpaceOnUse">
                  <circle className="sc-dive__atom" cx={PITCH * 1.5} cy={PITCH * 0.5} r="1.8" fill="var(--atom-ink, #c3c8c2)" />
                  <circle className="sc-dive__atom" cx={PITCH * 0.5} cy={PITCH * 1.5} r="1.8" fill="var(--atom-ink, #c3c8c2)" />
                </pattern>

                {/* No mask, no magnified copy of the field, no fill. What a
                    magnifier does is make the things under it bigger, and that
                    is done here by the atoms themselves — every one the lens
                    reaches swells while it is under the glass and settles back
                    when it moves on. The rim is empty; you see the field
                    through it, because it is the field.

                    The previous version punched a hole in the lattice with an
                    animated mask and painted a 2.2× copy inside the rim. The
                    mask's content animated — same keyframes, same currentTime
                    as the rim, both verifiable — but the mask itself was not
                    re-rasterised as it did, so the hole never moved and the two
                    copies of the field printed on top of each other. That is
                    what made the lens read as opaque. */}
              </defs>

              <g>
                <rect className="sc-dive__atoms sc-dive__atoms--a" x="0" y="0" width={FW} height={FH} fill={`url(#atoms-a-${uid})`} />
                <rect className="sc-dive__atoms sc-dive__atoms--b" x="0" y="0" width={FW} height={FH} fill={`url(#atoms-b-${uid})`} />

                <g className="sc-dive__trail">
                  {trail.map((p) => (
                    <circle key={`${p.x}-${p.y}`} cx={p.x} cy={p.y} r="1.8" style={{ '--d': `${p.d}ms`, '--h': `${p.h}ms` }} />
                  ))}
                </g>

                {/* The steered set, one ink — the glass's own, because they are
                    what the glass found. The named atom is a size up and that
                    is the whole hierarchy: a second colour for the top-ranked
                    one made it look like a different kind of thing from the
                    six it is ranked within. Each carries the moment the lens
                    reached it, so they arrive across the hunt. */}
                <g className="sc-dive__hits">
                  {steered.map((p) => (
                    <circle
                      key={`${p.x}-${p.y}`}
                      cx={p.x}
                      cy={p.y}
                      r={p.top ? 5.5 : 4.6}
                      data-top={p.top ? 'true' : undefined}
                      style={{ '--d': `${p.d}ms`, '--i': p.i }}
                    />
                  ))}
                </g>
              </g>

              {/* What the picture is doing, said low and in the middle, where a
                  caption goes — not hung off the named atom. Hung there it moved
                  with the subject and sat wherever that atom happened to be,
                  which on a field this wide was off to one side and only ever
                  legible as a label for that one dot.

                  Two lines, cross-faded, rather than one whose text is swapped:
                  the drawing has two acts — the set is found, then the set is
                  driven — and a caption changing under a hard cut says the
                  second act is a correction of the first.

                  Drawn before the glass and the ripples, so both pass over
                  it. Drawn after them the caption won: its halo — the stroke of
                  surface colour that keeps the lattice out of the type — took a
                  bite out of the magnifier's handle every time the hunt swung
                  low, which is a white gash across the one object that is
                  supposed to be solid. Rings and a lens crossing a caption read
                  as things moving over a drawing, which is what they are.

                  FH − 42 rather than the foot of the viewBox: the field is
                  cropped top and bottom by `slice`, and a caption on the last
                  line of the drawing is a caption on a line nobody sees. */}
              <text
                className="sc-dive__stage-label"
                data-phase="find"
                x={FW / 2}
                y={FH - 42}
                textAnchor="middle"
              >
                Identifying SAE feature set
              </text>
              <text
                className="sc-dive__stage-label"
                data-phase="steer"
                x={FW / 2}
                y={FH - 42}
                textAnchor="middle"
              >
                Steering SAE feature set
              </text>

              <g transform={`translate(${top.x} ${top.y})`}>
                <g className="sc-dive__glass">
                  <circle className="sc-dive__lens" r={LENS} />
                  <line className="sc-dive__handle" x1={LENS * 0.72} y1={LENS * 0.72} x2={LENS * 1.62} y2={LENS * 1.62} />
                </g>

                {/* The index, and nothing under it. The rank and the AUROC used
                    to run on a second line, and once the set around it was
                    drawn they were the wrong two numbers to print: they score
                    this one atom, on a picture whose subject had become the
                    group. The line was also 25 monospace characters starting
                    46 units right of an atom that sits past the middle of the
                    field, so it ran into the mask's feather and lost its last
                    glyphs. What the callout is for is saying which atom the
                    glass stopped on. */}
                <g className="sc-dive__tag" transform={`translate(${LENS + 16} -34)`}>
                  <text className="sc-dive__tag-id" x="0" y="0">{step.top.id}</text>
                </g>

                <line className="sc-dive__leader" x1={LENS * 0.74} y1={-LENS * 0.74} x2={LENS + 12} y2="-30" />

              </g>


              {/* Beats 4–5: the features are driven, and the drive is the same
                  beat that is running the sweep on the right. No arrow — an
                  arrow from an atom to somewhere below it draws a data path,
                  and what is happening is not a path but a set of atoms being
                  held above zero.

                  Every steered atom ripples, not just the named one. Rings on
                  one dot while six others merely swelled read as one feature
                  being driven and six being watched; the run drives all of
                  them. Drawn last of everything in the field so they cross the
                  lens rather than being trapped under it, and each group is
                  offset in phase by its index — seven rings expanding on the
                  same frame is a strobe, staggered they are a set responding. */}
              <g className="sc-dive__pulses">
                {steered.map((p) => (
                  <g
                    key={`${p.x}-${p.y}`}
                    className="sc-dive__pulse"
                    transform={`translate(${p.x} ${p.y})`}
                    style={{ '--i': p.i }}
                  >
                    <circle r={p.top ? 12 : 10} style={{ '--k': 0 }} />
                    <circle r={p.top ? 12 : 10} style={{ '--k': 1 }} />
                    {p.top ? <circle r="12" style={{ '--k': 2 }} /> : null}
                  </g>
                ))}
              </g>

            </svg>
          </div>
        </section>

        <section className="sc-exec__dose">
          <p className="sc-exec__cap">
            <b>Dose-Response Curve</b>
          </p>

          <svg className="sc-sweep__chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
            <defs>
              <clipPath id={wipeClip} clipPathUnits="userSpaceOnUse">
                <rect className="sc-sweep__wipe" x={X0} y="0" width={X1 - X0} height={H} />
              </clipPath>
            </defs>

            <g className="sc-sweep__grid">
              {[50, 60, 70, 80].map((v) => (
                <line key={v} x1={X0} x2={X1} y1={yH(v)} y2={yH(v)} />
              ))}
              {[0.7, 0.9].map((v) => (
                <line key={v} x1={X0} x2={X1} y1={yO(v)} y2={yO(v)} />
              ))}
            </g>

            {/* The cost strip carries no numeric ticks: its two gridlines sit 13
                units apart and any type that fits between them is unreadable.
                The strip is here for the shape of the fall, and the axis title
                says what is falling. */}
            <g className="sc-sweep__ticks">
              {[50, 70, 90].map((v) => (
                <text key={v} x={X0 - 8} y={yH(v) + 3.5} textAnchor="end">{v}</text>
              ))}
              {[0, 8, 16, 24, 32].map((a) => (
                <text key={a} className="sc-sweep__xtick" x={x(a)} y={H - 24} textAnchor="middle">{a}</text>
              ))}
            </g>

            <line className="sc-sweep__baseline" x1={X0} x2={X1} y1={yH(HERO_SWEEP.baseline)} y2={yH(HERO_SWEEP.baseline)} />
            <text className="sc-sweep__baseline-tag" x={X1 - 2} y={yH(HERO_SWEEP.baseline) - 6} textAnchor="end">
              unsteered · {HERO_SWEEP.baseline.toFixed(1)}%
            </text>

            <g clipPath={`url(#${wipeClip})`}>
              <path className="sc-sweep__band" d={geom.helixBand} />
              <path className="sc-sweep__band sc-sweep__band--orf" d={geom.orfBand} />
              <path className="sc-sweep__line" d={geom.helixLine} />
              <path className="sc-sweep__line sc-sweep__line--orf" d={geom.orfLine} />
            </g>

            <g className="sc-sweep__dots">
              {HERO_SWEEP.points.map((p) => (
                <circle key={p.alpha} cx={x(p.alpha)} cy={yH(p.helix)} r="3.2" style={{ '--t': p.alpha / 32 }} />
              ))}
            </g>

            {/* The dose that was kept. */}
            <g className="sc-sweep__pick">
              <line x1={x(8)} x2={x(8)} y1={yH(selected.helix) - 4} y2={ORF.top + ORF.h} />
              <circle className="sc-sweep__pick-dot" cx={x(8)} cy={yH(selected.helix)} r="5" />
              {/* Directly over the marker. Centred, so it does not run left into
                  the y-axis ticks the way an end-anchored label did, and high
                  enough to clear the curve climbing underneath it. */}
              <text
                className="sc-sweep__pick-value"
                x={x(8)}
                y={yH(selected.helix) - 16}
                textAnchor="middle"
              >
                56.6% <tspan>(+12.8pp)</tspan>
              </text>
            </g>

            {/* The cost, shaded where it happens. */}
            <g className="sc-sweep__cost">
              <rect x={x(8)} y={ORF.top - 5} width={X1 - x(8)} height={ORF.h + 10} />
            </g>

            <text className="sc-sweep__axis" x={(X0 + X1) / 2} y={H - 4} textAnchor="middle">
              steering coefficient α
            </text>
            {/* Sat 10 units above the plot's midpoint rather than on it. The
                label is 79 units long against a 120-unit plot, so centring it
                left it reading low against the part of the curve that matters —
                the climb, which happens in the plot's upper half. */}
            <text
              className="sc-sweep__axis"
              x="12"
              y={HELIX.top + HELIX.h / 2 - 10}
              textAnchor="middle"
              transform={`rotate(-90 12 ${HELIX.top + HELIX.h / 2 - 10})`}
            >
              α-helix (%)
            </text>
            <text
              className="sc-sweep__axis"
              x="12"
              y={ORF.top + ORF.h / 2}
              textAnchor="middle"
              transform={`rotate(-90 12 ${ORF.top + ORF.h / 2})`}
            >
              valid-ORF
            </text>
          </svg>
        </section>
      </div>
    </div>
  )
}

function build() {
  const pts = HERO_SWEEP.points
  return {
    helixLine: line(pts.map((p) => [x(p.alpha), yH(p.helix)])),
    orfLine: line(pts.map((p) => [x(p.alpha), yO(p.orf)])),
    helixBand: band(
      pts.map((p) => [x(p.alpha), yH(p.helixHi)]),
      pts.map((p) => [x(p.alpha), yH(p.helixLo)]),
    ),
    orfBand: band(
      pts.map((p) => [x(p.alpha), yO(p.orfHi)]),
      pts.map((p) => [x(p.alpha), yO(p.orfLo)]),
    ),
  }
}

function line(points) {
  return points.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`).join(' ')
}

function band(hi, lo) {
  const up = hi.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`)
  const down = [...lo].reverse().map(([px, py]) => `L${px.toFixed(1)} ${py.toFixed(1)}`)
  return `${up.join(' ')} ${down.join(' ')} Z`
}
