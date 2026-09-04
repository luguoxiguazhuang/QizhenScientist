import { FIGURES } from '../../../content/figures.generated.js'
import { withBase } from '../../../lib/basePath.js'
import './blocks.css'

/* A panel exported from the paper.
 *
 * Two things here are deliberate and should not be "tidied":
 *
 * `plate` puts the figure on a cream card. These panels are scientific
 * figures whose colours carry meaning — green means alpha-helix, the bar
 * colours identify the arm — so they are never inverted, tinted or
 * multiply-blended to suit a dark background. A white plate on dark ground
 * reads as a specimen slide, which is the right register anyway.
 *
 * `width` and `height` are the true 1x pixel dimensions from the export
 * manifest, set as attributes so the browser reserves the right box before the
 * image arrives. Without them a page full of lazily-loaded figures reflows
 * under the reader as they scroll. */
export default function Figure({ block }) {
  const figure = FIGURES[block.figureId]

  if (!figure) {
    if (import.meta.env.DEV) {
      console.warn(`[figure] unknown figureId "${block.figureId}" — run \`npm run figures\``)
    }
    return null
  }

  const caption = block.caption ?? null
  const imageOnly = block.imageOnly === true

  return (
    <figure className="case-figure" data-plate={figure.plate ? 'true' : undefined}>
      {!imageOnly && block.title ? <h3 className="case-figure__title">{block.title}</h3> : null}
      <FigureImage figure={figure} />
      {!imageOnly && (caption || figure.source) ? (
        <figcaption className="case-figure__caption">
          {caption}
          {figure.source ? <span className="case-figure__source">{figure.source}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  )
}

function FigureImage({ figure }) {
  const src = withBase(figure.src)
  /* Some panels are narrower than the 2x target, so the exporter shrink-only
     resize leaves 1x and 2x identical. Declaring a srcset in that case buys
     nothing and costs a descriptor the browser has to weigh. */
  const srcSet = figure.src2x && figure.src2x !== figure.src
    ? `${src} 1x, ${withBase(figure.src2x)} 2x`
    : undefined

  return (
    <img
      className="case-figure__img"
      src={src}
      srcSet={srcSet}
      width={figure.width}
      height={figure.height}
      alt={figure.alt}
      loading="lazy"
      decoding="async"
    />
  )
}
