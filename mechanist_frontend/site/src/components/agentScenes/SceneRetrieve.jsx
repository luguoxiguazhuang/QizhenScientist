/* Step 1 — the three places the question is asked.
 *
 * Two of them are Mechanist's own knowledge graphs; the third is the open
 * literature, reached through the public indexes. The graphs are not drawn as
 * networks: a node cloud says "this is a graph", which the reader already knows
 * from the word graph, and says nothing about what is happening here, which is
 * that a query goes out to three stores and each comes back with a list.
 *
 * So each source gets a card of its own — its name, what it holds, and a status
 * line that turns over from a spinner to a tick. Three cards rather than three
 * rows inside one box: these are three separate calls, and a shared frame made
 * them read as one call with three lines of output.
 *
 * They do not finish together. Each answers a beat after the one before it, so
 * the set reads as three searches returning rather than one switch being
 * thrown. The horizontal tip under them is the stage's product: the hypothesis
 * the three replies converge on.
 *
 * Beats: 0 all three queries out · 1 still running · 2 the interpretability
 *        graph answers · 3 the cross-disciplinary one · 4 the web search, and
 *        the hypothesis tip lands with it.
 */

import StatusMark from './StatusMark.jsx'

export default function SceneRetrieve({ step, beat }) {
  const hyp = step.hypothesis
  const ready = beat >= 4

  return (
    <div className="sc sc--bare">
      <div className="sc__body sc-retrieve">
        <div className="sc-retrieve__cards">
          {step.sources.map((source, g) => {
            const done = beat >= 2 + g
            return (
              <section
                key={source.id}
                className="sc-retrieve__db"
                data-state={done ? 'done' : 'running'}
                data-tone={source.id}
              >
                <p className="sc-retrieve__name">{source.name}</p>
                <p className="sc-retrieve__stat">{source.stat}</p>

                <p className="sc-retrieve__status">
                  <StatusMark done={done} />
                  {done ? source.out : 'Searching'}
                </p>
              </section>
            )
          })}
        </div>

        {hyp ? (
          <p className="sc-retrieve__result" data-ready={ready ? 'true' : undefined}>
            <span className="sc-retrieve__result-label">{hyp.label}</span>
            <span className="sc-retrieve__result-text">
              <Emphasised text={hyp.text} em={hyp.em} />
            </span>
          </p>
        ) : null}
      </div>
    </div>
  )
}

/* Same single-phrase emphasis the narration uses — keep the tip's green token
   in the same shape so the metric of the stage and the metric of the sentence
   read as one system. */
function Emphasised({ text, em }) {
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
