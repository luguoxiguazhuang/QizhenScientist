import './blocks.css'

/* Two or more arms of the same study, side by side.
 *
 * The subliminal case is the reason this exists: it ran a chemistry-lab text
 * study and a fruit-preference text-to-image study, and listing their four
 * models flat made one two-arm investigation read as a single four-model one.
 * Setting the arms beside each other is what makes the shared structure —
 * biased teacher, filter, innocent student, trait reappears — legible as the
 * finding rather than as a coincidence. */
export default function Arms({ block }) {
  return (
    <div className="case-arms">
      {block.label ? <h3 className="case-arms__label">{block.label}</h3> : null}
      <div className="case-arms__grid">
        {block.arms.map((arm) => (
          <section className="case-arm" key={arm.name}>
            <h4 className="case-arm__name">{arm.name}</h4>
            {arm.meta?.length ? (
              <dl className="case-arm__meta">
                {arm.meta.map((entry) => (
                  <div key={entry.k}>
                    <dt>{entry.k}</dt>
                    <dd>{entry.v}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            <p className="case-arm__result">{arm.result}</p>
            {arm.note ? <p className="case-arm__note">{arm.note}</p> : null}
          </section>
        ))}
      </div>
    </div>
  )
}
