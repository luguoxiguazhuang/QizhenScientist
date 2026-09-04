import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import HeaderMotif from './HeaderMotif.jsx'
import './PageHeader.css'

/* One page header for every sub-page. Cases, Skills, Database, Quick Start and
   the Hypothesis Library each grew their own — three different title scales,
   three different breadcrumb treatments, and one page with no breadcrumb at
   all — so the site read as five sites.

   There is deliberately no eyebrow slot. Every page that had one repeated the
   word already carried by the nav item, the breadcrumb, and the title beneath
   it ("Cases / Cases / Discovery case studies"). The last breadcrumb crumb
   names the page; the title says what is on it.

   The page's identity colour is NOT a prop here. It is set as --page-accent on
   the page's root element and inherited, because the section rules further down
   the page use it too and sections are this header's siblings, not its
   children — a value set here could never have reached them.

   The right-hand column is declared only when something is going in it. It
   used to be in the track list unconditionally, so Cases, Quick Start, the
   404 and the skill-family view — four of the seven pages using this — ran
   their title into a 1fr column with 240px of nothing beside it. */
export default function PageHeader({ crumbs = [], title, lede, figures, meta, aside, wideRail = false, motif }) {
  const rail = figures?.length ? (
    <dl className="page-header__figures">
      {figures.map((figure) => {
        const FigureIcon = figure.icon
        return (
          <div key={figure.label}>
            <dt>
              {FigureIcon ? (
                <FigureIcon className="page-header__figure-icon" aria-hidden="true" />
              ) : null}
              <span>{figure.value}</span>
            </dt>
            <dd>{figure.label}</dd>
          </div>
        )
      })}
    </dl>
  ) : (
    aside || null
  )

  return (
    <header className="page-header">
      {/* Sits behind everything in the banner; see HeaderMotif.css for how it
          gets out from under the copy. */}
      <HeaderMotif kind={motif} />
      <div
        className="container page-header__inner"
        data-rail={rail ? (wideRail ? 'wide' : 'true') : 'false'}
      >
        <div className="page-header__copy">
          {crumbs.length > 0 && (
            <nav className="page-header__crumb" aria-label="Breadcrumb">
              {crumbs.map((crumb, index) => (
                <Fragment key={crumb.label}>
                  {index > 0 && <span aria-hidden="true">/</span>}
                  {crumb.to ? (
                    <Link to={crumb.to}>{crumb.label}</Link>
                  ) : crumb.onClick ? (
                    <button type="button" onClick={crumb.onClick}>
                      {crumb.label}
                    </button>
                  ) : (
                    <span aria-current="page">{crumb.label}</span>
                  )}
                </Fragment>
              ))}
            </nav>
          )}

          <h1 className="page-header__title">{title}</h1>
          {lede && <p className="page-header__lede">{lede}</p>}
          {meta && <p className="page-header__meta">{meta}</p>}
        </div>

        {rail}
      </div>
    </header>
  )
}
