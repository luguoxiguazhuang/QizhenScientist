import { Link } from 'react-router-dom'
import {
  DATABASE_CHANNELS,
  PIPELINE_STAGES,
  PIPELINE_SUPPORT,
} from '../content/mechanistContent.js'
import ArrowIcon from './ArrowIcon.jsx'
import DatabaseDomains from './DatabaseDomains.jsx'
import Reveal from './motion/Reveal.jsx'
import { Stagger, StaggerItem } from './motion/Stagger.jsx'
import CountUp from './motion/CountUp.jsx'
import './HowItWorks.css'

const METHOD_ROUTE = [
  { value: '11', label: 'Method families' },
  { value: '32', label: 'Executable analysis methods' },
]

function EmphasizedDescription({ text, highlights = [] }) {
  if (!highlights.length) return text

  const escaped = highlights.map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const pattern = new RegExp(`(${escaped.join('|')})`)

  return text.split(pattern).map((part, index) =>
    highlights.includes(part) ? <strong key={`${part}-${index}`}>{part}</strong> : part,
  )
}

function DatabaseSection({ item }) {
  return (
    <section className="foundation database-foundation section" id="how-it-works">
      <div className="container database-foundation__inner">
        <Reveal as="header" className="database-copy">
          <h2>{item.name}</h2>
          <div className="database-copy__points">
            {item.points.map((point) => (
              <div className="database-copy__point" key={point.title}>
                <strong>{point.title}</strong>
                <p>{point.desc}</p>
              </div>
            ))}
          </div>
          <Link className="link-cue link-unstyled database-copy__link" to={item.to}>
            {item.cta}
            <ArrowIcon />
          </Link>
        </Reveal>

        <Stagger as="dl" className="database-ledger" gap={0.08}>
          {DATABASE_CHANNELS.map((channel, index) => (
            <StaggerItem as="div" className="database-channel" key={channel.title}>
              <div className="database-channel__heading">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <dt>{channel.title}</dt>
                  <dd>{channel.kicker}</dd>
                </div>
              </div>
              <Stagger as="div" className="database-channel__metrics" gap={0.1} delay={0.08}>
                {channel.metrics.map((metric) => (
                  <StaggerItem as="div" key={metric.label}>
                    <strong><CountUp value={metric.value} duration={1.35} /></strong>
                    <span>{metric.label}</span>
                  </StaggerItem>
                ))}
              </Stagger>
            </StaggerItem>
          ))}
        </Stagger>

        {/* Same shape as the Skills block below it: the claim and its counts on
            one row, then the evidence full width under a rule. */}
        <Reveal as="div" className="database-domains-slot" variant="rise" delay={0.06}>
          <DatabaseDomains />
        </Reveal>
      </div>
    </section>
  )
}

/* The map and explanation share a row: the copy introduces the library while
   the figure shows its reach, without turning the image into a full-width
   banner. */
function SkillsSection({ item }) {
  return (
    <section className="foundation skills-foundation section" id="mechanism-skills">
      <div className="container skills-foundation__inner">
        <Reveal as="header" className="skills-copy__head">
          <h2>{item.name}</h2>
          <p>
            <EmphasizedDescription text={item.desc} highlights={item.highlights} />
          </p>
        </Reveal>

        <Reveal as="figure" className="skills-scene" variant="rise">
          <img
            src="/figures/mechanism-skills-map.png"
            alt="The mechanism skill library drawn as eleven labelled cases around a central Mechanist figure: vocabulary projection, magnitude analysis, representation and parameter analysis, probing, feature dictionary learning, gradient detection, causal attribution, circuit discovery, SHAP, neural feature learning, and multimodal-specific interpretability. Each case lists the analyses it carries."
            width={1800}
            height={931}
            loading="lazy"
            decoding="async"
          />
        </Reveal>

        {/* The two counts are what the map above adds up to, so they read as its
            data strip rather than as a second column arguing beside it: one rule
            across the measure, number and name hung off it. */}
        <Reveal as="div" className="skills-foot" delay={0.06}>
          <dl className="skills-ledger">
            {METHOD_ROUTE.map((step) => (
              <div className="skills-ledger__stat" key={step.label}>
                <dt><CountUp value={step.value} /></dt>
                <dd>{step.label}</dd>
              </div>
            ))}
          </dl>

          <Link className="link-cue link-unstyled skills-foot__cue" to={item.to}>
            {item.cta}
            <ArrowIcon />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

export default function HowItWorks() {
  const [database, skills] = PIPELINE_SUPPORT

  return (
    <>
      <section className="foundation-intro section">
        <div className="container foundation-intro__inner">
          <Reveal as="header" className="foundation-intro__head">
            <p className="foundation-intro__claim">
              To support automated mechanistic research,
              <br />
              we design <strong>Knowledge Graphs</strong> and{' '}
              <strong>Mechanism Methods</strong>.
            </p>
            <p className="foundation-intro__names">
              <strong>Knowledge Graphs</strong>
              <span aria-hidden="true">·</span>
              <strong>Mechanism Methods
              </strong>
            </p>
          </Reveal>
        </div>
      </section>

      <DatabaseSection item={database} />
      <SkillsSection item={skills} />

      <section className="how section" id="work-pipeline">
        <div className="container how__inner">
          <Reveal as="header" className="how__head">
            <h2>Work Pipeline</h2>
            <p>
              One loop turns a research question into a checked result. Every
              stage leaves an inspectable output.
            </p>
          </Reveal>

          <div className="pipeline-scene">
            {/* Robot strip kept off-canvas for a later return:
            <Reveal as="figure" className="pipeline-scene__image" variant="rise">
              <img
                src="/figures/mechanist-pipeline-banner-composed.png"
                alt=""
              />
            </Reveal>
            */}

            <Stagger as="ol" className="pipeline-annotations" gap={0.07}>
              {PIPELINE_STAGES.map((stage, index) => (
                <StaggerItem as="li" className="pipeline-note" key={stage.id}>
                  <span className="pipeline-note__step" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3>{stage.name}</h3>
                  <p>{stage.homeDesc}</p>
                  <span className="pipeline-note__output">
                    <span>Output</span>
                    {stage.output}
                  </span>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>
    </>
  )
}
