import { useEffect, useMemo, useRef, useState } from 'react'
import { HISTORY_RUN as RUN } from '../content/historyRun.js'
import usePrefersReducedMotion from '../lib/usePrefersReducedMotion.js'
import './HistoryDemo.css'

/* /mhistory, replayed in the same client as the home page.
 *
 * Same window, same chrome, same composer, same rail-and-node step, same file
 * chips — a smaller instance of the panel on the home page rather than a
 * second visual language for the same product.
 *
 * The one difference is that steps REPLACE each other instead of stacking. The
 * home page has a full column to scroll a five-stage transcript in; this sits
 * beside body copy at roughly half the width, and a transcript that grew would
 * either need its own scrollbar or would tower over the paragraph it belongs
 * to. So the step area is a single slot and each step takes it over in turn.
 *
 * Every step is in the DOM from the first frame, stacked in one grid cell. The
 * slot is therefore as tall as the tallest step from the start, and nothing on
 * the page moves while the run plays.
 *
 * It waits to be scrolled to: this block is well below the fold, and a run that
 * finished before anyone looked at it is the same as no run at all.
 */

const TYPE_MS = 22
const LEAD_MS = 460
/* A step arrives with its tool spinning, then settles into what came back.
   Keyed to the beat that is on screen, not the one about to fire. */
const BEAT_MS = { open: 780, settle: 1180, report: 900 }
const OPEN_NO_TOOL_MS = 420

export default function HistoryDemo() {
  const reduced = usePrefersReducedMotion()

  const plan = useMemo(() => {
    const beats = []
    RUN.steps.forEach((step, index) => {
      beats.push({ kind: 'open', index, step })
      beats.push({ kind: 'settle', index, step })
    })
    beats.push({ kind: 'report' })
    return { beats, total: beats.length }
  }, [])

  const rootRef = useRef(null)
  const typedRef = useRef(null)

  const [started, setStarted] = useState(false)
  const [runId, setRunId] = useState(0)
  const [typing, setTyping] = useState(true)
  const [beat, setBeat] = useState(0)

  const complete = reduced || beat >= plan.total
  /* Before the first beat lands there is no step yet; the slot still holds its
     height, it just has nothing shown in it. */
  const current = beat > 0 ? plan.beats[beat - 1] : null
  const shownIndex = complete ? null : current?.kind === 'report' ? null : current?.index ?? null
  const settledStep = current?.kind === 'settle'
  const sent = !typing

  useEffect(() => {
    if (reduced || started) return undefined
    const node = rootRef.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      setStarted(true)
      return undefined
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setStarted(true)
      },
      { threshold: 0.3 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [reduced, started])

  useEffect(() => {
    if (reduced || !started) return undefined
    const node = typedRef.current
    if (!node) return undefined

    let index = 0
    node.textContent = ''
    let leadId = 0
    const id = window.setInterval(() => {
      index += 1
      node.textContent = RUN.topic.slice(0, index)
      if (index < RUN.topic.length) return
      window.clearInterval(id)
      leadId = window.setTimeout(() => setTyping(false), LEAD_MS)
    }, TYPE_MS)

    return () => {
      window.clearInterval(id)
      window.clearTimeout(leadId)
    }
  }, [reduced, started, runId])

  useEffect(() => {
    if (reduced || !started || typing || beat >= plan.total) return undefined
    const previous = beat === 0 ? null : plan.beats[beat - 1]
    let delay = 300
    if (previous) {
      delay =
        previous.kind === 'open' && !previous.step.tools
          ? OPEN_NO_TOOL_MS
          : BEAT_MS[previous.kind] ?? 700
    }
    const id = window.setTimeout(() => setBeat((n) => n + 1), delay)
    return () => window.clearTimeout(id)
  }, [reduced, started, typing, beat, plan])

  function replay() {
    setBeat(0)
    setTyping(true)
    setRunId((n) => n + 1)
  }

  return (
    <figure className="mhist" ref={rootRef} role="img" aria-label={summarise()}>
      <div className="mhist__window" aria-hidden="true">
        <div className="mhist__chrome">
          <span className="mhist__dot" />
          <span className="mhist__dot" />
          <span className="mhist__dot" />
          <span className="mhist__app">Mechanist</span>
          <span className="mhist__state" data-done={complete ? 'true' : 'false'}>
            {complete
              ? 'done'
              : shownIndex === null
                ? 'ready'
                : `step ${shownIndex + 1}/${RUN.steps.length}`}
          </span>
        </div>

        <div className="mhist__thread">
          <p className="mhist__command">
            <span className="mhist__prompt">❯</span>
            {RUN.command}
          </p>

          {/* The composer, exactly as on the home page: the topic is typed in
              and submitted, and the run starts when it is sent. */}
          <div className="mhist__composer" data-sent={sent ? 'true' : 'false'}>
            <p className="mhist__ask">
              {/* A hidden copy of the whole topic sets the height, so the field
                  does not grow a line at a time as it types. */}
              <span className="mhist__ghost">{RUN.topic}</span>
              <span className="mhist__typed">
                <span ref={typedRef}>{reduced ? RUN.topic : ''}</span>
                {!reduced && typing ? <span className="mhist__caret" /> : null}
              </span>
            </p>
            <span className="mhist__submit">
              {sent ? 'Sent' : 'Run'}
              <SubmitGlyph sent={sent} />
            </span>
          </div>

          {/* One slot. Every step is stacked into it, so it is as tall as the
              tallest of them from the first frame and nothing below this panel
              moves as they take turns. */}
          <div className="mhist__slot">
            {RUN.steps.map((step, index) => (
              <div
                className="mhist__step"
                key={step.id}
                data-shown={shownIndex === index ? 'true' : 'false'}
                data-state={shownIndex === index && settledStep ? 'done' : 'running'}
              >
                <span className="mhist__node">{String(index + 1).padStart(2, '0')}</span>

                <div className="mhist__step-body">
                  <p className="mhist__step-head">
                    <b>{step.name}</b>
                  </p>

                  {step.tools ? (
                    <ul className="mhist__tools">
                      {/* Keyed on the arguments, not the name: a step can
                          fire the same tool more than once. */}
                      {step.tools.map((tool) => (
                        <li key={tool.args}>
                          <span className="mhist__spinner" />
                          <code>{tool.name}</code>
                          <span className="mhist__tool-args">{tool.args}</span>
                          <span className="mhist__tool-out">{tool.out}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <div className="mhist__reveal">
                    {step.lines.map((line) => (
                      <p className="mhist__say" key={line.slice(0, 24)}>
                        {line}
                      </p>
                    ))}

                    {step.out ? <p className="mhist__out">{step.out}</p> : null}

                    {step.file ? (
                      <p className="mhist__files">
                        <span className="mhist__file">
                          <FileGlyph />
                          {step.file}
                        </span>
                      </p>
                    ) : null}

                    {step.timeline ? (
                      <div className="mhist__bars">
                        {step.timeline.map((band, i) => (
                          <div className="mhist__band" key={band.era}>
                            <span
                              className="mhist__bar"
                              style={{
                                '--bar': band.weight / 9,
                                '--bar-delay': `${i * 80}ms`,
                              }}
                            />
                            <span className="mhist__era">{band.era}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}

            {/* The report takes the same slot when the steps are done, and
                stays — a finished run should look finished. */}
            <div className="mhist__result" data-shown={complete ? 'true' : 'false'}>
              <p className="mhist__result-head">
                <FileGlyph />
                {RUN.result.artifact}
              </p>
              <dl className="mhist__facts">
                {RUN.result.facts.map((fact) => (
                  <div key={fact.label}>
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mhist__headline">{RUN.result.headline}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Outside the aria-hidden panel, and its row is always rendered, so the
          button appearing cannot add height at the moment the run ends. */}
      <figcaption className="mhist__foot">
        <button type="button" className="mhist__replay" onClick={replay} hidden={!complete || reduced}>
          <ReplayGlyph />
          Replay
        </button>
      </figcaption>
    </figure>
  )
}

function SubmitGlyph({ sent }) {
  return (
    <svg viewBox="0 0 14 14" width="10" height="10" aria-hidden="true">
      {sent ? (
        <path d="M2.5 7.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M2 12L12.5 7 2 2l2 5z" fill="currentColor" />
      )}
    </svg>
  )
}

function FileGlyph() {
  return (
    <svg viewBox="0 0 14 14" width="10" height="10" aria-hidden="true">
      <path d="M3 1.5h5l3 3v8H3z" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M8 1.5v3h3" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  )
}

function ReplayGlyph() {
  return (
    <svg viewBox="0 0 14 14" width="11" height="11" aria-hidden="true">
      <path d="M12 7a5 5 0 1 1-1.6-3.7" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M12.3 1.3v3.1H9.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function summarise() {
  const steps = RUN.steps
    .map((step) => {
      const tools = step.tools
        ? ` Runs ${step.tools.map((t) => `${t.name} (${t.args}) → ${t.out}`).join(', ')}.`
        : ''
      const file = step.file ? ` Writes ${step.file}.` : ''
      return `${step.name}.${tools} ${step.lines.join(' ')}${file}`
    })
    .join(' ')
  const facts = RUN.result.facts.map((f) => `${f.label}: ${f.value}`).join('. ')
  return `A /mhistory run, replayed. Command: ${RUN.command} on the topic "${RUN.topic}". ${steps} Result, written to ${RUN.result.artifact}: ${facts}. ${RUN.result.headline}`
}
