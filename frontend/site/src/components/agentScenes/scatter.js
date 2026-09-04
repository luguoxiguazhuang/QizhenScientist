/* Deterministic scatter for the hero scenes.
 *
 * Two node clouds and a feature field have to look strewn about without being
 * strewn about: the same layout has to come back on every replay, every reload
 * and every screenshot, or a regression shot is a coin toss. Math.random would
 * give a different picture each time and nothing to compare against.
 *
 * mulberry32 on a fixed seed — small, fast, and good enough for placing dots.
 */

export function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* Points inside an ellipse, pushed out from the middle so the cloud reads as a
   cloud rather than a blob: sqrt on the radius alone gives a uniform disc,
   which looks dense in the centre and empty at the rim. */
export function cloud({ seed, count, cx, cy, rx, ry }) {
  const next = rng(seed)
  const out = []
  for (let i = 0; i < count; i += 1) {
    const angle = next() * Math.PI * 2
    const radius = 0.32 + 0.68 * Math.sqrt(next())
    out.push({
      i,
      x: cx + Math.cos(angle) * rx * radius,
      y: cy + Math.sin(angle) * ry * radius,
      r: 1.5 + next() * 2.1,
    })
  }
  return out
}

/* Edges between points that are already close, so the graph looks like a graph
   and not a cat's cradle. Capped, because every extra line is ink. */
export function nearEdges(points, { max = 16, within = 46 } = {}) {
  const out = []
  for (let a = 0; a < points.length && out.length < max; a += 1) {
    for (let b = a + 1; b < points.length && out.length < max; b += 1) {
      const dx = points[a].x - points[b].x
      const dy = points[a].y - points[b].y
      if (Math.hypot(dx, dy) < within) out.push([points[a], points[b]])
    }
  }
  return out
}
