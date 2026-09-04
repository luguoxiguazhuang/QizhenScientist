import './blocks.css'

/* A real table: <caption>, <th scope>, and a horizontally scrollable wrapper
 * so a wide result table never forces the whole page sideways.
 *
 * `mono` on a column sets it in the monospace face with tabular figures, which
 * is what makes a column of numbers comparable down the page rather than
 * merely present. `highlight` names the row key that carries the finding. */
export default function TableBlock({ block }) {
  const { columns, rows, title, caption, highlight } = block

  return (
    <figure className="case-table">
      {title ? <h3 className="case-table__title">{title}</h3> : null}
      <div className="case-table__scroll" tabIndex={0} role="group" aria-label={title ?? 'Table'}>
        <table>
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  data-align={column.align ?? 'left'}
                  data-mono={column.mono ? 'true' : undefined}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={row[columns[0].key] ?? rowIndex}
                data-highlight={highlight != null && row[columns[0].key] === highlight ? 'true' : undefined}
              >
                {columns.map((column, columnIndex) =>
                  columnIndex === 0 ? (
                    <th key={column.key} scope="row" data-align={column.align ?? 'left'}>
                      {row[column.key]}
                    </th>
                  ) : (
                    <td
                      key={column.key}
                      data-align={column.align ?? 'left'}
                      data-mono={column.mono ? 'true' : undefined}
                    >
                      {row[column.key]}
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption ? <figcaption className="case-table__caption">{caption}</figcaption> : null}
    </figure>
  )
}
