/* The call that made this step happen.
 *
 * This is the one piece of the panel that is meant to look like a transcript
 * rather than an illustration: name, arguments, and the value that came back,
 * set in mono, with a spinner that turns into a result. It is what an agent
 * client actually puts on screen while it works, and without it the five
 * drawings below read as a slide deck about a system rather than a recording
 * of one.
 *
 * It stays one line. Every previous attempt at conveying "the agent is doing
 * something" on this panel used four or five parallel mechanisms — a status
 * string, a spinner, a step chip, a carry-in badge, a handoff overlay — and
 * between them they took the top half of the window. One line, with real
 * arguments in it, does more.
 */

export default function ToolLine({ tool, beat }) {
  const done = beat >= tool.doneAt

  return (
    <p className="tool" data-done={done ? 'true' : 'false'}>
      <span className="tool__caret">▸</span>
      <b className="tool__name">{tool.name}</b>
      <span className="tool__args">{tool.args}</span>
      <span className="tool__status">
        {done ? (
          <>
            <span className="tool__tick">✓</span>
            {tool.result}
          </>
        ) : (
          <>
            <span className="tool__spin" />
            running
          </>
        )}
      </span>
    </p>
  )
}
