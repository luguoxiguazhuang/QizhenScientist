import { useEffect, useMemo, useRef, useState } from 'react'
import { marked } from 'marked'

marked.setOptions({ breaks: false, gfm: true, mangle: false, headerIds: false })

function truncate(s, n = 220) {
  if (!s) return ''
  return s.length > n ? `${s.slice(0, n - 1)}…` : s
}

function citeChip(cited) {
  const n = Number(cited) || 0
  if (n >= 500) return { label: `${n}+`, tone: 'strong' }
  if (n >= 50)  return { label: `${n}`, tone: 'med' }
  return { label: `${n}`, tone: 'lite' }
}

export default function DatabaseHistoryView({ category, bigNode, onClose, dataRoot }) {
  const historyPath = `${dataRoot}history/${category.id}__${bigNode.id}.md`
  const containerRef = useRef(null)
  const [markdown, setMarkdown] = useState('')
  const [markdownError, setMarkdownError] = useState(null)
  const [paperDetails, setPaperDetails] = useState({})

  // Fetch markdown once.
  useEffect(() => {
    let cancelled = false
    fetch(historyPath)
      .then((r) => {
        if (!r.ok) throw new Error(`history HTTP ${r.status}`)
        return r.text()
      })
      .then((text) => { if (!cancelled) setMarkdown(text) })
      .catch((err) => { if (!cancelled) setMarkdownError(err) })
    return () => { cancelled = true }
  }, [historyPath])

  // Lazy-load top-of-list paper details for the timeline strip.
  useEffect(() => {
    let cancelled = false
    async function loadDetails() {
      const ids = (bigNode.papers ?? []).slice(0, 60).map((p) => p.id)
      const results = {}
      await Promise.all(
        ids.map(async (pid) => {
          try {
            const r = await fetch(`${dataRoot}papers/${pid}.json`)
            if (!r.ok) return
            results[pid] = await r.json()
          } catch {
            /* swallow individual failures */
          }
        }),
      )
      if (!cancelled) setPaperDetails(results)
    }
    loadDetails()
    return () => { cancelled = true }
  }, [bigNode, dataRoot])

  // Group timeline papers by quarter for the horizontal strip.
  const timeline = useMemo(() => {
    const buckets = new Map()
    const papers = (bigNode.papers ?? [])
      .map((p) => ({ ...p, ...paperDetails[p.id] }))
    for (const p of papers) {
      let d = null
      if (p.date) {
        const parts = p.date.split('-')
        if (parts.length >= 3) d = new Date(parts[0], parts[1] - 1, parts[2])
      } else if (p.year) {
        d = new Date(p.year, 5, 15)
      }
      if (!d) continue
      const q = Math.floor(d.getMonth() / 3) + 1
      const key = `${d.getFullYear()} Q${q}`
      const arr = buckets.get(key) ?? []
      arr.push(p)
      buckets.set(key, arr)
    }
    const rows = []
    for (const [key, papers] of buckets) {
      const [y, qStr] = key.split(' ')
      const q = parseInt(qStr.slice(1), 10)
      const startMonth = (q - 1) * 3
      const start = new Date(parseInt(y, 10), startMonth, 1)
      const end = new Date(parseInt(y, 10), startMonth + 3, 0)
      const sorted = papers
        .slice()
        .sort((a, b) => (b.cited ?? 0) - (a.cited ?? 0))
        .slice(0, 3)
      rows.push({
        key,
        year: parseInt(y, 10),
        quarter: q,
        rangeStart: start.toISOString().slice(0, 10),
        rangeEnd: end.toISOString().slice(0, 10),
        papers: sorted,
      })
    }
    rows.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.quarter - b.quarter
    })
    return rows
  }, [bigNode, paperDetails])

  const html = useMemo(() => {
    if (!markdown) return ''
    try {
      return marked.parse(markdown)
    } catch {
      return `<pre>${markdown}</pre>`
    }
  }, [markdown])

  const handleDownloadMd = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${category.id}__${bigNode.id}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    containerRef.current?.scrollTo?.({ top: 0, behavior: 'auto' })
  }, [bigNode.id])

  return (
    <div className="database-history" role="dialog" aria-label={`${bigNode.label} 时间线`}>
      <div className="database-history__topbar">
        <button type="button" className="database-history__back" onClick={onClose} aria-label="返回知识图谱">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          返回知识图谱
        </button>
        <div className="database-history__title">
          <span className="database-history__kicker">{category.label}</span>
          <h2>{bigNode.label}</h2>
          <p>
            {bigNode.leaf_paper_count} 篇重点论文 · 图谱中共 {bigNode.total_papers_in_db} 篇
          </p>
        </div>
        <button
          type="button"
          className="database-history__download"
          onClick={handleDownloadMd}
          disabled={!markdown}
          title="下载 Markdown"
        >
          下载 .md
        </button>
      </div>

      <div ref={containerRef} className="database-history__scroll">
        <div className="database-history__timeline-wrap">
          <div className="database-history__timeline">
            {timeline.map((col) => (
              <section key={col.key} className="database-history__col">
                <div className="database-history__col-head">
                  <span className="database-history__col-key">{col.key}</span>
                  <span className="database-history__col-range">
                    {col.rangeStart} → {col.rangeEnd}
                  </span>
                </div>
                <div className="database-history__cards">
                  {col.papers.map((p) => {
                    const chip = citeChip(p.cited)
                    const short = p.research_question ?? p.core_contribution ?? ''
                    return (
                      <article key={p.id} className={`database-history__card database-history__card--${chip.tone}`}>
                        <div className="database-history__card-top">
                          <span className={`database-history__cite database-history__cite--${chip.tone}`}>
                            {chip.label} 次引用
                          </span>
                          {p.venue && (
                            <span className="database-history__venue">{p.venue}</span>
                          )}
                        </div>
                        <h4>{p.title}</h4>
                        {short && <p>{truncate(short, 220)}</p>}
                        {p.target_model?.length > 0 && (
                          <div className="database-history__models">
                            {p.target_model.slice(0, 4).map((m, idx) => (
                              <span key={idx}>{m}</span>
                            ))}
                          </div>
                        )}
                        {p.openalex_id && (
                          <a
                            className="database-history__card-link"
                            href={p.openalex_id}
                            target="_blank"
                            rel="noreferrer"
                          >
                            OpenAlex ↗
                          </a>
                        )}
                      </article>
                    )
                  })}
                  {col.papers.length === 0 && (
                    <p className="database-history__col-empty">本季度暂无论文。</p>
                  )}
                </div>
              </section>
            ))}
            {timeline.length === 0 && (
              <p className="database-history__col-empty">
                该节点暂无带日期的论文。
              </p>
            )}
          </div>
        </div>

        <article
          className="database-history__markdown markdown-body"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {markdownError && (
          <p className="database-history__markdown-err">
            领域发展史文本加载失败。
          </p>
        )}
      </div>
    </div>
  )
}
