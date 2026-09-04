/* One slot, two occupants: a ring while a call is out, a tick once it has
 * answered.
 *
 * Shared because it is the same claim in two acts — Hypothesis Generation
 * queries three stores, Experiment Design consults a method and then writes a
 * plan, and in both the reader is being told the same thing: this is work in
 * flight, and now it is not. Two copies of it drifted apart the moment either
 * was touched; the retrieve cards' ring was 720ms and nothing else on the panel
 * turned at that rate.
 *
 * The slot is sized so the line does not shift when the two swap: a ring that
 * measures 11px and a tick that measures 13 both sit in a 13px box, centred.
 */
export default function StatusMark({ done }) {
  return (
    <span className="sc-mark" data-done={done ? 'true' : undefined}>
      {done ? <TickGlyph /> : <span className="sc-mark__spin" />}
    </span>
  )
}

/* A tick, not a dot filling in. A progress bar reaching its end says "finished";
   a tick says a call came back with something. */
function TickGlyph() {
  return (
    <svg viewBox="0 0 14 14" width="13" height="13" aria-hidden="true">
      <path
        d="M2 7.4l3.2 3.2L12 3.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
