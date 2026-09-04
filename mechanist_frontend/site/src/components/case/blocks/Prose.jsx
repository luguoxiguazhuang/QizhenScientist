import toParagraphs from './toParagraphs.js'
import './blocks.css'

/* Un-numbered narrative. Use where a passage is commentary on the
 * investigation rather than a step in it — otherwise it should be a chapter
 * and take a number. */
export default function Prose({ block }) {
  return (
    <div className="case-prose">
      {block.title ? <h3>{block.title}</h3> : null}
      {toParagraphs(block.body).map((paragraph) => (
        <p key={paragraph.slice(0, 40)}>{paragraph}</p>
      ))}
    </div>
  )
}
