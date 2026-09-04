import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import usePrefersReducedMotion from '../lib/usePrefersReducedMotion.js'
import { HERO_STAGES } from '../content/heroRun.js'
import SceneRetrieve from './agentScenes/SceneRetrieve.jsx'
import SceneRoute from './agentScenes/SceneRoute.jsx'
import SceneExecute from './agentScenes/SceneExecute.jsx'
import SceneConclude from './agentScenes/SceneConclude.jsx'
import './AgentDemo.css'

/* A recorded Mechanist run, replayed as a typewriter.
 *
 * The panel narrates itself one sentence at a time, and the stage under each
 * sentence draws what the sentence says. That is the whole structure: one line
 * of type, one drawing, five times. Everything that used to sit between them —
 * a carry-in chip, a token trail, a status spinner, a handoff badge floating
 * over the artwork — said the same thing five ways and left the drawings a
 * third of the panel to live in.
 *
 * ── how it is driven ──────────────────────────────────────────────────────
 *
 * The old version held a 0→1 float in React state and advanced it from a
 * requestAnimationFrame loop, so every scene re-rendered sixty times a second
 * and every reveal was a threshold comparison against that float. This one
 * schedules a flat list of (step, beat) marks with setTimeout — about twenty
 * state changes for the whole run — and lets CSS animate. `data-beat` on the
 * scene root is the only thing React changes; keyframes do the rest.
 *
 * The one exception is the typed line, which genuinely needs a character
 * counter. It owns that state privately (see TypedLine) so its ~40 renders per
 * sentence never touch the artwork beside it.
 *
 * ── when it starts ────────────────────────────────────────────────────────
 *
 * On being scrolled to, not on mount. At 1440×900 the top of this panel sits
 * near the fold, so a run that started at mount was half over by the time
 * anyone could see it — the visitor arrived in the middle of a sentence about
 * a step they never saw.
 */

/* The ask is typed, then held for a beat before the run starts — long enough
   for the finished question to be read as a question rather than as a caption
   that was always there. */
const ASK_MS = 15
const ASK_HOLD = 1000
const SCENES = {
  retrieve: SceneRetrieve,
  route: SceneRoute,
  execute: SceneExecute,
  conclude: SceneConclude,
}

export default function AgentDemo({ run, className = '' }) {
  const reduced = usePrefersReducedMotion()
  const steps = run.steps
  const last = steps.length - 1

  const rootRef = useRef(null)
  const timers = useRef([])
  const [armed, setArmed] = useState(false)
  const [take, setTake] = useState(0)
  const [asked, setAsked] = useState(false)
  /* Set the moment a step arrow is used. The schedule is torn down and never
     rebuilt, so the run stops advancing on its own and the reader drives —
     a recording that kept playing under someone paging through it would fight
     them for the panel. Replay puts it back. */
  const [manual, setManual] = useState(false)
  const [cursor, setCursor] = useState({ step: -1, beat: 0 })

  /* When the ask is sent, counted from the moment the run arms. The pointer's
     keyframes are scheduled off this same number — see --lead below — so the
     click always lands just before the submit rather than at a delay hand-tuned
     against one particular question's length. */
  const lead = run.question.length * ASK_MS + ASK_HOLD

  /* Flattened schedule: every beat of every step as one absolute offset from
     the moment the ask is sent. Twenty-odd marks, one timer each. */
  const marks = useMemo(() => {
    const out = []
    let base = 0
    steps.forEach((step, i) => {
      step.beats.forEach((offset, beat) => out.push({ at: base + offset, step: i, beat }))
      base += step.ms
    })
    return out
  }, [steps])

  const clear = useCallback(() => {
    timers.current.forEach(window.clearTimeout)
    timers.current = []
  }, [])

  /* Arm on 35% visibility. Once armed it stays armed: a run should not restart
     because the reader scrolled past and came back. */
  useEffect(() => {
    const node = rootRef.current
    if (!node) return undefined
    if (reduced || typeof IntersectionObserver === 'undefined') {
      setArmed(true)
      return undefined
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setArmed(true)
          observer.disconnect()
        }
      },
      /* Half, not a third. The panel is 520px tall and its top edge sits near
         the fold at 1440×900, which already puts ~38% of it on screen before
         anyone scrolls — a lower threshold armed the run at page load, which
         is the exact failure this observer exists to prevent. */
      { threshold: 0.5 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [reduced])

  useEffect(() => {
    if (!armed) return undefined
    if (reduced) {
      setAsked(true)
      setCursor({ step: last, beat: steps[last].beats.length - 1 })
      return undefined
    }

    setAsked(false)
    setCursor({ step: -1, beat: 0 })
    clear()

    timers.current.push(window.setTimeout(() => setAsked(true), lead))
    marks.forEach((mark) => {
      timers.current.push(
        window.setTimeout(() => setCursor({ step: mark.step, beat: mark.beat }), lead + mark.at),
      )
    })
    return clear
  }, [armed, reduced, take, marks, clear, lead, steps, last])

  const step = cursor.step >= 0 ? steps[cursor.step] : null
  const Scene = step ? SCENES[step.id] : null
  const done = cursor.step === last && cursor.beat === steps[last].beats.length - 1

  /* Step to a neighbouring scene and play it, rather than jumping to its final
     frame.
     
     It used to land on the last beat, which showed the scene finished: every
     reveal in here is a CSS animation with `both` fill selected by `data-beat`,
     so arriving at the last beat paints all of them in their end state at once.
     A reader stepping through the run that way never saw the model come apart,
     the glass hunt, or the curve rise — the three things the scene is. So the
     step re-arms that scene's own beat schedule from zero; only the auto-run's
     schedule for the *other* scenes stays torn down, which is what keeps the
     panel from resuming under someone paging through it. */
  const go = (delta) => {
    const next = Math.min(last, Math.max(0, (cursor.step < 0 ? 0 : cursor.step) + delta))
    clear()
    setManual(true)
    setAsked(true)
    setCursor({ step: next, beat: 0 })
    steps[next].beats.forEach((offset, beat) => {
      if (beat === 0) return
      timers.current.push(window.setTimeout(() => setCursor({ step: next, beat }), offset))
    })
  }

  const replay = () => {
    clear()
    setManual(false)
    setTake((n) => n + 1)
  }

  const atStart = cursor.step <= 0
  const atEnd = cursor.step >= last

  /* A stage is running from the first act that belongs to it until the last one
     finishes, so Execution stays lit across both of its acts rather than
     blinking off between them. */
  const stageState = (si) => {
    if (cursor.step < 0) return 'pending'
    const first = steps.findIndex((s) => s.stage === si)
    const end = steps.map((s) => s.stage).lastIndexOf(si)
    if (first < 0) return 'pending'
    if (cursor.step > end || (cursor.step === end && done)) return 'done'
    return cursor.step >= first ? 'running' : 'pending'
  }

  return (
    <figure className={`agent ${className}`.trim()} role="img" aria-label={summarise(run)}>
      {/* The mount is what the hero frames. It exists so the frame can sit
          around the window without also enclosing the replay control. */}
      <div className="agent__mount">
      <div className="agent__window" ref={rootRef} data-done={done ? 'true' : 'false'}>
        <header className="agent__chrome" aria-hidden="true">
          <span className="agent__dots">
            <i />
            <i />
            <i />
          </span>
          <span className="agent__app">Mechanist</span>

          {/* Three words, one register: ready · working · done. It used to count
              the stages, which the axis under the composer already does — and
              does better, since it names them. A counter beside a named axis is
              the same fact twice, in the worse of the two forms. */}
          <span className="agent__state" data-done={done ? 'true' : 'false'}>
            {done ? 'done' : step ? 'working' : 'ready'}
          </span>
        </header>

        {/* One grid row, two elements. They are wrapped rather than placed as
            two rows of the window because the narrow layout hides the command
            line, and a `display: none` grid item does not hold its row — the
            stage below would inherit an `auto` track and collapse to nothing. */}
        <div className="agent__intro" aria-hidden="true">
          <p className="agent__command">
            <span className="agent__prompt">❯</span>
            <CommandLine text={run.command} />
          </p>

          {/* The research question stays anchored above the run; only the work
              area below it changes from act to act. */}
          <div
            className="agent__composer"
            data-sent={asked ? 'true' : 'false'}
            data-armed={armed && !reduced ? 'true' : 'false'}
            style={{ '--lead': `${lead}ms` }}
          >
            <p className="agent__ask">
              <TypedLine
                key={`ask-${take}`}
                text={run.question}
                em={run.questionEmphasis}
                speed={ASK_MS}
                live={!reduced && !asked}
              />
            </p>
            <span className="agent__submit">
              {asked ? 'Sent' : 'Run'}
              <SubmitGlyph sent={asked} />
            </span>

            {/* The click. It crosses to the button and presses it a beat before
                the run starts, so the run reads as caused by the press rather
                than as something that was going to happen anyway. */}
            <span className="agent__pointer">
              <PointerGlyph />
            </span>
          </div>

          {/* The stage axis. It counts the pipeline's four stages, not the five
              acts — two of the acts are the same stage — so it stays a map of
              what the run is doing rather than a second copy of the act list. */}
          <ol className="agent__progress">
            {HERO_STAGES.map((name, i) => {
              /* `current` is the stage the act on screen belongs to, which is
                 not the same as the running one: stepping by hand lands on an
                 act's last beat, so the final stage is already `done` the
                 moment it is arrived at and would never have grown.

                 The key is the name and nothing else. It used to carry the act
                 as well, to remount the node and re-fire a keyframe animation;
                 the size is a transition now, and a transition needs the same
                 element on both sides of the change or the old size has nothing
                 to shrink from. */
              const current = step ? step.stage === i : false
              return (
                <li
                  key={name}
                  data-state={stageState(i)}
                  data-current={current ? 'true' : undefined}
                >
                  <span>{i + 1}</span>
                  <b>{name}</b>
                </li>
              )
            })}
          </ol>
        </div>

        <p className="agent__say" aria-hidden="true">
          {step ? (
            <TypedLine
              key={`say-${take}-${step.id}`}
              text={step.line.text}
              em={step.line.em}
              speed={26}
              live={!reduced}
            />
          ) : (
            <span className="agent__say-idle" />
          )}
        </p>

        <div className="agent__stage" aria-hidden="true">
          {Scene ? (
            <div className="agent__scene" key={`${take}-${step.id}`} data-beat={cursor.beat}>
              <Scene step={step} beat={cursor.beat} reduced={reduced} />
            </div>
          ) : null}
        </div>
      </div>
      </div>

      <figcaption className="agent__foot">
        {/* Step controls, available as soon as there is a run to step through.
            They are real buttons in the figcaption rather than decoration
            inside the aria-hidden window, so they are reachable by keyboard
            and announced by a screen reader. */}
        <div className="agent__nav" hidden={!asked}>
          <button
            type="button"
            className="agent__step"
            onClick={() => go(-1)}
            disabled={atStart}
            aria-label="Previous step"
          >
            <ChevronGlyph />
          </button>
          <button
            type="button"
            className="agent__step agent__step--next"
            onClick={() => go(1)}
            disabled={atEnd}
            aria-label="Next step"
          >
            <ChevronGlyph />
          </button>
        </div>

        <button
          type="button"
          className="agent__replay"
          onClick={replay}
          hidden={!(done || manual) || reduced}
        >
          <ReplayGlyph />
          Replay
        </button>
      </figcaption>
    </figure>
  )
}

/* The one place a character counter is worth a re-render.
 *
 * Its own component so those renders stop here: the sentence re-rendering
 * forty times does not re-render the drawing next to it. A hidden full-text
 * copy holds the box open so nothing below moves while the line fills in. */
function TypedLine({ text, em, speed, live }) {
  const [shown, setShown] = useState(live ? 0 : text.length)

  useEffect(() => {
    if (!live) {
      setShown(text.length)
      return undefined
    }
    setShown(0)
    let n = 0
    const id = window.setInterval(() => {
      n += 1
      setShown(n)
      if (n >= text.length) window.clearInterval(id)
    }, speed)
    return () => window.clearInterval(id)
  }, [text, speed, live])

  const typing = live && shown < text.length

  return (
    <span className="typed">
      <span className="typed__ghost">
        <Emphasised text={text} em={em} />
      </span>
      <span className="typed__ink">
        <Emphasised text={text} em={em} upto={shown} />
        {/* Only while characters are still arriving. A caret that stays after
            the last one is a cursor in a field nobody is typing in — and on the
            narration, which is not a field at all, it read as the sentence
            having been cut off. */}
        {typing ? <span className="typed__caret" /> : null}
      </span>
    </span>
  )
}

/* Colour the skill token (`/mechanist:auto`) and leave the rest muted. */
function CommandLine({ text }) {
  const match = text.match(/^(\/\S+)(\s.*)?$/)
  if (!match) return text
  return (
    <>
      <span className="agent__skill">{match[1]}</span>
      {match[2] ?? null}
    </>
  )
}

/* Reveal by character while keeping the emphasis span intact — the bold phrase
   has to bold as it arrives, not snap to bold once it is complete. `em` may be
   one phrase or several; each is painted green as its characters land. */
function Emphasised({ text, em, upto }) {
  const shown = upto == null ? text : text.slice(0, upto)
  if (!em) return shown

  const phrases = (Array.isArray(em) ? em : [em]).filter(Boolean)
  if (!phrases.length) return shown

  const ranges = phrases
    .map((phrase) => {
      const start = text.indexOf(phrase)
      return start < 0 ? null : { start, end: start + phrase.length }
    })
    .filter(Boolean)
    .sort((a, b) => a.start - b.start)

  if (!ranges.length) return shown

  const cut = shown.length
  const parts = []
  let cursor = 0
  for (const { start, end } of ranges) {
    if (cut <= start) break
    if (cursor < start) parts.push(shown.slice(cursor, Math.min(cut, start)))
    if (cut > start) {
      parts.push(
        <strong key={`${start}-${end}`}>
          {shown.slice(start, Math.min(cut, end))}
        </strong>,
      )
    }
    cursor = end
  }
  if (cut > cursor) parts.push(shown.slice(cursor))
  return <>{parts}</>
}

/* One chevron, pointing left. The next button flips it in CSS rather than
   carrying a second, mirrored path. */
function ChevronGlyph() {
  return (
    <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true">
      <path d="M7.5 1.5L3 6l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* The cursor that presses Run. Its tip is the path's first point, at the
   glyph's top-left, which is what the CSS positions against the button. */
function PointerGlyph() {
  return (
    <svg viewBox="0 0 16 20" width="16" height="20" aria-hidden="true">
      <path
        d="M1.6 1.2l11.6 8.1-5.1.7 2.6 5.6-2.4 1.1-2.6-5.6-3.3 3.4z"
        fill="var(--text)"
        stroke="var(--surface)"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* A paper plane to send with, a tick once it is sent. */
function SubmitGlyph({ sent }) {
  return (
    <svg viewBox="0 0 14 14" width="11" height="11" aria-hidden="true">
      {sent ? (
        <path d="M2.5 7.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M2 12L12.5 7 2 2l2 5z" fill="currentColor" />
      )}
    </svg>
  )
}

function ReplayGlyph() {
  return (
    <svg viewBox="0 0 14 14" width="12" height="12" aria-hidden="true">
      <path d="M12 7a5 5 0 1 1-1.6-3.7" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M12.3 1.3v3.1H9.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function summarise(run) {
  const beats = run.steps.map((s) => `${s.rail}: ${s.line.text}`).join(' ')
  return `A recorded Mechanist run, replayed. ${run.command} — ${run.question} ${beats}`
}
