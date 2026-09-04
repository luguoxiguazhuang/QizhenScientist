/* The safety net under every scroll-triggered reveal on the site.

   A reveal works by setting the element to opacity: 0 and waiting for
   IntersectionObserver to say it is on screen. That trade is fine right up
   until the observer does not fire — an ancestor with `overflow: hidden` and a
   zero-height collapse, a `content-visibility` interaction, a browser bug, a
   detached subtree — at which point the content is not merely un-animated, it
   is *permanently invisible*. A missed animation is a cosmetic bug; text a
   reader can never see is a broken page. The asymmetry is the whole reason
   this file exists.

   The rule: an element registers here when it mounts hidden, and unregisters
   the moment the observer reports it. Anything still registered past its
   deadline gets a manual rect test on the next scroll, and is forced visible
   if it is genuinely on screen. Normal path: the observer fires within a
   frame, nothing here ever runs. Broken path: the reader scrolls, and the
   content appears.

   One listener for the whole document, not one per reveal — a page can carry
   forty of these.

   Only scroll and resize, no polling interval. If the observer is broken the
   reader has to scroll to reach the content anyway, so scroll is the event
   that matters; polling would mean a forced layout every tick for every
   below-the-fold block, for a failure mode that is rare. */

const GRACE_MS = 1200

const pending = new Set()
let listening = false
let frame = 0

function flush() {
  frame = 0
  const now = performance.now()
  const viewportH = window.innerHeight || document.documentElement.clientHeight

  /* All reads, no writes in between: the browser flushes layout once for the
     whole loop rather than once per element. */
  for (const entry of pending) {
    if (now < entry.deadline) continue
    const el = entry.ref.current
    if (!el) {
      pending.delete(entry)
      continue
    }
    const rect = el.getBoundingClientRect()
    if (rect.top < viewportH && rect.bottom > 0) {
      pending.delete(entry)
      entry.show()
    }
  }

  if (pending.size === 0) stop()
}

function schedule() {
  if (frame) return
  frame = requestAnimationFrame(flush)
}

function start() {
  if (listening) return
  listening = true
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule, { passive: true })
}

function stop() {
  if (!listening) return
  listening = false
  window.removeEventListener('scroll', schedule)
  window.removeEventListener('resize', schedule)
  if (frame) {
    cancelAnimationFrame(frame)
    frame = 0
  }
}

/**
 * Register an element that is currently hidden awaiting a reveal.
 * @param {{current: HTMLElement|null}} ref
 * @param {() => void} show called if the observer appears to have failed
 * @returns {() => void} unregister — call as soon as the reveal fires
 */
export function watchForStuckReveal(ref, show) {
  const entry = { ref, show, deadline: performance.now() + GRACE_MS }
  pending.add(entry)
  start()
  return () => {
    pending.delete(entry)
    if (pending.size === 0) stop()
  }
}
