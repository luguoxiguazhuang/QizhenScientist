import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react'
import App from './App.jsx'
import RootErrorBoundary from './components/RootErrorBoundary.jsx'
import { T } from './lib/motionTokens.js'
import './styles/fonts.js'
import './styles/tokens.css'
import './styles/dark.css'
import './styles/global.css'
import './styles/mechanist-theme.css'
import './styles/paper.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Outside the router on purpose: a router-level failure has to land
        somewhere, and that somewhere cannot itself need the router. */}
    <RootErrorBoundary>
      {/* `domAnimation` is ~18 KB gzipped against ~34 KB for the full feature
          set, and the site needs none of what the difference buys — no drag,
          no layout projection, no shared-element transitions. The cost of that
          saving is that components must use <m.div>, not <motion.div>, and
          `strict` is what enforces it: an accidental `motion.*` import throws
          in development rather than silently pulling the bundle back up six
          months from now.

          reducedMotion="user" is the outermost of three layers. It makes every
          m.* element drop transform and layout animations while keeping
          opacity, so a component written later that forgets to check the
          preference still behaves. The other two layers are
          usePrefersReducedMotion (for the canvas and CountUp, which motion
          does not own) and Reveal's own opt-out. */}
      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="user" transition={T.base}>
          <HashRouter>
            <App />
          </HashRouter>
        </MotionConfig>
      </LazyMotion>
    </RootErrorBoundary>
  </React.StrictMode>
)
