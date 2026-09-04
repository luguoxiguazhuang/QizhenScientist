import { CASE_THEMES, DISCOVERY_CASES } from '../content/mechanistContent.js'
import ArrowIcon from './ArrowIcon.jsx'
import Reveal from './motion/Reveal.jsx'
import { Stagger, StaggerItem } from './motion/Stagger.jsx'
import { MotionLink } from './motion/motionTags.js'
import { CaseStudyIcon, RobotInvestigator } from './HomeCasesArtwork.jsx'
import './HomeCases.css'

/* Beat one: what makes Mechanist distinct and where that difference applies.
 * The four application directions remain the primary labels; the orange line
 * beneath each one names the case a reader opens. */
export default function HomeCases() {
  return (
    <section className="home-cases section" id="cases">
      <div className="container home-cases__inner">
        <Reveal as="header" className="home-cases__head">
          <h2 className="section-title">
            <span className="home-cases__title-lead">Use Scenarios</span>
            <span className="home-cases__title-slogan">
              Explore How Models Work, then Make Them Better
            </span>
          </h2>
        </Reveal>

        <div className="home-cases__showcase">
          <div className="home-cases__art">
            <RobotInvestigator />
          </div>

          <div className="home-cases__applications">
            <Stagger as="ol" className="home-cases__list" gap={0.06}>
              {DISCOVERY_CASES.map((item) => (
                <StaggerItem
                  as={MotionLink}
                  key={item.id}
                  className="case-row link-unstyled"
                  to={`/research/${item.id}`}
                  style={{ '--row-accent': CASE_THEMES[item.id]?.accent }}
                >
                  <CaseStudyIcon caseId={item.id} />
                  <h3 className="case-row__title">{item.homeTitle}</h3>
                  <span className="case-row__track">{item.homeSummary}</span>
                  <ArrowIcon className="case-row__arrow" />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </div>
    </section>
  )
}
