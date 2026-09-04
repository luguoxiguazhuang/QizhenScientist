import { Link, useSearchParams } from 'react-router-dom'
import { ScanSearch, Waypoints } from 'lucide-react'
import {
  MECHANISM_FAMILIES,
  METHOD_COUNT,
  getFamily,
} from './skillCollection/mechanismSkillData.js'
import PageHeader from './PageHeader.jsx'
import ArrowIcon from './ArrowIcon.jsx'
import './SkillCollectionPage.css'
import { PAGE_ACCENTS } from '../content/mechanistContent.js'

/* This page used to list the 36 top-level entries in skills/, ranked by an
   inferred relation graph. Most of them — auto-claim, auto-verify,
   run-experiment, experiment-queue — are internal stages of /auto that nobody
   invokes by hand, so the page documented the plugin's wiring rather than
   anything a visitor can use.

   What it shows now is the mechanism method library the experiment stage
   routes through. The data is generated from the plugin's own SKILL.md
   frontmatter by scripts/gen-skill-data.py. */
const countBy = (family, key) => family.methods.filter((method) => method[key]).length

export default function SkillCollectionPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const familyId = searchParams.get('family')
  const family = familyId ? getFamily(familyId) : null

  if (familyId && family)
    return (
      <FamilyDetail
        family={family}
        onBack={() => setSearchParams({})}
        onOpen={(id) => setSearchParams({ family: id })}
      />
    )
  if (familyId) return <NotFound onBack={() => setSearchParams({})} />

  return (
    <div className="skills" style={{ '--page-accent': PAGE_ACCENTS.skills }}>
      <PageHeader
        motif="probe"
        wideRail
        title="Mechanism Methods"
        lede={`A library of ${METHOD_COUNT} interpretability methods for locating, testing, and intervening on the internal mechanisms behind model behavior.`}
        figures={[
          { value: MECHANISM_FAMILIES.length, label: 'Method families', icon: Waypoints },
          { value: METHOD_COUNT, label: 'Mechanism methods', icon: ScanSearch },
        ]}
      />

      <section className="section" aria-labelledby="families-heading">
        <div className="container">
          <header className="skills__block-head">
            <h2 id="families-heading" className="section-title">
              Browse by method family
            </h2>
            <p className="section-lede">
              Each family offers a different way to identify or test the
              layers, attention heads, neurons, features, and weights involved
              in a model behavior.
            </p>
          </header>

          <ul className="family-grid">
            {MECHANISM_FAMILIES.map((item) => (
              <li key={item.id}>
                <Link
                  className="family link-unstyled"
                  to={`/methods?family=${encodeURIComponent(item.id)}`}
                >
                  <div className="family__top">
                    <h3>{item.name}</h3>
                    <span className="family__count">{item.methods.length} methods</span>
                  </div>
                  <p className="family__summary">{item.summary}</p>
                  <ul className="family__methods">
                    {item.methods.map((method) => (
                      <li key={method.id}>{method.name}</li>
                    ))}
                  </ul>
                  {/* What is actually behind the card: demos you can run and
                      the papers each method came from, both counted off the
                      plugin rather than asserted. */}
                  <span className="family__stock">
                    {countBy(item, 'demo')} worked examples ·{' '}
                    {countBy(item, 'paper')} reference papers
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}

function FamilyDetail({ family, onBack, onOpen }) {
  /* Neighbours in the order the index lists them, so paging through the
     families here walks the same sequence a reader saw on the way in. */
  const index = MECHANISM_FAMILIES.findIndex((item) => item.id === family.id)
  const prev = index > 0 ? MECHANISM_FAMILIES[index - 1] : null
  const next = index >= 0 && index < MECHANISM_FAMILIES.length - 1 ? MECHANISM_FAMILIES[index + 1] : null

  return (
    <div className="skills" style={{ '--page-accent': PAGE_ACCENTS.skills }}>
      <PageHeader
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Methods', onClick: onBack },
          { label: family.name },
        ]}
        motif="probe"
        title={family.name}
        lede={family.about || family.summary}
        meta={family.sourcePath}
      />

      <section className="section">
        <div className="container">
          {/* Every family's SKILL.md argues both sides — what the method
              establishes and what it cannot. A method library that only
              advertises strengths is not much use to someone choosing
              between eleven of them. */}
          {(family.advantage || family.limitation) && (
            <div className="family-notes">
              {family.advantage && (
                <div className="family-note">
                  <h2>What it establishes</h2>
                  <p>{family.advantage}</p>
                </div>
              )}
              {family.limitation && (
                <div className="family-note family-note--limit">
                  <h2>What it cannot show</h2>
                  <p>{family.limitation}</p>
                </div>
              )}
            </div>
          )}

          <h2 className="section-title family-methods__title">
            Methods in this family
          </h2>

          <ol className="method-list">
            {family.methods.map((method, index) => (
              <li className="method" key={method.id}>
                <span className="method__index" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="method__body">
                  <h3 className="method__name">{method.name}</h3>
                  <p className="method__summary">{method.summary}</p>

                  <ul className="method__facts">
                    {method.demo && (
                      <li>
                        <span>Worked example</span>
                        <code>{method.demo}</code>
                      </li>
                    )}
                    {method.scripts > 0 && (
                      <li>
                        <span>Runnable scripts</span>
                        <code>{method.scripts}</code>
                      </li>
                    )}
                  </ul>

                  {method.paper && (
                    <p className="method__paper">
                      <span>Reference</span>
                      {method.paper.url ? (
                        <a href={method.paper.url} target="_blank" rel="noreferrer">
                          {method.paper.name}
                        </a>
                      ) : (
                        method.paper.name
                      )}
                    </p>
                  )}

                  <span className="method__path">{method.sourcePath}</span>
                </div>
              </li>
            ))}
          </ol>

          {/* The same pair the case pages end on: direction, then the name of
              what is next. A family page had only a way back up, which made
              reading the library mean returning to the index eleven times.

              Buttons rather than links, because the family view is a search
              parameter on this route and not a route of its own — see the
              ?family= handling at the top of the file. */}
          {(prev || next) && (
            <nav className="skills__nav" aria-label="Method family navigation">
              {prev ? (
                <button
                  type="button"
                  className="skills__nav-link skills__nav-link--prev"
                  onClick={() => onOpen(prev.id)}
                >
                  <span className="skills__nav-label">
                    <ArrowIcon size={15} className="skills__nav-arrow skills__nav-arrow--left" />
                    Previous family
                  </span>
                  <strong>{prev.name}</strong>
                </button>
              ) : (
                <span />
              )}
              {next ? (
                <button
                  type="button"
                  className="skills__nav-link skills__nav-link--next"
                  onClick={() => onOpen(next.id)}
                >
                  <span className="skills__nav-label">
                    Next family
                    <ArrowIcon size={15} className="skills__nav-arrow skills__nav-arrow--right" />
                  </span>
                  <strong>{next.name}</strong>
                </button>
              ) : (
                <span />
              )}
            </nav>
          )}

        </div>
      </section>
    </div>
  )
}

function NotFound({ onBack }) {
  return (
    <div className="skills" style={{ '--page-accent': PAGE_ACCENTS.skills }}>
      <section className="section">
        <div className="container">
          <span className="section-eyebrow">Not found</span>
          <h1 className="section-title">No method family by that name</h1>
          <p className="section-lede">
            Check the <code>?family=</code> parameter, or go back to the library.
          </p>
          <p className="skills__back">
            <button type="button" className="link-cue link-cue--back" onClick={onBack}>
              <ArrowIcon />
              All method families
            </button>
          </p>
        </div>
      </section>
    </div>
  )
}
