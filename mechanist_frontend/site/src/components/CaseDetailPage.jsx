import { Suspense, lazy, useMemo } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  CASE_THEMES,
  DISCOVERY_CASES,
  getCaseTrackIndex,
  getDiscoveryCase,
} from '../content/mechanistContent.js'
import { CASE_LOADERS } from '../content/cases/index.js'
import CaseMotif from './CaseMotif.jsx'
import CaseSections from './case/CaseSections.jsx'
import ArrowIcon from './ArrowIcon.jsx'
import RouteFallback from './RouteFallback.jsx'
import './CaseDetailPage.css'
import './CasesPage.css'

/* One lazy chunk per case body. The bodies are the largest content on the site
   — figures, charts, tables, worked examples — and a reader on /research/belief
   has no use for the other three. The dark hero paints from the summary
   record, which is in the main bundle, so the page has something to show
   immediately while its body arrives. */
const BODIES = Object.fromEntries(
  Object.entries(CASE_LOADERS).map(([id, load]) => [
    id,
    lazy(async () => {
      const module = await load()
      const body = module.default
      return { default: () => <CaseBody body={body} caseId={id} /> }
    }),
  ])
)

function CaseBody({ body, caseId }) {
  const item = getDiscoveryCase(caseId)
  return <CaseSections sections={body.sections} caseId={caseId} item={item} />
}

export default function CaseDetailPage() {
  const { caseId } = useParams()
  const item = getDiscoveryCase(caseId)
  const index = getCaseTrackIndex(caseId)
  const theme = CASE_THEMES[caseId]

  const style = useMemo(() => {
    if (!theme) return undefined
    return {
      '--case-theme-accent': theme.accent,
      '--case-theme-bg': theme.bg,
    }
  }, [theme])

  if (!item) return <Navigate to="/research" replace />

  const prev = index > 0 ? DISCOVERY_CASES[index - 1] : null
  const next = index < DISCOVERY_CASES.length - 1 ? DISCOVERY_CASES[index + 1] : null
  const Body = BODIES[caseId]

  return (
    <article className="case-detail cases-page" data-case={caseId} style={style}>
      {/* The hero overrides the shared dark tokens with this case's own pair.
          Everything downstream — the eyebrow, the buttons, the focus ring, the
          canvas field — reads those variables, so setting two values here is
          what makes the whole block take the case's colour. */}
      <header
        className="case-detail__hero on-dark"
        style={
          theme
            ? {
                '--section-deep': theme.deepBg,
                '--accent-on-deep': theme.accentDeep,
                '--primary-on-deep': theme.accentDeep,
              }
            : undefined
        }
      >
        <CaseMotif caseId={caseId} tone="dark" />
        <div className="container case-detail__hero-inner">
          <nav className="case-detail__crumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link to="/research">Research</Link>
            <span aria-hidden="true">/</span>
            <span>{item.title}</span>
          </nav>

          <div className="case-detail__hero-copy">
            <span className="case-detail__track">{item.track}</span>
            <h1>{item.title}</h1>
            <p className="case-detail__lede">{item.summary}</p>
          </div>

        </div>
      </header>

      <div className="case-detail__body">
        {Body ? (
          <Suspense fallback={<RouteFallback label="Loading the post…" />}>
            <Body />
          </Suspense>
        ) : null}

        {/* Both directions carry an arrow that points the way they go, and the
            pair sits on its own row clear of the footer. */}
        <nav className="case-detail__nav" aria-label="Post navigation">
          {prev ? (
            <Link className="case-detail__nav-link case-detail__nav-link--prev" to={`/research/${prev.id}`}>
              <span className="case-detail__nav-label">
                <ArrowIcon size={15} className="case-detail__nav-arrow case-detail__nav-arrow--left" />
                Previous
              </span>
              <strong>{prev.title}</strong>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link className="case-detail__nav-link case-detail__nav-link--next" to={`/research/${next.id}`}>
              <span className="case-detail__nav-label">
                Next
                <ArrowIcon size={15} className="case-detail__nav-arrow case-detail__nav-arrow--right" />
              </span>
              <strong>{next.title}</strong>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </article>
  )
}
