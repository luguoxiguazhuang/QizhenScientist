/* The site's one arrow.
 *
 * This was defined six times — byte-for-byte identical in Hero, HomeCases,
 * HomeQuickStart, HowItWorks and CasesPage, and once more in CaseDetailPage
 * with a direction modifier and a 15px size. Six copies of a shape is six
 * places to miss when the shape changes, and the CaseDetailPage copy had
 * already drifted a pixel.
 *
 * `size` and `className` cover every existing use; anything more belongs in
 * CSS, since the stroke follows currentColor. */
export default function ArrowIcon({ size = 14, className }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="13 6 19 12 13 18" />
    </svg>
  )
}
