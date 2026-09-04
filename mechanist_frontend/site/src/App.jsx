import { Suspense, lazy, useCallback, useEffect, useRef } from 'react'
import {
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from 'react-router-dom'
import { AnimatePresence, m } from 'motion/react'
import SiteHeader from './components/SiteHeader.jsx'
import Hero from './components/Hero.jsx'
import HomeInnovations from './components/HomeInnovations.jsx'
import SiteFooter from './components/SiteFooter.jsx'
import NotFoundPage from './components/NotFoundPage.jsx'
import RouteFallback from './components/RouteFallback.jsx'
import { T } from './lib/motionTokens.js'
import { PAGE_ACCENTS } from './content/mechanistContent.js'

// Split out, not imported: the Database page is the only thing on the site that
// needs sigma + graphology + marked, and together those are most of the bundle.
// Statically imported, every visitor downloaded a graph engine to read the home
// page.
const DatabasePage = lazy(() => import('./components/DatabasePage.jsx'))

// The two case routes carry the site's heaviest content — paper figures, data
// charts, and four case bodies that are themselves split again behind their own
// Suspense boundary. Splitting them keeps that weight off the home page, which
// is the only page most visitors ever see.


// Opacity only, and short. A route change is navigation, not choreography: the
// transition exists to stop the old page being replaced with a hard cut, and
// anything longer than ~150ms starts to feel like latency the site added.
const PAGE_VARIANTS = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: T.base },
  exit: { opacity: 0, transition: T.exit },
}

// Five beats after the headline, numbered on the page itself: applications,
// the evidence base, the method library, the work pipeline, and how to run it.
function HomePage() {
  return (
    <div className="home-page" style={{ '--page-accent': PAGE_ACCENTS.home }}>
      <Hero />
      <HomeInnovations />
    </div>
  )
}

export default function App() {
  const location = useLocation()
  const navigationType = useNavigationType()

  // Read inside onExitComplete, which fires outside React's render pass and so
  // cannot close over the current render's values.
  //
  // Written in an effect rather than during render, and the ordering that makes
  // that safe is worth stating: a link click re-renders App with the new
  // location, this effect flushes, and only *then* does AnimatePresence spend
  // T.exit fading the outgoing page out before calling onExitComplete. The ref
  // is always describing the incoming navigation by the time it is read.
  const navRef = useRef({ hash: location.hash, navigationType })
  useEffect(() => {
    navRef.current = { hash: location.hash, navigationType }
  }, [location.hash, navigationType])

  // Following a link should land at the top of the new page. Without this the
  // window keeps the previous page's offset and the new one opens mid-way down.
  //
  // This runs on exit-complete rather than in an effect on location change.
  // As an effect it fired while the outgoing page was still fading out, so the
  // reader watched the old page scroll to the top and *then* disappear — the
  // scroll belongs to the new page, so it has to happen after the old one is
  // gone. Back/forward is left alone so the browser can restore its position.
  const resetScroll = useCallback(() => {
    const { hash, navigationType: type } = navRef.current
    if (hash || type === 'POP') return
    // Instant, not smooth: global.css sets `scroll-behavior: smooth`, which
    // would otherwise animate a long scroll up through the incoming page.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  useEffect(() => {
    if (!location.hash) return undefined

    const targetId = decodeURIComponent(location.hash.slice(1))
    if (!targetId) return undefined

    const scrollToTarget = () => {
      const target = document.getElementById(targetId)
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    // Three attempts, because the target may not exist yet for two different
    // reasons: the incoming route is still fading in (T.exit + a frame), or it
    // is a lazy route whose chunk has not arrived. The last retry is the one
    // that catches a cold Database or Cases load.
    const frameId = window.requestAnimationFrame(scrollToTarget)
    const timers = [220, 600].map((ms) => window.setTimeout(scrollToTarget, ms))

    return () => {
      window.cancelAnimationFrame(frameId)
      timers.forEach(window.clearTimeout)
    }
  }, [location.pathname, location.hash])

  return (
    <div className="mechanist-shell">
      {/* First thing in the tab order, visible only once focused. The header
          carries seven links, and without this a keyboard visitor walks all of
          them again on every page. */}
      <a className="skip-link" href="#mechanist-main">
        跳转到主要内容
      </a>
      <SiteHeader />
      <main className="mechanist-main" id="mechanist-main" tabIndex={-1}>
        {/* initial={false} suppresses the enter animation on first load. The
            home hero is the Largest Contentful Paint element on the site, and
            starting it at opacity: 0 would push LCP out by the whole
            transition for no benefit — there is nothing to transition *from*
            on a cold load. */}
        <AnimatePresence mode="wait" initial={false} onExitComplete={resetScroll}>
          <m.div
            key={location.pathname}
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="enter"
            exit="exit"
          >
            <Suspense fallback={<RouteFallback label="正在加载…" />}>
              <Routes location={location}>
                <Route path="/" element={<HomePage />} />
                <Route path="/knowledge-graphs" element={<DatabasePage />} />
                {/* A real page, not a redirect home. A wrong URL that silently
                    lands on the home page tells the visitor nothing about what
                    happened to the one they asked for. */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </m.div>
        </AnimatePresence>
      </main>
      <SiteFooter />
    </div>
  )
}
