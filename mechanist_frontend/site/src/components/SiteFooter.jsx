import { useEffect, useState } from 'react'
import './SiteFooter.css'
import { withBase } from '../lib/basePath.js'

// Deployment-base aware: on a subpath deploy (e.g. GitHub Pages /<repo>/)
// a leading-slash '/api/...' would escape the base. On static hosts the
// endpoint does not exist at all, and the counter simply hides itself.
const VISITS_API = withBase('api/visits')

export default function SiteFooter() {
  const [visitCount, setVisitCount] = useState(null)
  const [counterAvailable, setCounterAvailable] = useState(true)

  useEffect(() => {
    let cancelled = false

    const recordVisit = async () => {
      try {
        const response = await fetch(VISITS_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page: `${window.location.pathname}${window.location.hash}` || '/',
          }),
        })

        if (!response.ok) {
          throw new Error(`Visit counter failed: ${response.status}`)
        }

        const payload = await response.json()

        if (!cancelled) {
          setVisitCount(Number.isFinite(payload.visits) ? payload.visits : null)
        }
      } catch (error) {
        console.warn('[Qizhen Scientist] visit counter unavailable', error)

        if (!cancelled) {
          setVisitCount(null)
          setCounterAvailable(false)
        }
      }
    }

    recordVisit()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="site-footer__bottom">
          <address className="site-footer__contact">
            <span>联系我们</span>
            <a href="mailto:contact@example.com">contact@example.com</a>
            <a href="mailto:contact@example.com">contact@example.com</a>
          </address>

          <div className="site-footer__meta">
            {counterAvailable && (
              <span className="site-footer__counter" aria-label="网站访问量">
                <span>访问量</span>
                <strong>{visitCount == null ? '—' : visitCount.toLocaleString('en-US')}</strong>
              </span>
            )}
            <span className="site-footer__copy">© 2026 ZJUNLP</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
