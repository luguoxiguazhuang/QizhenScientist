import { FIGURES } from '../../content/figures.generated.js'
import { withBase } from '../../lib/basePath.js'

/* Step 5 — what the run concluded, and the thing it made.
 *
 * Three lines on the left, the folded structures on the right. The structures
 * are the only part of this whole run that is not a diagram of a method: it is
 * the output, and at α = 0 / 2 / 4 / 8 you can watch coil turn into helix
 * without reading a single number. So it is placed where the eye lands last
 * and left entirely alone — no overlay, no annotation of ours on top of the
 * published panel. The measured gain sits under the steps as the finding.
 *
 * Beats: 0 frame · 1 the three steps · 2 the structures · 3 the finding.
 */

export default function SceneConclude({ step }) {
  const figure = FIGURES[step.figureId]

  return (
    <div className="sc sc--bare">
      <div className="sc__body sc-conclude">
        <div className="sc-conclude__left">
          <ol className="sc-conclude__steps">
            {step.summary.map((entry, i) => (
              <li key={entry} style={{ '--i': i }}>
                <span>{i + 1}</span>
                <p>{entry}</p>
              </li>
            ))}
          </ol>

          {step.finding ? (
            <p className="sc-conclude__finding">
              <FindingText text={step.finding.text} em={step.finding.em} />
            </p>
          ) : null}
        </div>

        {figure ? (
          <figure className="sc-conclude__figure">
            <img
              src={withBase(figure.src)}
              width={figure.width}
              height={figure.height}
              alt=""
              loading="lazy"
              decoding="async"
            />
          </figure>
        ) : null}
      </div>
    </div>
  )
}

function FindingText({ text, em }) {
  if (!em) return text
  const start = text.indexOf(em)
  if (start < 0) return text
  const end = start + em.length
  return (
    <>
      {text.slice(0, start)}
      <strong>{text.slice(start, end)}</strong>
      {text.slice(end)}
    </>
  )
}
