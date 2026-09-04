import { useEffect, useMemo, useRef, useState } from 'react'
import { m, useInView } from 'motion/react'
import { VARIANTS, VIEWPORT, staggerParent } from '../../lib/motionTokens.js'
import usePrefersReducedMotion from '../../lib/usePrefersReducedMotion.js'
import { watchForStuckReveal } from './revealFallback.js'
import './motion.css'

/* A group whose children arrive one after another. Card grids, stat rows,
   stage lists.

   The group is what watches the viewport; the children only inherit. That is
   the point of doing this with variants rather than N Reveals with hand-typed
   delays — a list of six cards animates as one gesture with one observer,
   and adding a seventh card does not require someone to remember to type
   `delay={0.36}`.

   Keep `gap` small. At 0.06s a row of four finishes 180ms after it starts,
   which reads as one movement with texture. At 0.15s it reads as four
   separate events and the reader waits for the last one. */
export function Stagger({
  as: Tag = 'div',
  gap = 0.06,
  delay = 0,
  amount,
  /* 'view' waits for the group to scroll into range. 'mount' runs once on
     first paint, and is what above-the-fold groups use — a hero stat row is
     already on screen, so making it wait for an IntersectionObserver callback
     adds a frame or two of visible nothing for no reason. */
  trigger = 'view',
  className,
  children,
  ...rest
}) {
  const reduced = usePrefersReducedMotion()
  const ref = useRef(null)
  const [forced, setForced] = useState(false)

  const viewport = amount == null ? VIEWPORT : { ...VIEWPORT, amount }
  const inView = useInView(ref, viewport)
  const visible = reduced || trigger === 'mount' || inView || forced

  useEffect(() => {
    if (visible) return undefined
    return watchForStuckReveal(ref, () => setForced(true))
  }, [visible])

  const variants = useMemo(() => staggerParent(gap, delay), [gap, delay])
  /* Inlined rather than pulled into a helper: react-hooks/static-components
     cannot see through a call and reports any component-valued function result
     as "created during render".

     `as` therefore takes either an intrinsic tag name or an ALREADY
     motion-wrapped component — the site has one, MotionLink in ./motionTags.js.
     Wrapping it here with m.create() would mint a new component type on every
     render and remount the subtree; module scope is where that belongs. */
  const MotionTag = typeof Tag === 'string' ? m[Tag] ?? m.div : Tag

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

/* A child of Stagger. It carries no viewport logic and no delay of its own —
   both come from the parent through the variant cascade. Its `initial` is
   deliberately unset so it inherits the parent's, which is how motion knows
   these belong to one orchestration. */
export function StaggerItem({ as: Tag = 'div', variant = 'fadeUp', className, children, ...rest }) {
  /* Same `as` contract as Stagger above — see the note there. */
  const MotionTag = typeof Tag === 'string' ? m[Tag] ?? m.div : Tag
  const variants = VARIANTS[variant] ?? VARIANTS.fadeUp

  return (
    <MotionTag className={className} variants={variants} {...rest}>
      {children}
    </MotionTag>
  )
}

