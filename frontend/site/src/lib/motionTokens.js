/* The whole motion vocabulary for the site, in one file.

   Three easings and five durations. If a component wants a sixth duration the
   honest fix is almost always to pick the nearer step — the same argument
   tokens.css makes about font sizes, for the same reason: nobody can tell
   0.38s from 0.42s, but everybody can tell when a page animates in four
   slightly different ways.

   Deliberately a plain .js with no JSX. eslint's react-refresh rule warns when
   a module mixes component and non-component exports, so constants live apart
   from the components that consume them. */

export const EASE = {
  /* Entrances. Decelerating, no overshoot. */
  out: [0.22, 0.61, 0.36, 1],
  /* State changes that run in both directions: hover, open/close, toggle. */
  inOut: [0.65, 0.0, 0.35, 1],
  /* Leaving. Accelerates away, because nobody needs to watch an exit. */
  exit: [0.4, 0.0, 1.0, 1],
}

export const DUR = {
  tap: 0.14, // press feedback, route exit
  quick: 0.22, // hover, small state
  base: 0.42, // the default reveal
  slow: 0.7, // large blocks, hero elements
  count: 1.1, // number count-up
}

/** Travel distance, in px, for a reveal. */
export const DIST = { sm: 10, base: 18, lg: 28 }

export const T = {
  quick: { duration: DUR.quick, ease: EASE.inOut },
  base: { duration: DUR.base, ease: EASE.out },
  slow: { duration: DUR.slow, ease: EASE.out },
  exit: { duration: DUR.tap, ease: EASE.exit },
}

/* One viewport config for every scroll-triggered reveal on the site.

   The -12% bottom margin fires the reveal slightly *before* the block reaches
   the comfortable reading position, so somebody scrolling at a normal pace
   never sits and watches an element animate in — they arrive to find it
   already there. A reveal the reader has to wait for is worse than no reveal.

   `once` matters for more than taste: re-animating on every scroll-past means
   content flickers when a reader scrolls back up to re-read something. */
export const VIEWPORT = { once: true, amount: 0.2, margin: '0px 0px -12% 0px' }

export const VARIANTS = {
  fadeUp: {
    hidden: { opacity: 0, y: DIST.base },
    visible: { opacity: 1, y: 0, transition: T.base },
  },
  fadeUpSm: {
    hidden: { opacity: 0, y: DIST.sm },
    visible: { opacity: 1, y: 0, transition: T.base },
  },
  fadeUpLg: {
    hidden: { opacity: 0, y: DIST.lg },
    visible: { opacity: 1, y: 0, transition: T.slow },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: T.base },
  },
  /* For figures and charts: scale is a cheap way to say "this is a specimen
     being placed on the page" without moving it out of its own column. */
  rise: {
    hidden: { opacity: 0, y: DIST.base, scale: 0.985 },
    visible: { opacity: 1, y: 0, scale: 1, transition: T.slow },
  },
}

/** Parent variants for a staggered group. Children use one of VARIANTS. */
export function staggerParent(gap = 0.06, delay = 0) {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: gap, delayChildren: delay } },
  }
}
