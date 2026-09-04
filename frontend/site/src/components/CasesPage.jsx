import {
  DISCOVERY_CASES,
  PAGE_ACCENTS,
  PUBLICATIONS,
} from '../content/mechanistContent.js'
import PageHeader from './PageHeader.jsx'
import ArrowIcon from './ArrowIcon.jsx'
import { Stagger, StaggerItem } from './motion/Stagger.jsx'
import { MotionLink } from './motion/motionTags.js'
import './CasesPage.css'

/* One feed, not a "posts" section and a separate "publications" section — a
   reader should not have to work out which list a given piece of writing
   landed in. Each entry knows its own shape: a post has a page to link to,
   a publication (for now, one placeholder with no link yet) does not. Colour
   is the page's own accent throughout — not a per-post theme — so the feed
   reads as one list rather than four different cases. */
/* Newest first: in-progress publications (no date yet) lead, then dated posts. */
const RESEARCH_FEED = [
  ...PUBLICATIONS.map((pub) => ({
    kind: 'publication',
    id: pub.id,
    title: pub.title,
    dek: pub.summary,
    status: pub.status,
    categories: pub.categories,
  })),
  ...DISCOVERY_CASES.map((item) => ({
    kind: 'post',
    id: item.id,
    title: item.homeTitle,
    dek: item.homeSummary,
    date: item.date,
    categories: item.categories,
  })),
]

function feedMeta(item) {
  return [(item.categories || []).join(', '), item.date].filter(Boolean).join(' · ')
}

export default function CasesPage() {
  return (
    <div className="cases-page" style={{ '--page-accent': PAGE_ACCENTS.cases }}>
      <PageHeader
        motif="runs"
        title="Research"
        lede="Papers and studies from the Mechanist project."
      />

      <section className="section research-section" aria-label="Research feed">
        <div className="container research-section__inner">
          <Stagger className="research-feed" gap={0.05} aria-label="Research posts and publications">
            {RESEARCH_FEED.map((item) =>
              item.kind === 'post' ? (
                <StaggerItem
                  key={item.id}
                  as={MotionLink}
                  className="research-feed__row link-unstyled"
                  to={`/research/${item.id}`}
                  data-case={item.id}
                >
                  <span className="research-feed__body">
                    {feedMeta(item) && (
                      <span className="research-feed__meta">{feedMeta(item)}</span>
                    )}
                    <h3 className="research-feed__title">{item.title}</h3>
                    <p className="research-feed__dek">{item.dek}</p>
                  </span>
                  <span className="research-feed__cue link-cue">
                    <span>Read</span>
                    <ArrowIcon />
                  </span>
                </StaggerItem>
              ) : (
                <StaggerItem
                  key={item.id}
                  className="research-feed__row research-feed__row--static"
                >
                  <span className="research-feed__body">
                    {feedMeta(item) && (
                      <span className="research-feed__meta">{feedMeta(item)}</span>
                    )}
                    <h3 className="research-feed__title">{item.title}</h3>
                    <p className="research-feed__dek">{item.dek}</p>
                  </span>
                  {item.status === 'in-progress' && (
                    <span className="research-feed__eyebrow research-feed__eyebrow--muted">
                      In progress
                    </span>
                  )}
                </StaggerItem>
              )
            )}
          </Stagger>
        </div>
      </section>
    </div>
  )
}
