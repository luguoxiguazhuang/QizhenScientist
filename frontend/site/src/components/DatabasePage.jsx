import { Component, useCallback, useEffect, useMemo, useState } from 'react'
import DatabaseDomains from './DatabaseDomains.jsx'
import DatabaseGraph from './DatabaseGraph.jsx'
import DatabaseHistoryView from './DatabaseHistoryView.jsx'
import HistoryDemo from './HistoryDemo.jsx'
import PageHeader from './PageHeader.jsx'
import './DatabasePage.css'
import { withBase } from '../lib/basePath.js'
import { DATABASE_CHANNELS, PAGE_ACCENTS } from '../content/mechanistContent.js'
import CountUp from './motion/CountUp.jsx'

/**
 * Safety net so a runtime error in DatabaseGraph (e.g. a Sigma teardown race
 * on tab switch) never blanks the whole page. When it fires the user sees a
 * clear message + a "Reset" button that remounts the graph from scratch.
 */
class GraphErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // Keep it visible in the browser console so real bugs still surface.
    console.error('[DatabaseGraph] crash caught by boundary:', error, info)
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
    this.props.onReset?.()
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }
    return (
      <div className="database-graph-error database-graph-error--boundary">
        <strong>知识图谱运行遇到问题。</strong>
        <p>
          其余页面仍可正常使用，点击按钮重新加载知识图谱。
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={this.reset}
        >
          重新加载图谱
        </button>
      </div>
    )
  }
}

const DATA_ROOT = withBase('database/')

const SCHEMA_ENTITIES = [
  {
    pill: '论文',
    value: '13.9k',
    text: '图谱中的核心记录，所有关系都从论文节点出发。',
    tone: 'teal',
  },
  {
    pill: '作者',
    value: '33.4k',
    text: '跨论文去重后保留为独立的图谱节点。',
    tone: 'gold',
  },
  {
    pill: '发表场所',
    value: '929',
    text: '会议、期刊、技术博客与预印本平台。',
    tone: 'blue',
  },
  {
    pill: '辅助维度 × 5',
    value: '27',
    /* The 27 curated categories of the interpretability graph — not the 26
       cross-disciplinary domains shown in the header ledger. */
    text: '方法、组件、场景、能力、目标模型五个维度，上方分类树展示其中 27 个分类。',
    tone: 'mix',
  },
]

const SCHEMA_RELATIONS = [
  { src: '论文', rel: '作者', dst: '作者' },
  { src: '论文', rel: '发表在', dst: '发表场所' },
  { src: '论文', rel: '使用', dst: '方法' },
  { src: '论文', rel: '研究', dst: '组件' },
  { src: '论文', rel: '应用于', dst: '场景' },
  { src: '论文', rel: '探测', dst: '能力' },
  { src: '论文', rel: '面向', dst: '目标模型' },
]

const PAPER_ANATOMY = [
  {
    step: '01',
    kicker: '来源信息',
    caption: '论文在开放网络中的来源',
    items: [
      '标题',
      '作者',
      '年份 · 日期',
      '发表场所 · 类型',
      '引用次数',
      'DOI · OpenAlex ID',
    ],
  },
  {
    step: '02',
    kicker: '原始内容',
    caption: '用于检索的全文信号',
    items: [
      '摘要',
      '标题与摘要向量 — 1024 维 bge-large-en-v1.5',
      '机构 · 来源网址',
    ],
  },
  {
    step: '03',
    kicker: '模型提取结构',
    caption: '从摘要中提炼的 21 个结构化字段',
    items: [
      '研究问题',
      '核心贡献',
      '结论',
      '关键发现',
      '局限性',
      '未来方向',
      '目标模型',
      '模态',
    ],
  },
]

/* Labels read as headings now rather than as the opening words of the
   sentence below them ("Every paper" / "carries a canonical venue…"), which
   only worked while each one was wrapped in its own card. */
const FACT_ROWS = [
  {
    label: '一条记录，完整结构',
    text:
      '每篇论文都包含规范化发表信息、DOI、标题与摘要向量，以及 21 个模型提取字段，单条记录即可回答研究主张、目标模型与证据强度。',
  },
  {
    label: '三棵精选分类树',
    text:
      '语料按机制方法、解释性对象和应用场景组织，能力与目标模型仍可从底层结构中检索。',
  },
  {
    label: '每个分类都有时间线',
    text:
      '每个分类都生成按季度整理的重点论文时间线，包含贡献、发现与局限，并支持下载 Markdown。',
  },
]

const RETRIEVAL_STAGES = [
  {
    step: '01',
    signal: 'LLM + HyDE',
    kicker: '理解问题',
    title: '将研究意图转成检索信号',
    text:
      '提取关键术语与五类结构化筛选条件，拆分多主题问题、扩展同义词，并生成假设性目标摘要。',
  },
  {
    step: '02',
    signal: '1 / 2 张图谱',
    kicker: '路由',
    title: '选择合适的知识图谱',
    text:
      '模型内部问题进入解释性图谱，跨领域问题进入全学科图谱，也可以经过领域改写后同时检索两张图谱。',
  },
  {
    step: '03',
    signal: '9 个渠道',
    kicker: '召回',
    title: '并行召回候选证据',
    text:
      '结合结构化标签、全文索引、标题与摘要向量、HyDE 向量、共被引与前向引用扩展。',
  },
  {
    step: '04',
    signal: 'RRF · K=60',
    kicker: '融合',
    title: '组合彼此独立的证据',
    text:
      '加权倒数排名融合各渠道结果并去除重复标题，让多个信号共同支持的论文获得更高排序。',
  },
  {
    step: '05',
    signal: '主题门槛',
    kicker: '重排',
    title: '让相关性优先于知名度',
    text:
      '只有通过主题相关性门槛后，才使用引用量、时效性与标题匹配进行重排。',
  },
]

export default function DatabasePage() {
  const [manifest, setManifest] = useState(null)
  const [manifestError, setManifestError] = useState(null)
  const [activeCategoryId, setActiveCategoryId] = useState(null)
  const [openHistory, setOpenHistory] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  // Incremented to force a fresh DatabaseGraph after an error-boundary reset.
  const [remountToken, setRemountToken] = useState(0)

  // Load manifest once.
  useEffect(() => {
    // AbortController rather than a `cancelled` flag: the flag stopped the
    // setState but left the request itself running to completion.
    const controller = new AbortController()

    fetch(`${DATA_ROOT}manifest.json`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`manifest HTTP ${r.status}`)
        return r.json()
      })
      .then((data) => {
        setManifest(data)
        // Functional update, so this no longer reads activeCategoryId from the
        // effect's closure. It used to, with the dependency check suppressed —
        // correct only because the value is guaranteed null on first run, which
        // is a fact about timing that nothing in the code stated.
        if (data?.categories?.length) {
          setActiveCategoryId((current) => current ?? data.categories[0].id)
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setManifestError(err)
      })

    return () => {
      controller.abort()
    }
  }, [])

  const activeCategory = useMemo(() => {
    if (!manifest || !activeCategoryId) return null
    return manifest.categories.find((c) => c.id === activeCategoryId) ?? null
  }, [manifest, activeCategoryId])

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((v) => !v)
  }, [])

  // Escape → exit fullscreen / close history view (whichever is on).
  useEffect(() => {
    function onKey(event) {
      if (event.key !== 'Escape') return
      if (openHistory) {
        setOpenHistory(null)
        return
      }
      if (isFullscreen) {
        setIsFullscreen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openHistory, isFullscreen])

  // Body class controls scroll-lock when fullscreen is active.
  useEffect(() => {
    if (isFullscreen) {
      document.body.classList.add('database-fullscreen-lock')
    } else {
      document.body.classList.remove('database-fullscreen-lock')
    }
    return () => {
      document.body.classList.remove('database-fullscreen-lock')
    }
  }, [isFullscreen])

  const handleOpenHistory = useCallback((category, bigNode) => {
    setOpenHistory({ category, bigNode })
  }, [])

  const handleCloseHistory = useCallback(() => {
    setOpenHistory(null)
  }, [])

  const graphContainerClasses = [
    'database-graph-shell',
    isFullscreen ? 'database-graph-shell--fullscreen' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section
      className={`database-page${isFullscreen ? ' is-fullscreen' : ''}`}
      style={{ '--page-accent': PAGE_ACCENTS.database }}
    >
      {!isFullscreen && (
        <>
          <PageHeader
            motif="graph"
            wideRail
            title="知识图谱"
            lede="两张知识图谱共同支撑科学假设：启真解释性图谱追踪细粒度研究进展，全学科图谱连接 26 个领域的理论与方法。"
            aside={
              <dl className="page-header-ledger">
                {DATABASE_CHANNELS.map((channel, index) => (
                  <div className="page-header-ledger__channel" key={channel.title}>
                    <div className="page-header-ledger__heading">
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <div>
                        <dt>{channel.title}</dt>
                        <dd>{channel.kicker}</dd>
                      </div>
                    </div>
                    <div className="page-header-ledger__metrics">
                      {channel.metrics.map((metric) => (
                        <div key={metric.label}>
                          <strong>
                            <CountUp value={metric.value} duration={1.35} />
                          </strong>
                          <span>{metric.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </dl>
            }
          />

        </>
      )}

      {!isFullscreen && (
        <section className="section" aria-labelledby="db-cross-disciplinary">
          <div className="container db-block">
            <header className="db-block__head">
              <h2 className="section-title" id="db-cross-disciplinary">
                全学科知识图谱
              </h2>
              <p className="section-lede">
                覆盖 26 个学科的科学引文图谱，将 AI 之外的理论与方法引入每一个研究假设。
              </p>
            </header>

            <DatabaseDomains
              className="database-domains--standalone"
              hideTitle
            />
          </div>
        </section>
      )}

      <div
        className={
          isFullscreen
            ? 'database-graph-outer is-fullscreen'
            : 'database-graph-outer section'
        }
      >
        {!isFullscreen && (
          <div className="container db-block database-graph-header">
            <header className="db-block__head">
              <h2 className="section-title">解释性知识图谱</h2>
              <p className="section-lede">
                三棵树共包含 27 个分类：机制方法（10）、解释性对象（8）和应用场景（9）。点击大节点查看领域发展时间线，点击论文叶节点查看研究问题、贡献、关键发现与发表信息。
              </p>
            </header>
          </div>
        )}

        <div className={`container ${isFullscreen ? 'database-graph-container--full' : 'database-graph-container'}`}>
          <div className={graphContainerClasses}>
            {/* Addressed to a visitor, not to whoever deployed the site. This
                used to read "Make sure public/database/ was generated. Run
                python site/scripts/build_database_data.py from the repo root",
                which is an instruction nobody reading the live site can act
                on, and which reads as though they had done something wrong. */}
            {manifestError && (
              <div className="database-graph-error">
                    <strong>知识图谱暂时无法加载。</strong>
                <p>
                  其余页面仍可正常使用，下面也提供了数据集说明。
                </p>
              </div>
            )}

            {/* Manifest arrived but named no categories. Without this branch
                none of the three conditions here held and the graph area
                rendered nothing at all — no error, no spinner, no explanation. */}
            {!manifestError && manifest && !activeCategory && (
              <div className="database-graph-error">
                  <strong>暂未发布分类树。</strong>
                <p>
                  数据清单已加载，但没有可绘制的分类；下方的图谱结构说明不受影响。
                </p>
              </div>
            )}

            {!manifestError && manifest && activeCategory && (
              <>
                <GraphErrorBoundary
                  onReset={() => {
                    // Bump a token rather than blanking the category id and
                    // restoring it 40ms later on an uncleaned timer. That
                    // version rendered a "no category" frame in between and
                    // left a pending timeout behind if the page unmounted
                    // inside the gap.
                    setRemountToken((token) => token + 1)
                  }}
                >
                  {/* `key` forces a clean unmount + remount whenever the
                      selected tree changes so we never inherit stale Sigma /
                      graphology / camera state across tab switches. */}
                  <DatabaseGraph
                    key={`${activeCategoryId}:${remountToken}`}
                    manifest={manifest}
                    activeCategoryId={activeCategoryId}
                    onSelectCategory={setActiveCategoryId}
                    onOpenHistory={handleOpenHistory}
                    isFullscreen={isFullscreen}
                    onToggleFullscreen={toggleFullscreen}
                    dataRoot={DATA_ROOT}
                  />
                  {/* Inside the boundary, not beside it. This overlay used to
                      be a sibling of GraphErrorBoundary, which put the one
                      component most likely to throw outside every boundary on
                      the site: DatabaseGraph is allowed to hand over a null
                      category, and this dereferences it immediately. A null
                      there took the whole site to a blank page. */}
                  {openHistory?.category && openHistory?.bigNode && (
                    <DatabaseHistoryView
                      category={openHistory.category}
                      bigNode={openHistory.bigNode}
                      onClose={handleCloseHistory}
                      dataRoot={DATA_ROOT}
                    />
                  )}
                </GraphErrorBoundary>
              </>
            )}

            {!manifestError && !manifest && (
              <div className="database-graph-loading">
                <span className="database-loading-spinner" aria-hidden="true" />
                <span>正在加载图谱数据…</span>
              </div>
            )}
          </div>
        </div>

        {/* Three points across one row, under the graph and inside the same
            block. They name what the reader has just been clicking through —
            the shape of a record, the three trees, the timeline behind every
            big node — so they belong with it.

            They sat under the page header once, where they held the graph off
            the first screen entirely; then in a section of their own two blocks
            further down, where they explained the canvas to someone who had
            stopped looking at it. No heading: the three labels are the
            heading. */}
        <div className="container database-graph-facts">
          <ol className="db-facts" aria-label="知识图谱的组织方式">
            {FACT_ROWS.map((row, index) => (
              <li className="db-fact" key={row.label}>
                <span className="db-fact__num" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h2 className="db-fact__label">{row.label}</h2>
                <p>{row.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {!isFullscreen && (
        <section className="section section--grid" aria-labelledby="db-retrieval">
          <div className="container db-block db-retrieval">
            <header className="db-block__head db-retrieval__head">
              <span className="section-eyebrow">检索流程</span>
              <h2 className="section-title" id="db-retrieval">
                从问题到科学证据
              </h2>
              <p className="section-lede">
                启真不会依赖单一的向量检索，而是先理解问题、选择图谱，通过互补渠道召回候选结果，再融合与重排，最后将证据交给假设生成。
              </p>
            </header>

            <ol className="db-retrieval-flow">
              {RETRIEVAL_STAGES.map((stage) => (
                <li className="db-retrieval-step" key={stage.step}>
                  <div className="db-retrieval-step__meta">
                    <span className="db-retrieval-step__index" aria-hidden="true">
                      {stage.step}
                    </span>
                    <span className="db-retrieval-step__signal">{stage.signal}</span>
                  </div>
                  <span className="db-retrieval-step__kicker">{stage.kicker}</span>
                  <h3>{stage.title}</h3>
                  <p>{stage.text}</p>
                </li>
              ))}
            </ol>

            <div className="db-retrieval-notes">
              <div>
                <span>跨图谱关联</span>
                <p>
                  当两张图谱都能提供证据时，路由器会翻译不同领域的概念并明确展示连接关系，例如将 MLP 中的知识神经元与海马体中的记忆印迹细胞关联起来。
                </p>
              </div>
              <div>
                <span>可审计排序</span>
                <p>
                  每条结果保留来源、命中渠道和评分构成，区分真正的主题支撑与仅因高被引而排名靠前的论文。
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {!isFullscreen && (
        <>
          {/* /mhistory sits here as the clearest "what are the corpora for"
              answer: the graphs above are the stores; this is a question you
              can ask of them. */}
          <section className="section" aria-labelledby="db-history">
            <div className="container db-block db-history">
              <div className="db-history__copy">
                <header className="db-block__head">
                  <span className="section-eyebrow">领域发展史</span>
                  <h2 className="section-title" id="db-history">
                    一条指令追踪一个领域
                  </h2>
                  <p className="section-lede">
                    基于知识图谱，启真可以围绕研究主题整理领域发展史，串联奠基论文、方法变革、重要争论与尚未解决的问题。
                  </p>
                  <p className="section-lede db-history__example">
                    示例：{' '}
                    <code>
                      /mhistory 电路级可解释性的演进
                    </code>
                  </p>
                </header>
              </div>

              <div className="db-history__demo">
                <HistoryDemo />
              </div>
            </div>
          </section>

          {/* Both blocks below used to be panels-inside-panels: a cream card
              with a radial glow, holding four ribboned entity cards and a
              boxed relationship diagram. They are ruled channels on the
              section background now, the same way the home page sets out its
              stages — nothing here needs a container to be legible. */}
          <section className="section section--grid" aria-labelledby="db-schema">
            <div className="container db-block">
              <header className="db-block__head">
                  <span className="section-eyebrow">图谱结构</span>
                <h2 className="section-title" id="db-schema">
                  节点与关系
                </h2>
                <p className="section-lede">
                  这是底层 Neo4j 图谱的结构快照。上方画布中的每个节点，都是这些实体与关系的可视化投影。
                </p>
              </header>

              <dl className="db-entities">
                {SCHEMA_ENTITIES.map((entity) => (
                  <div className="db-entity" key={entity.pill}>
                    <dt>
                      <span className="db-entity__name">{entity.pill}</span>
                      <strong>{entity.value}</strong>
                    </dt>
                    <dd>{entity.text}</dd>
                  </div>
                ))}
              </dl>

              <div className="db-rels">
                <p className="db-rels__label">
                  七种边类型，均从“论文”节点出发
                </p>
                <ul>
                  {SCHEMA_RELATIONS.map((r) => (
                    <li key={`${r.src}-${r.rel}-${r.dst}`}>
                      <span className="db-rel__node">{r.src}</span>
                      {/* Ruled arrow: the edge label sits on the line, the
                          head lands on the target. Direction matters here —
                          every one of these edges runs one way, out of
                          Paper — so the row has to show it. */}
                      <span className="db-rel__edge">
                        <span className="db-rel__line" aria-hidden="true" />
                        <b className="db-rel__label">{r.rel}</b>
                        <span
                          className="db-rel__line db-rel__line--head"
                          aria-hidden="true"
                        />
                      </span>
                      <span className="db-rel__node db-rel__node--target">{r.dst}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="section" aria-labelledby="db-record">
            <div className="container db-block">
              <header className="db-block__head">
                <span className="section-eyebrow">论文记录</span>
                <h2 className="section-title" id="db-record">
                  一篇论文的完整记录
                </h2>
                <p className="section-lede">
                  每条记录包含三层信息：来源、原始内容，以及从论文中提取的结构化摘要。
                </p>
              </header>

              <ol className="db-anatomy">
                {PAPER_ANATOMY.map((col) => (
                  <li className="db-layer" key={col.kicker}>
                    <span className="db-layer__step" aria-hidden="true">{col.step}</span>
                    <h3 className="db-layer__name">{col.kicker}</h3>
                    <p className="db-layer__caption">{col.caption}</p>
                    <ul className="db-layer__fields">
                      {col.items.map((it) => (
                        <li key={it}>{it}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        </>
      )}
    </section>
  )
}
