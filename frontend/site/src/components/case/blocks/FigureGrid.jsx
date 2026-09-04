import { FIGURES } from '../../../content/figures.generated.js'
import { withBase } from '../../../lib/basePath.js'
import './blocks.css'

/* Two halves of one published figure, side by side.
 *
 * This exists for the case where the paper draws a single figure as a pair and
 * splitting it loses the comparison. Fig. 3c is the example: its left half is
 * the chemistry-laboratory arm and its right half is the fruit-preference arm,
 * and the whole point of the result is that the two are the same experiment in
 * different modalities. Stacking them turns a comparison into a sequence.
 *
 * The other case it covers is two figures that share an axis: Evo2's Fig. 5c
 * sweeps the steering coefficient and Fig. 5d folds structures at four points
 * along that same coefficient. Apart, they are a curve and then some pictures;
 * paired, the pictures are the curve's safe half drawn out.
 *
 * Not a general-purpose gallery. If two figures do not have to be read against
 * each other, they are two `figure` blocks and they take the reading measure
 * like everything else.
 */
export default function FigureGrid({ block }) {
  const items = block.items
    .map((item) => ({ item, figure: FIGURES[item.figureId] }))
    .filter((entry) => {
      if (entry.figure) return true
      if (import.meta.env.DEV) {
        console.warn(`[figureGrid] unknown figureId "${entry.item.figureId}"`)
      }
      return false
    })

  if (!items.length) return null

  return (
    <figure className="case-figure case-figure--grid">
      {block.title ? <h3 className="case-figure__title">{block.title}</h3> : null}
      <div className="case-figure__grid">
        {items.map(({ item, figure }) => (
          <div
            className="case-figure__cell"
            key={item.figureId}
            data-plate={figure.plate ? 'true' : undefined}
            /* Each column grows in proportion to its panel's aspect ratio, so
               the two images come out the same height — see blocks.css. */
            style={{ '--cell-ratio': figure.width / figure.height }}
          >
            <img
              className="case-figure__img"
              src={withBase(figure.src)}
              srcSet={
                figure.src2x && figure.src2x !== figure.src
                  ? `${withBase(figure.src)} 1x, ${withBase(figure.src2x)} 2x`
                  : undefined
              }
              width={figure.width}
              height={figure.height}
              alt={figure.alt}
              loading="lazy"
              decoding="async"
            />
            {item.caption ? <p className="case-figure__cell-caption">{item.caption}</p> : null}
          </div>
        ))}
      </div>
      {block.caption || block.source ? (
        <figcaption className="case-figure__caption">
          {block.caption}
          {block.source ? <span className="case-figure__source">{block.source}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  )
}
