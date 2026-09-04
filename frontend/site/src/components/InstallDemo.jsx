import { useEffect, useState } from 'react'
import { INSTALL_RUN as RUN } from '../content/installRun.js'
import usePrefersReducedMotion from '../lib/usePrefersReducedMotion.js'
import './InstallDemo.css'

/* The install, replayed in the header of the page that documents it.
 *
 * One window. Claude Code runs inside the terminal, so the frame does not
 * change — its chrome label crosses from `~/my-experiment — bash` to
 * `Mechanist · Claude Code` at the moment `claude` takes over, and the prompt
 * changes with it. Drawing two windows side by side would say the two are
 * separate applications, which is the one thing about this install that a
 * reader coming from the manual below most needs not to be told wrongly.
 *
 * Every line is in the DOM from the first frame and revealed by opacity, so
 * the panel is its final height before the run starts. This one sits in a page
 * header, above the fold — a box that grew here would push the whole manual
 * down the screen six times while somebody was reading the first step of it.
 *
 * It plays on mount rather than on scroll, because it is already on screen.
 */

/* Consecutive steps that name the same slot are stacked into one cell and take
   it over in turn, rather than each adding a row. Built once, at module scope:
   RUN is static, and the global index each item keeps is what the beat machine
   below counts in. */
const GROUPS = (() => {
  const out = []
  for (let i = 0; i < RUN.steps.length; i += 1) {
    const item = RUN.steps[i]
    const last = out[out.length - 1]
    if (item.slot && last && last.slot === item.slot) last.items.push({ item, index: i })
    else out.push({ slot: item.slot ?? item.id, items: [{ item, index: i }] })
  }
  return out
})()

const STEP_MS = 900
const RESTART_MS = 760
const OK_MS = 1080

export default function InstallDemo() {
  const reduced = usePrefersReducedMotion()
  const [runId, setRunId] = useState(0)
  const [step, setStep] = useState(reduced ? RUN.steps.length : -1)

  const complete = reduced || step >= RUN.steps.length
  /* The handover happens once the shell command has run — from the second step
     on, everything is inside the session. */
  const inSession = complete || step >= 1

  useEffect(() => {
    if (reduced || step >= RUN.steps.length) return undefined
    const current = RUN.steps[step]
    const delay = step < 0 ? 420 : current?.restart ? RESTART_MS : current?.ok ? OK_MS : STEP_MS
    const id = window.setTimeout(() => setStep((n) => n + 1), delay)
    return () => window.clearTimeout(id)
  }, [reduced, step, runId])

  function replay() {
    setStep(-1)
    setRunId((n) => n + 1)
  }

  return (
    <figure className="qsterm" role="img" aria-label={summarise()}>
      <div className="qsterm__window" aria-hidden="true">
        <div className="qsterm__chrome">
          <span className="qsterm__dot" />
          <span className="qsterm__dot" />
          <span className="qsterm__dot" />
          {/* Both titles are stacked and crossfaded, so the chrome does not
              change width when the label does. */}
          <span className="qsterm__titles" data-session={inSession ? 'true' : 'false'}>
            <span className="qsterm__title qsterm__title--shell">{RUN.shellTitle}</span>
            <span className="qsterm__title qsterm__title--session">{RUN.sessionTitle}</span>
          </span>
        </div>

        <div className="qsterm__body" data-session={inSession ? 'true' : 'false'}>
          {GROUPS.map((group) => (
            <div className="qsterm__slot" key={group.slot}>
              {group.items.map(({ item, index }, position) => {
                const reached = complete || step >= index
                const next = group.items[position + 1]
                /* Visible while it is the furthest one reached in its slot. The
                   last item in a slot has nothing to hand over to. */
                const shown = reached && !(next && (complete || step >= next.index))
                return (
            <div
              className="qsterm__step"
              key={item.id}
              data-shown={shown ? 'true' : 'false'}
              data-where={item.where}
            >
              {item.restart ? (
                <p className="qsterm__restart">
                  <RestartGlyph />
                  {item.restart}
                </p>
              ) : item.ok ? (
                <p className="qsterm__ok">
                  <CheckGlyph />
                  {item.ok}
                </p>
              ) : (
                <>
                  <p className="qsterm__line">
                    <span className="qsterm__prompt">{item.prompt}</span>
                    <span className="qsterm__cmd">{item.command}</span>
                  </p>
                  {item.note ? <p className="qsterm__note">{item.note}</p> : null}
                </>
              )}
            </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Always rendered, so the button appearing cannot add height at the
          moment the run ends. */}
      <figcaption className="qsterm__foot">
        <button type="button" className="qsterm__replay" onClick={replay} hidden={!complete || reduced}>
          <ReplayGlyph />
          Replay
        </button>
      </figcaption>
    </figure>
  )
}

function CheckGlyph() {
  return (
    <svg viewBox="0 0 14 14" width="11" height="11" aria-hidden="true">
      <circle cx="7" cy="7" r="5.7" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4.4 7.2l1.9 1.9 3.4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function RestartGlyph() {
  return (
    <svg viewBox="0 0 14 14" width="10" height="10" aria-hidden="true">
      <path d="M12 7a5 5 0 1 1-1.6-3.7" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M12.3 1.3v3.1H9.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
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
  const body = RUN.steps
    .map((item) => {
      if (item.restart) return item.restart + '.'
      if (item.ok) return item.ok + '.'
      return `${item.command}${item.note ? ` (${item.note}.)` : ''}`
    })
    .join(' ')
  return `Installing Mechanist, replayed in a terminal. ${RUN.shellTitle}, then ${RUN.sessionTitle}. ${body}`
}
