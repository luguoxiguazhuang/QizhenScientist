import toParagraphs from './toParagraphs.js'
import './blocks.css'

/* The narrative spine of a case: titled beats down the argument column. */
export default function ChapterList({ chapters }) {
  return (
    <div className="case-chapters">
      {chapters.map((chapter) => (
        <section className="case-chapter" key={chapter.title}>
          <div className="case-chapter__body">
            {chapter.kicker ? <span className="case-chapter__kicker">{chapter.kicker}</span> : null}
            <h2>{chapter.title}</h2>
            {toParagraphs(chapter.body).map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
            {chapter.quote ? (
              <blockquote className="case-chapter__quote">{chapter.quote}</blockquote>
            ) : null}
          </div>
        </section>
      ))}
    </div>
  )
}
