import './blocks.css'

/* What was actually run: the models and the job each did, and the pipeline
 * command that carried it. */
export default function RunSheet({ item }) {
  if (!item) return null

  return (
    <aside className="case-runsheet" aria-label="Run details">
      <h3>Run details</h3>
      <dl className="case-runsheet__facts">
        <div className="case-runsheet__fact">
          <dt>Models</dt>
          <dd>
            <ul className="case-runsheet__models">
              {item.models.map((model) => (
                <li key={model.name}>
                  <span className="case-runsheet__model-name">{model.name}</span>
                  <span className="case-runsheet__model-role">{model.role}</span>
                </li>
              ))}
            </ul>
          </dd>
        </div>
        <div className="case-runsheet__fact">
          <dt>Pipeline command</dt>
          <dd>
            <code>{item.autoCommand}</code>
          </dd>
        </div>
      </dl>
    </aside>
  )
}
