import './RouteFallback.css'

/* Shown while a code-split route's chunk is in flight. On a fast connection it
   never paints; on a slow one it is the difference between "loading" and "the
   link did nothing".
 *
 * It reserves roughly a viewport of height on purpose. Without that the footer
 * jumps up to meet the header for one frame and then back down when the chunk
 * lands, which reads as a glitch rather than as loading. */
export default function RouteFallback({ label = 'Loading…' }) {
  return (
    <div className="route-fallback" role="status" aria-live="polite">
      <span className="route-fallback__spinner" aria-hidden="true" />
      <span className="route-fallback__label">{label}</span>
    </div>
  )
}
