import { useEffect, useMemo, useRef, useState } from 'react'
import { m, useInView } from 'motion/react'
import { VARIANTS, VIEWPORT } from '../../lib/motionTokens.js'
import usePrefersReducedMotion from '../../lib/usePrefersReducedMotion.js'
import { watchForStuckReveal } from './revealFallback.js'
import './motion.css'

/* The one scroll-reveal on the site. Everything that fades up on entry goes
   through here, so the timing, the distance and the failure handling are
   decided once.

   Two things about this component are load-bearing and easy to undo by
   accident:

   1. Under reduced motion it does not animate *faster*, it does not animate at
      all — `initial={false}` means the element is simply there, mounted
      visible, with no opacity: 0 phase to get stuck in. Shortening the
      duration would still leave the hidden state on the element for a frame,
      and would still be motion where the reader asked for none.

   2. Nothing above the fold may use it. `whileInView` starts at opacity: 0,
      and an element at opacity: 0 is not a Largest Contentful Paint candidate
      until it paints — so wrapping a hero headline in a Reveal directly
      inflates LCP by the observer delay plus the animation. That is the most
      common way a motion pass regresses Core Web Vitals. Hero entrance motion
      belongs on the canvas backdrop and the stat row, not on the h1. If a
      headline must move, animate a clip-path inset on a wrapper and leave the
      text at opacity: 1.

   Note also that global.css cancels `transform` on :hover and :focus-visible
   with !important under reduced motion. That would snap a reveal mid-flight if
   the reader hovered it — unreachable today because point 1 means nothing is
   ever in flight under reduce, but it is why point 1 cannot become "animate
   quickly instead". */
export default function Reveal({
  as: Tag = 'div',
  variant = 'fadeUp',
  delay = 0,
  amount,
  className,
  children,
  ...rest
}) {
  const reduced = usePrefersReducedMotion()
  const ref = useRef(null)
  const [forced, setForced] = useState(false)

  const viewport = amount == null ? VIEWPORT : { ...VIEWPORT, amount }
  const inView = useInView(ref, viewport)
  const visible = reduced || inView || forced

  useEffect(() => {
    if (visible) return undefined
    return watchForStuckReveal(ref, () => setForced(true))
  }, [visible])

  /* Intrinsic tags only here — a Reveal wraps a block of content, so there has
     never been a reason to reveal a component directly. Stagger carries the
     component-aware version, because its items sometimes have to *be* the
     links in a grid. */
  const MotionTag = m[Tag] ?? m.div

  /* Delay is folded into the variant rather than passed as the `transition`
     prop: a transition declared *inside* a variant wins over the prop, so
     `transition={{ delay }}` next to a variant that carries its own duration
     and easing is silently ignored. */
  const variants = useMemo(() => {
    const base = VARIANTS[variant] ?? VARIANTS.fadeUp
    if (!delay) return base
    return {
      hidden: base.hidden,
      visible: {
        ...base.visible,
        transition: { ...base.visible.transition, delay },
      },
    }
  }, [variant, delay])

  return (
    <MotionTag
      ref={ref}
      className={className}
      variants={variants}
      initial={reduced ? false : 'hidden'}
      animate={visible ? 'visible' : 'hidden'}
      {...rest}
    >
      {children}
    </MotionTag>
  )
}
