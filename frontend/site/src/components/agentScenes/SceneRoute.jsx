import StatusMark from './StatusMark.jsx'

/* Step 2 — experiment design, as two calls that answer in order.
 *
 * The act is a lookup and then a piece of writing, and it is drawn as two
 * blocks stacked in that order: the method is fetched out of Mechanism Methods,
 * and once it has answered the plan is written against it. Each block carries
 * the panel's own status mark — a ring while it is working, a tick when it is
 * done — so the causal order is on the screen rather than implied by which
 * block faded up first. The plan does not begin until the method has landed,
 * because the plan is derived from it.
 *
 * This replaced a side-by-side pair of boxes captioned "Feature Intervention"
 * and "Autonomy Scaffold". Two nouns of equal weight in two equal columns read
 * as a list of the act's outputs, which is the one thing they are not: the
 * scaffold is not a second product beside the intervention, it is what makes
 * the intervention runnable unattended, and both of them come out of the
 * method named in the block above.
 *
 * Beats: 0 the method is being looked up · 1 it lands, the plan starts ·
 *        2 the plan's rows write in · 3 the plan is written.
 */

export default function SceneRoute({ step, beat }) {
  const { method, design } = step

  return (
    <div className="sc sc--bare">
      <div className="sc__body sc-route">
        <section className="sc-route__block" data-show="true" data-done={beat >= 1 ? 'true' : undefined}>
          <header className="sc-route__bar">
            <p className="sc-route__cap">{method.cap}</p>
            <p className="sc-route__state">
              <StatusMark done={beat >= 1} />
              {beat >= 1 ? method.out : 'Matching'}
            </p>
          </header>

          {/* Name and gloss on one line. On two, the method block cost 21px it
              did not have — the two blocks together want more height than the
              stage has, and the row that got cut for it was the plan's last
              one, which is the controls. A gloss is a subordinate clause; it
              can sit after the thing it glosses. */}
          <p className="sc-route__method">
            {method.name}
            <span>{method.note}</span>
          </p>
        </section>

        <section
          className="sc-route__block sc-route__block--plan"
          data-show={beat >= 1 ? 'true' : undefined}
          data-done={beat >= 3 ? 'true' : undefined}
        >
          <header className="sc-route__bar">
            <p className="sc-route__cap" title={design.cap}>
              <FileGlyph />
              <span className="sc-route__path">{design.cap}</span>
            </p>
            <p className="sc-route__state">
              <StatusMark done={beat >= 3} />
              {beat >= 3 ? design.out : 'Writing'}
            </p>
          </header>

          {/* The rows only write once the block is on screen. `--i` staggers
              them so the plan is watched being composed rather than pasted. */}
          <ul className="sc-route__rows" data-show={beat >= 2 ? 'true' : undefined}>
            {design.rows.map((row, i) => (
              <li key={row.label} style={{ '--i': i }}>
                <span>{row.label}</span>
                <p>{row.text}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

function FileGlyph() {
  return (
    <svg viewBox="0 0 14 14" width="11" height="11" aria-hidden="true">
      <path d="M3 1.5h5l3 3v8H3z" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M8 1.5v3h3" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  )
}
