import toParagraphs from './toParagraphs.js'
import './blocks.css'

/* An aside that is not part of the narrative flow: a robustness check, a
 * caveat, a verdict from the claims ledger.
 *
 * `verdict` renders the ledger's own vocabulary — PASS, FAIL, INCONCLUSIVE —
 * because that is what a run actually writes to disk, and a case page claiming
 * a result should show it in the same terms the system recorded it. */
const TONE_LABEL = {
  note: 'Also noted',
  caveat: 'Caveat',
  verdict: 'Claims ledger',
}

export default function Callout({ block }) {
  const tone = block.tone ?? 'note'

  return (
    <aside className="case-callout" data-tone={tone}>
      <span className="case-callout__eyebrow">{TONE_LABEL[tone] ?? tone}</span>
      <div className="case-callout__head">
        <h3>{block.title}</h3>
        {block.verdict ? (
          <span className="case-callout__verdict" data-verdict={block.verdict.toLowerCase()}>
            {block.verdict}
          </span>
        ) : null}
      </div>
      {toParagraphs(block.body).map((paragraph) => (
        <p key={paragraph.slice(0, 40)}>{paragraph}</p>
      ))}
    </aside>
  )
}
