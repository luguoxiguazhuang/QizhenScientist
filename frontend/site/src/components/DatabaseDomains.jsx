import './DatabaseDomains.css'

/* Share of the cross-disciplinary graph by discipline. Printed percentages are
   the paper's source figures and must stay as given — they sum to ~92, not 100.
   Desktop shows all 26; the phone keeps the full wheel and only lists the top 10. */
const DATABASE_DOMAINS = [
  { label: 'Medicine', value: 18.56 },
  { label: 'Social Sciences', value: 10.7 },
  { label: 'Engineering', value: 9.43 },
  { label: 'Biochemistry & Genetics', value: 6.44 },
  { label: 'Computer Science', value: 6.29 },
  { label: 'Agricultural Sciences', value: 5.32 },
  { label: 'Physics & Astronomy', value: 5.29 },
  { label: 'Environmental Science', value: 4.47 },
  { label: 'Arts & Humanities', value: 3.33 },
  { label: 'Business & Management', value: 2.67 },
  { label: 'Psychology', value: 2.44 },
  { label: 'Economics & Finance', value: 2.41 },
  { label: 'Health Professions', value: 2.13 },
  { label: 'Materials Science', value: 2.03 },
  { label: 'Mathematics', value: 2 },
  { label: 'Earth & Planetary Sciences', value: 1.64 },
  { label: 'Neuroscience', value: 1.63 },
  { label: 'Chemistry', value: 1.17 },
  { label: 'Immunology & Microbiology', value: 1.1 },
  { label: 'Decision Sciences', value: 0.86 },
  { label: 'Nursing', value: 0.46 },
  { label: 'Energy', value: 0.44 },
  { label: 'Dentistry', value: 0.41 },
  { label: 'Pharmacology & Toxicology', value: 0.3 },
  { label: 'Chemical Engineering', value: 0.2 },
  { label: 'Veterinary', value: 0.16 },
]

const DOMAIN_PHONE_ROWS = 10

/* Comma-form hsl() keeps the wheel painting on older mobile WebViews that still
   reject the modern space-separated syntax. */
const DOMAIN_RAMP = [
  [16, 48, 45],
  [34, 44, 49],
  [58, 32, 47],
  [92, 24, 43],
  [162, 30, 37],
  [198, 27, 44],
  [232, 22, 49],
  [280, 20, 53],
]

function domainColor(index, count) {
  const t = count <= 1 ? 0 : (index / (count - 1)) * (DOMAIN_RAMP.length - 1)
  const lower = Math.min(Math.floor(t), DOMAIN_RAMP.length - 2)
  const mix = t - lower
  const [h1, s1, l1] = DOMAIN_RAMP[lower]
  const [h2, s2, l2] = DOMAIN_RAMP[lower + 1]
  const h = h1 + (h2 - h1) * mix
  const s = s1 + (s2 - s1) * mix
  const l = l1 + (l2 - l1) * mix + (index % 2 ? 3 : -3)
  return `hsl(${h.toFixed(1)}, ${s.toFixed(1)}%, ${l.toFixed(1)}%)`
}

function buildDomainSlices(domains) {
  const covered = domains.reduce((sum, item) => sum + item.value, 0)
  return domains.reduce(
    (state, item, index) => {
      const sweep = (item.value / covered) * 100
      const start = state.cursor
      const end = start + sweep
      const midpoint = ((start + end) / 2) * 3.6 - 90
      const radians = (midpoint * Math.PI) / 180
      const radius = sweep > 14 ? 28 : 34

      state.slices.push({
        label: item.label,
        share: item.value,
        color: domainColor(index, domains.length),
        start,
        end,
        x: 50 + Math.cos(radians) * radius,
        y: 50 + Math.sin(radians) * radius,
      })
      state.cursor = end
      return state
    },
    { cursor: 0, slices: [] },
  ).slices
}

function buildDomainGradient(slices) {
  /* Solid arcs with a hairline gap. Avoid long transparent stop chains — those
     blanked the wheel on some phone browsers when the full 26-slice set ran. */
  return `conic-gradient(${slices.map((slice, index) => {
    const gap = index === 0 ? 0 : 0.12
    return `${slice.color} ${(slice.start + gap).toFixed(3)}% ${slice.end.toFixed(3)}%`
  }).join(', ')})`
}

const DOMAIN_SLICES = buildDomainSlices(DATABASE_DOMAINS)
const DOMAIN_GRADIENT = buildDomainGradient(DOMAIN_SLICES)
const DOMAIN_TAIL = DOMAIN_SLICES.slice(DOMAIN_PHONE_ROWS)
const DOMAIN_TAIL_SHARE = DOMAIN_TAIL.reduce((sum, row) => sum + row.share, 0)

/* Desktop shows all 26 in the list; phone keeps the full 26-slice wheel but
   only lists the top 10, with a tail line for the rest. */
export default function DatabaseDomains({ className = '', hideTitle = false }) {
  const figureClass = ['database-domains', className].filter(Boolean).join(' ')

  return (
    <figure className={figureClass}>
      {!hideTitle && (
        <figcaption className="database-domains__head">
          <strong className="database-domains__title database-domains__title--full">
            全学科知识图谱覆盖 {DOMAIN_SLICES.length} 个学科
          </strong>
          <strong className="database-domains__title database-domains__title--top">
            全学科知识图谱覆盖 {DOMAIN_SLICES.length} 个学科
          </strong>
        </figcaption>
      )}

      <div className="database-domains__body">
        <div className="database-domains__chart">
          <div
            className="database-pie"
            role="img"
            aria-label={`全学科图谱按学科分布，${DOMAIN_SLICES[0].label}占比${DOMAIN_SLICES[0].share}%，完整数据见下方列表。`}
            style={{ backgroundImage: DOMAIN_GRADIENT }}
          >
            {DOMAIN_SLICES.filter((slice) => slice.share >= 6).map((slice) => (
              <span
                className="database-pie__label"
                key={slice.label}
                style={{ left: `${slice.x}%`, top: `${slice.y}%` }}
                aria-hidden="true"
              >
                {slice.share.toFixed(1)}%
              </span>
            ))}
          </div>
        </div>

        <ol className="database-domains__list">
          {DOMAIN_SLICES.map((slice, index) => (
            <li className="domain-row" key={slice.label}>
              <span className="domain-row__rank">{String(index + 1).padStart(2, '0')}</span>
              <i className="domain-row__swatch" style={{ background: slice.color }} aria-hidden="true" />
              <span className="domain-row__label">{slice.label}</span>
              <span className="domain-row__value">{slice.share.toFixed(2)}%</span>
            </li>
          ))}
        </ol>
      </div>

      <p className="database-domains__tail">
        其余 {DOMAIN_TAIL.length} 个学科 · {DOMAIN_TAIL_SHARE.toFixed(2)}%
      </p>
    </figure>
  )
}
