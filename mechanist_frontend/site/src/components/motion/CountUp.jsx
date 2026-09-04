import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { animate, useInView } from 'motion/react'
import { DUR, EASE, VIEWPORT } from '../../lib/motionTokens.js'
import usePrefersReducedMotion from '../../lib/usePrefersReducedMotion.js'
import { watchForStuckReveal } from './revealFallback.js'
import './motion.css'

/* Splits "48.6%" into "" / "48.6" / "%", "+15.3%" into "+" / "15.3" / "%",
   "157M" into "" / "157" / "M".

   Anything holding more than one number — "0.86 → 0.34", "43.8% → 56.6%",
   "L4.H1", "~2k steps" — deliberately fails to match and renders as static
   text. Several metric values in the case content are exactly that shape, and
   a count-up that animates half of an arrow-joined pair is worse than none. */
const SINGLE_NUMBER = /^([^\d]*?)([+-]?\d[\d,]*(?:\.\d+)?)([^\d]*)$/

function parseValue(raw) {
  if (typeof raw !== 'string') return null
  const match = SINGLE_NUMBER.exec(raw.trim())
  if (!match) return null

  const [, prefix, numeral, suffix] = match
  const target = Number(numeral.replace(/,/g, ''))
  if (!Number.isFinite(target)) return null

  const dot = numeral.indexOf('.')
  return {
    prefix,
    suffix,
    target,
    decimals: dot === -1 ? 0 : numeral.length - dot - 1,
    grouped: numeral.includes(','),
  }
}

function format(value, { prefix, suffix, decimals, grouped }) {
  const fixed = value.toFixed(decimals)
  if (!grouped) return `${prefix}${fixed}${suffix}`
  const [whole, frac] = fixed.split('.')
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${prefix}${frac ? `${withCommas}.${frac}` : withCommas}${suffix}`
}

/* Counts a figure up when it scrolls into view.

   Three things worth not undoing:

   Accessibility — the outer span carries the final value as its accessible
   name and the animating span is aria-hidden, so a screen reader announces
   "48.6%" once instead of reading a ticking number.

   Rendering — the tween writes textContent directly rather than going through
   state. Sixty renders a second for a decorative effect is not a trade worth
   making, and React would be re-rendering the whole surrounding card each
   frame.

   Failure mode — React renders the *final* value, and the zero state is
   written in a layout effect, before paint. So the server-of-record markup is
   always the real number: if JS dies between render and the tween, or the
   observer never fires, the reader sees "48.6%" rather than a stuck "0". The
   same shared fallback that protects Reveal is registered here for the case
   where the element is on screen but the observer stayed quiet. */
export default function CountUp({ value, duration = DUR.count, className = '' }) {
  const reduced = usePrefersReducedMotion()
  const parsed = useMemo(() => parseValue(value), [value])
  /* Two refs, deliberately. `viewRef` is handed to useInView and is therefore
     owned by a hook — writing through it trips react-hooks/immutability, and
     the rule is right that mixing "observed by a hook" with "mutated by hand"
     on one ref is asking for trouble. `textRef` points at the inner span and
     is the only thing the tween touches. */
  const viewRef = useRef(null)
  const textRef = useRef(null)
  const [forced, setForced] = useState(false)
  const inView = useInView(viewRef, VIEWPORT)
  const shouldRun = Boolean(parsed) && !reduced && (inView || forced)

  useLayoutEffect(() => {
    if (!parsed || reduced) return
    const node = textRef.current
    if (node) node.textContent = format(0, parsed)
  }, [parsed, reduced])

  useEffect(() => {
    if (!parsed || reduced || shouldRun) return undefined
    return watchForStuckReveal(viewRef, () => setForced(true))
  }, [parsed, reduced, shouldRun])

  useEffect(() => {
    if (!shouldRun) return undefined
    const node = textRef.current
    if (!node) return undefined

    const controls = animate(0, parsed.target, {
      duration,
      ease: EASE.out,
      onUpdate: (v) => {
        node.textContent = format(v, parsed)
      },
      onComplete: () => {
        node.textContent = value
      },
    })
    return () => controls.stop()
  }, [shouldRun, parsed, duration, value])

  if (!parsed) {
    return <span className={className}>{value}</span>
  }

  return (
    <span ref={viewRef} className={`count-up ${className}`.trim()} aria-label={value}>
      <span ref={textRef} aria-hidden="true">
        {value}
      </span>
    </span>
  )
}
