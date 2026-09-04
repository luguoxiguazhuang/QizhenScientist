import './HeroBackdrop.css'

/* A ruled field behind the thesis, and nothing more than that.
 *
 * What was here before drew the standard layer x head map — 32 columns, 12
 * rows, a sparse lit set — into a box two and a half times its own viewBox
 * with `preserveAspectRatio="slice"`. The 8px cells came out around 20px at a
 * 30px pitch, which is far too coarse to read as a matrix, and the radial mask
 * then removed all but a dozen of them. The result was a handful of grey and
 * teal blocks floating across the title and the lede: not an attention map,
 * just debris. A figure that cannot be read is worse than no figure.
 *
 * So the layer no longer claims to be data. Ruling gives the cream some
 * structure, and the wash over the middle of it clears a space for the title
 * to sit in rather than on top of. Both are drawn in CSS — there is no grid to
 * generate, so there is nothing for a component to compute. */
export default function HeroBackdrop() {
  return <div className="backdrop" aria-hidden="true" />
}
