import { useSyncExternalStore } from 'react'

/* One source of truth for the reduced-motion preference, for everything that
   is *not* a motion component: the hero canvas, CountUp, and any hand-rolled
   requestAnimationFrame loop written later.

   Deliberately not motion's own useReducedMotion. The canvas is the single
   most expensive thing on the site and it must be able to switch itself off
   without depending on the animation library being present — and having two
   hooks that answer the same question is how they end up disagreeing.

   global.css already has a strong `prefers-reduced-motion: reduce` block, but
   CSS media queries cannot reach a rAF loop or a JS tween. That is exactly the
   gap this fills. */

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(onChange) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {}
  const mql = window.matchMedia(QUERY)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

function getSnapshot() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia(QUERY).matches
}

/* Server snapshot is `false` — no SSR here (Vite SPA), but useSyncExternalStore
   demands it and `false` is the right answer for a first paint that has not
   yet asked the OS. */
function getServerSnapshot() {
  return false
}

export default function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
