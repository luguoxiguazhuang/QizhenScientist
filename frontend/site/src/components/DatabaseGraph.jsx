import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Graph from 'graphology'
import Sigma from 'sigma'
import forceAtlas2 from 'graphology-layout-forceatlas2'

// Colour palette — pulled from mechanist-theme tokens to stay on-brand.
// `cite` / `related` colour the paper-paper overlay per tree in the tree's
// own hue, soft and airy so the network reads without shouting.
// Wang's synchronous public search endpoint — no auth key, no CORS drama,
// interp_db only, returns a JSON list of top-30 papers. GET, one call, done.
// Deploy override via `VITE_SEARCH_URL` (e.g. HTTPS mirror once available).
const SEARCH_ENDPOINT =
  (import.meta.env?.VITE_SEARCH_URL ?? '').trim() ||
  'http://mechanist.openkg.cn/search'

const CATEGORY_PALETTE = {
  mechanism_skills: {
    // Swapped with application_scenarios: mechanism now uses the blue family.
    primary: '#2563eb', soft: 'rgba(37, 99, 235, 0.14)', ring: '#1e40af',
    // Muted sage green — soft, not shouting, complements the blue big nodes.
    cite:    'rgba(101, 163, 121, 0.5)',
    related: 'rgba(101, 163, 121, 0.28)',
  },
  interpretability_objects: {
    primary: '#c59a45', soft: 'rgba(197, 154, 69, 0.16)', ring: '#9a6e21',
    cite:    'rgba(154, 110, 33, 0.46)',
    related: 'rgba(154, 110, 33, 0.24)',
  },
  application_scenarios: {
    // Swapped with mechanism_skills: application now uses the teal family.
    primary: '#0f766e', soft: 'rgba(15, 118, 110, 0.14)', ring: '#0b5f59',
    cite:    'rgba(37, 99, 235, 0.42)',
    related: 'rgba(37, 99, 235, 0.22)',
  },
}
const CATEGORY_ORDER = ['mechanism_skills', 'interpretability_objects', 'application_scenarios']
const CATEGORY_LABELS = {
  mechanism_skills: '机制方法',
  interpretability_objects: '解释性对象',
  application_scenarios: '应用场景',
}

const NODE_ROOT   = { bg: '#111827', label: '#f8fafc' }
const NODE_PAPER  = { color: '#94a3b8', hover: '#c59a45' }

// Search-result palette — a distinct blue family so the result view has its
// own visual identity, separate from the three trees and their charcoal /
// gray tree scaffolding.
const SEARCH_CENTER_COLOR = '#1e3a8a'                // blue-900 — deepest, the query
const SEARCH_PAPER_COLOR  = '#60a5fa'                // blue-400 — mid sky, the leaves
const SEARCH_EDGE_COLOR   = 'rgba(37, 99, 235, 0.6)'  // blue-600 α .6 — spokes
// Structural edges — soft gray. Root→big darker/thicker, big→leaf lighter/thinner.
const EDGE_COLOR  = 'rgba(100, 116, 139, 0.75)'
const EDGE_HL     = 'rgba(30, 41, 59, 0.9)'
const EDGE_PAPER  = 'rgba(100, 116, 139, 0.5)'

const ROOT_SIZE   = 20
const BIG_SIZE    = 14
const PAPER_MIN   = 3
const PAPER_MAX   = 8
const RANDOM_JITTER = 22          // initial x/y half-range before FA2 spread
// After FA2 relaxes the graph into a roughly circular blob, we squash it into
// a horizontal ellipse — wider than tall — for a calmer editorial silhouette.
const ELLIPSE_X = 1.35
const ELLIPSE_Y = 0.72

// Bump an rgba string's alpha channel to a target — used to darken hovered
// paper-paper edges without changing their per-tree hue.
function boostAlpha(rgba, targetAlpha) {
  const m = String(rgba ?? '').match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+)?\s*\)/)
  if (!m) return rgba
  return `rgba(${m[1]}, ${m[2]}, ${m[3]}, ${targetAlpha})`
}

// Custom label drawer — writes the node label with a soft white halo behind
// the ink so it reads cleanly over the graph, matching the copy-repo canvas
// style. Sigma's default label renderer is a plain fillText, no halo.
function drawHaloedNodeLabel(context, data, settings) {
  const label = data.label
  if (!label) return
  const fontSize = settings.labelSize
  const nodeSize = data.size ?? 6
  const font = `${settings.labelWeight} ${fontSize}px ${settings.labelFont ?? 'sans-serif'}`
  const gap = Math.max(3, fontSize * 0.25)
  const x = data.x + nodeSize + gap
  const y = data.y + fontSize / 3
  context.save()
  context.font = font
  context.textAlign = 'left'
  context.textBaseline = 'middle'
  context.lineJoin = 'round'
  context.lineWidth = Math.max(3, fontSize * 0.34)
  context.strokeStyle = 'rgba(255, 255, 255, 0.92)'
  context.fillStyle = settings.labelColor?.color ?? '#111827'
  context.strokeText(label, x, y)
  context.fillText(label, x, y)
  context.restore()
}

/* macOS reports its trackpad pinch as a wheel event with ctrlKey set, so
   binding zoom to the modifier means pinch-to-zoom works without any extra
   code — and two-finger scroll, which carries no modifier, scrolls the page. */
const ZOOM_KEY =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent)
    ? '⌘'
    : 'Ctrl'

const SETTINGS = {
  labelColor: { color: '#111827' },
  labelWeight: '600',
  labelSize: 12.5,
  labelFont: '"Inter", "Space Grotesk", -apple-system, BlinkMacSystemFont, sans-serif',
  labelDensity: 0.6,
  labelGridCellSize: 120,
  // Paper nodes size 3–8; threshold 11 sits just above the max, so at the
  // initial camera ratio NO paper labels show. Zooming in raises each node's
  // rendered size linearly (rendered = size / cameraRatio) — so at first the
  // reveal is slow (only the top-cited papers cross the threshold), then it
  // accelerates as more nodes cross it. Big nodes have forceLabel:true so
  // they ignore this threshold entirely.
  labelRenderedSizeThreshold: 11,
  defaultDrawNodeLabel: drawHaloedNodeLabel,
  defaultDrawNodeHover: drawHaloedNodeLabel,
  minCameraRatio: 0.15,
  maxCameraRatio: 4,
  defaultDrawEdgeLabels: false,
  hideEdgesOnMove: false,
  hideLabelsOnMove: false,
  renderEdgeLabels: false,
  enableEdgeEvents: false,
  autoRescale: true,
  autoCenter: true,
}

function paperNodeSize(cited) {
  const c = Number(cited) || 0
  if (c <= 0) return PAPER_MIN
  const s = PAPER_MIN + Math.min(PAPER_MAX - PAPER_MIN, Math.log10(1 + c) * 1.6)
  return Number(s.toFixed(2))
}

function truncate(s, n = 90) {
  if (!s) return ''
  return s.length > n ? `${s.slice(0, n - 1)}…` : s
}

function iconPath(name) {
  if (name === 'expand')   return 'M4 4h6M4 4v6M20 4h-6M20 4v6M4 20h6M4 20v-6M20 20h-6M20 20v-6'
  if (name === 'compress') return 'M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6'
  if (name === 'close')    return 'M6 6l12 12M18 6L6 18'
  if (name === 'search')   return 'M11 5a6 6 0 1 1 0 12 6 6 0 0 1 0-12ZM20 20l-4-4'
  if (name === 'reset')    return 'M3 12a9 9 0 1 0 3.5-7.1M3 4v6h6'
  return ''
}

function IconButton({ name, label, onClick, disabled }) {
  return (
    <button
      type="button"
      className="database-graph-iconbtn"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={iconPath(name)} />
      </svg>
    </button>
  )
}

// Cheap deterministic RNG so successive renders (Strict-Mode double mount, tab
// re-mounts) get the same initial layout instead of jumping around.
function seededRandom(seed) {
  let s = seed | 0
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

function seedFromString(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = (h * 16777619) >>> 0
  }
  return h
}

function buildGraph(tree, palette) {
  // multi: true — a paper can be linked to multiple big nodes, and (rarely) to
  // the same peer via both CITES and RELATED_TO.
  const g = new Graph({ type: 'undirected', multi: true })
  const rand = seededRandom(seedFromString(tree.id))
  const jitter = () => (rand() - 0.5) * 2 * RANDOM_JITTER
  const bigNodes = tree.big_nodes ?? []
  const bigPositions = new Map()   // big_node.id → {x, y}

  const rootId = `__root__${tree.id}`
  g.addNode(rootId, {
    label: tree.label,
    size: ROOT_SIZE,
    color: NODE_ROOT.bg,
    x: 0,
    y: 0,
    kind: 'root',
    forceLabel: true,
  })

  bigNodes.forEach((bn, i) => {
    const bigId = `big:${tree.id}:${bn.id}`
    // Wide-elliptical initial ring around the root so FA2 has a horizontal
    // starting hint (much wider than tall).
    let theta = (i / Math.max(1, bigNodes.length)) * Math.PI * 2
    // Application / Scenarios has one very long root label ("Application /
    // Scenarios") and two long big-node labels ("Fact Knowledge" and
    // "Social Computation & Communication"). Since node labels are drawn
    // rightward from the node, any big node sitting on the horizontal axis
    // right of the root collides with the root's label. Force those two
    // labels off the horizontal — one up, one down — so nothing overlaps.
    if (tree.id === 'application_scenarios') {
      if (bn.id === 'fact_knowledge') {
        theta = Math.PI * 0.55            // ~99° — upper zone, above root
      } else if (bn.id === 'social_computation_and_communication') {
        theta = -Math.PI * 0.55           // ~-99° — lower zone, below root
      }
    }
    const bx = Math.cos(theta) * RANDOM_JITTER * 0.9 * ELLIPSE_X
    const by = Math.sin(theta) * RANDOM_JITTER * 0.9 * ELLIPSE_Y
    bigPositions.set(bn.id, { x: bx, y: by })
    g.addNode(bigId, {
      label: bn.label,
      size: BIG_SIZE,
      color: palette.primary,
      x: bx,
      y: by,
      kind: 'big',
      bigNodeRef: bn,
      forceLabel: true,
    })
    g.addEdge(rootId, bigId, {
      color: EDGE_COLOR,
      size: 1.6,
      kind: 'root-big',
    })
  })

  // De-duplicated papers — one node per unique paper, with a structural edge
  // to each big node it belongs to. Initial position = centroid of parents
  // (or origin) with random jitter, so FA2 can relax it organically.
  const paperNodeIds = new Map()  // short_paper_id → graph node id
  ;(tree.papers ?? []).forEach((paper) => {
    const parents = paper.belongs_to?.length ? paper.belongs_to : []
    let px = jitter() * ELLIPSE_X
    let py = jitter() * ELLIPSE_Y
    if (parents.length) {
      let sx = 0, sy = 0, n = 0
      for (const bid of parents) {
        const pos = bigPositions.get(bid)
        if (pos) { sx += pos.x; sy += pos.y; n++ }
      }
      if (n > 0) {
        // Bigger initial spread around the parent centroid so FA2 doesn't
        // start with dozens of leaves stacked on top of each other.
        px = sx / n + jitter() * 1.3 * ELLIPSE_X
        py = sy / n + jitter() * 1.3 * ELLIPSE_Y
      }
    }
    const paperId = `paper:${tree.id}:${paper.id}`
    paperNodeIds.set(paper.id, paperId)
    g.addNode(paperId, {
      label: paper.title,
      size: paperNodeSize(paper.cited),
      color: NODE_PAPER.color,
      x: px,
      y: py,
      kind: 'paper',
      paperRef: paper,
      forceLabel: false,
    })
    for (const bid of parents) {
      const bigId = `big:${tree.id}:${bid}`
      if (!g.hasNode(bigId)) continue
      g.addEdge(bigId, paperId, {
        color: EDGE_PAPER,
        size: 1.0,
        kind: 'big-paper',
      })
    }
  })

  // Paper-paper citation network overlay — draws its own hue over the tree.
  ;(tree.paper_edges ?? []).forEach((e) => {
    const srcId = paperNodeIds.get(e.src)
    const dstId = paperNodeIds.get(e.dst)
    if (!srcId || !dstId || srcId === dstId) return
    const isCites = e.type === 'CITES'
    g.addEdge(srcId, dstId, {
      color: isCites ? palette.cite : palette.related,
      size: isCites ? 0.7 : 0.6,
      kind: isCites ? 'paper-cites' : 'paper-related',
    })
  })
  return g
}

// Tier-based sizing for search-result papers — highest rank draws largest,
// so the visual hierarchy tracks relevance. Also pushes top-5 above the
// label threshold so their titles are always visible without zooming.
function searchPaperSizeByRank(rank) {
  if (rank <= 3)   return 14  // top-3 — largest, labels always visible
  if (rank <= 7)   return 11  // top-4-7 — big, labels visible at default zoom
  if (rank <= 14)  return 8   // mid — labels hidden by default, revealed on zoom
  return 5.5                   // tail — small, only on zoom or hover
}

// Turn an openalex URL (or plain W-id) into the short `Wxxxx` form used for
// local paper JSON files. Mirrors the build script's short_paper_id().
function shortPaperId(openalexId) {
  if (!openalexId) return null
  const s = String(openalexId)
  if (s.startsWith('https://openalex.org/')) return s.split('/').pop()
  if (s.startsWith('W')) return s
  return null
}

/**
 * Search-result graph — the query is a deep-blue node at the centre; result
 * papers scatter organically around it. Position is polar (angle + radius)
 * with:
 *   angle  → random per node (no spiral / no ring artefact)
 *   radius → grows with sqrt(rank) so top hits sit closer, but each layer
 *            gets a wide random band so nothing lands on a clean ring
 * The result reads as a loose blue constellation, not a geometric pattern,
 * while still encoding relevance in "how close to the centre" the node is.
 */
function buildSearchGraph(query, papers /*, palette */) {
  const g = new Graph({ type: 'undirected', multi: false })
  const rand = seededRandom(seedFromString(`search:${query}`))
  const rand1 = () => rand() * 2 - 1

  const centerId = `__search__center__`
  g.addNode(centerId, {
    // The center node reads as the query itself — clip long queries.
    label: query.length > 64 ? `${query.slice(0, 61)}…` : query,
    size: ROOT_SIZE + 8,   // noticeably larger than a tree root
    color: SEARCH_CENTER_COLOR,
    x: 0,
    y: 0,
    kind: 'root',
    forceLabel: true,
    highlighted: true,      // gives it Sigma's built-in halo ring
    fullQuery: query,
  })

  // Layout knobs — tune these three to change "how scattered".
  const RADIAL_BASE   = 32    // minimum distance from centre for rank 1
  const RADIAL_SCALE  = 20    // sqrt(rank) coefficient
  const RADIAL_NOISE  = 26    // per-node radial jitter — bigger = more chaos
  const KEEP_OUT      = 26    // hard minimum around the centre node

  papers.forEach((paper, i) => {
    const rank = i + 1
    // Wang's endpoint calls the field `paper_id`; older mechanic-db payloads
    // called it `openalex_id`. Take whichever is present.
    const openalexId = paper.openalex_id ?? paper.paper_id ?? null
    const short = shortPaperId(openalexId) ?? `hit_${i}`
    // Extracted key findings are sometimes a newline-joined string on the
    // wire; normalise to an array so the detail card just renders them.
    let keyFindings = paper.key_findings
    if (typeof keyFindings === 'string') {
      keyFindings = keyFindings.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
    } else if (!Array.isArray(keyFindings)) {
      keyFindings = []
    }
    const paperId = `paper:search:${short}:${i}`

    // Fully random angle — the spiral used to make the result look like a
    // sunflower diagram; a plain random angle makes it read as a loose
    // cluster instead.
    const angle = rand() * Math.PI * 2
    // Radius growth: sqrt(rank) puts rank 1 close and rank 30 far, but the
    // large noise term breaks the concentric-ring look the plain function
    // would produce. Noise grows a little with rank so the outer tail
    // spreads wider than the inner cluster.
    const radialNoise = RADIAL_NOISE + rank * 0.7
    const radius = Math.max(
      KEEP_OUT,
      RADIAL_BASE + RADIAL_SCALE * Math.sqrt(rank) + rand1() * radialNoise,
    )
    const px = Math.cos(angle) * radius
    const py = Math.sin(angle) * radius

    g.addNode(paperId, {
      label: paper.title || '(untitled)',
      size: searchPaperSizeByRank(rank),
      color: SEARCH_PAPER_COLOR,
      x: px,
      y: py,
      kind: 'paper',
      // Top-3 always show their label; the rest respect the global threshold
      // and reveal progressively as the user zooms in.
      forceLabel: rank <= 3,
      paperRef: {
        id: short,
        openalex_id: openalexId,
        title: paper.title,
        year: paper.year,
        cited: paper.cited_by_count ?? paper.cited ?? 0,
        venue: paper.venue ?? null,
        // Preserve the LLM-extracted fields from the cloud so we can render
        // them directly without an extra HTTP round-trip.
        research_question: paper.research_question,
        core_contribution: paper.core_contribution,
        conclusion: paper.conclusion,
        key_findings: keyFindings,
        abstract: paper.abstract ?? null,
        doi: paper.doi,
        score: paper.score,
        rank,
        _searchOrigin: true,
      },
    })
    g.addEdge(centerId, paperId, {
      color: SEARCH_EDGE_COLOR,
      size: 1.0,
      kind: 'big-paper',
    })
  })
  return g
}

/**
 * Full organic FA2 spread — scattered but tree-aware. Structural edges attract
 * strongly (leaves cluster around their big node); citation edges attract a
 * meaningful fraction so connected papers drift toward each other, avoiding
 * long crossing lines. The result is squashed into a horizontal ellipse.
 */
function spreadGraph(g) {
  g.forEachEdge((edge, attrs) => {
    let w = 1
    // Root→big keeps the star skeleton anchored at the centre.
    if (attrs.kind === 'root-big')            w = 3.2
    // Big→paper is now the DOMINANT clustering signal — each leaf drifts
    // clearly toward its big node, forming a broad "territory" per node.
    // Adjacent big nodes' territories are allowed to overlap.
    else if (attrs.kind === 'big-paper')      w = 3.0
    // Citation edges: weakened to a subtle nudge so cross-cluster pulls no
    // longer flatten the tree into a globally-random blob.
    else if (attrs.kind === 'paper-cites')    w = 0.28
    else if (attrs.kind === 'paper-related')  w = 0.16
    g.setEdgeAttribute(edge, 'weight', w)
  })
  const settings = forceAtlas2.inferSettings(g)
  forceAtlas2.assign(g, {
    iterations: 550,
    settings: {
      ...settings,
      gravity: 0.65,
      scalingRatio: 7.5,
      slowDown: 14,
      barnesHutOptimize: g.order > 100,
      barnesHutTheta: 0.6,
      linLogMode: false,
      outboundAttractionDistribution: true,
      adjustSizes: true,
      strongGravityMode: false,
      edgeWeightInfluence: 1.3,
    },
  })

  // Post-FA2: squash the roughly-circular result into a horizontal ellipse so
  // the graph reads wider than tall, matching the frame's aspect.
  g.forEachNode((node, attrs) => {
    g.setNodeAttribute(node, 'x', (attrs.x ?? 0) * ELLIPSE_X)
    g.setNodeAttribute(node, 'y', (attrs.y ?? 0) * ELLIPSE_Y)
  })

  // FA2's `adjustSizes: true` already handles size-aware repulsion so
  // residual overlaps are minor. We used to run a follow-up noverlap pass
  // here, but graphology-layout-noverlap is not in this build's deps and
  // adding it would touch package.json — the ellipse squash above is the
  // last layout step now.
}

export default function DatabaseGraph({
  manifest,
  activeCategoryId,
  onSelectCategory,
  onOpenHistory,
  isFullscreen,
  onToggleFullscreen,
  dataRoot,
}) {
  const containerRef = useRef(null)
  const stageRef = useRef(null)
  const hintTimerRef = useRef(0)
  const sigmaRef = useRef(null)
  const graphRef = useRef(null)
  const workerRef = useRef(null)
  const dragStateRef = useRef({ node: null, moved: false })
  // Ref-based access to the latest values so the sigma-rebuild effect can
  // depend ONLY on `tree`, avoiding a partial-state rebuild while the fetch
  // for the newly-selected tab is still in flight.
  const onOpenHistoryRef = useRef(onOpenHistory)
  const hoveredIdRef = useRef(null)
  const selectedPaperRef = useRef(null)

  const [zoomHint, setZoomHint] = useState(false)

  const [tree, setTree] = useState(null)
  const [treeError, setTreeError] = useState(null)
  const [isLoadingTree, setIsLoadingTree] = useState(false)
  const [selectedPaper, setSelectedPaper] = useState(null)
  const [paperDetail, setPaperDetail] = useState(null)
  const [paperDetailLoading, setPaperDetailLoading] = useState(false)
  const [hoveredNodeId, setHoveredNodeId] = useState(null)
  const [searchInput, setSearchInput] = useState('')
  // Cloud search state machine — one synchronous HTTP GET, no job polling.
  //   phase:  'idle'    → user hasn't submitted yet, or backed out
  //           'loading' → GET in flight
  //           'ready'   → papers[] in hand, graph switched to search mode
  //           'error'   → the request failed or returned nothing
  const [searchState, setSearchState] = useState({ phase: 'idle' })
  const [elapsedMs, setElapsedMs] = useState(0)

  const activeCategory = useMemo(
    () => manifest.categories.find((c) => c.id === activeCategoryId) ?? null,
    [manifest, activeCategoryId],
  )
  const palette = CATEGORY_PALETTE[activeCategoryId] ?? CATEGORY_PALETTE.mechanism_skills

  useEffect(() => { onOpenHistoryRef.current = onOpenHistory }, [onOpenHistory])
  useEffect(() => { hoveredIdRef.current = hoveredNodeId }, [hoveredNodeId])
  useEffect(() => { selectedPaperRef.current = selectedPaper }, [selectedPaper])

  // Wall clock during the request so the progress overlay shows elapsed time.
  useEffect(() => {
    if (searchState.phase !== 'loading') {
      setElapsedMs(0)
      return
    }
    const started = searchState.startedAt ?? Date.now()
    setElapsedMs(Date.now() - started)
    const id = window.setInterval(() => setElapsedMs(Date.now() - started), 500)
    return () => window.clearInterval(id)
  }, [searchState.phase, searchState.startedAt])

  const submitSearch = useCallback(async () => {
    const q = searchInput.trim()
    if (!q) return
    setSearchState({ phase: 'loading', query: q, startedAt: Date.now() })
    setSelectedPaper(null)
    setPaperDetail(null)
    try {
      const url = `${SEARCH_ENDPOINT}?query=${encodeURIComponent(q)}`
      const r = await fetch(url, { headers: { Accept: 'application/json' } })
      if (!r.ok) {
        const text = await r.text().catch(() => '')
        setSearchState({
          phase: 'error',
          query: q,
          errorMessage: text || `云端检索拒绝了该查询（HTTP ${r.status}）。`,
        })
        return
      }
      // Wang's endpoint returns a JSON list of papers. Some cloud variants
      // wrap it as {papers: [...]} or {result: {papers: [...]}} — accept
      // either shape so future backend tweaks don't break the UI.
      const data = await r.json().catch(() => null)
      let papers = null
      if (Array.isArray(data)) papers = data
      else if (Array.isArray(data?.papers)) papers = data.papers
      else if (Array.isArray(data?.result?.papers)) papers = data.result.papers
      if (!papers || papers.length === 0) {
        setSearchState({
          phase: 'error',
          query: q,
          errorMessage:
            '云端检索没有返回论文，请尝试更宽泛的关键词。',
        })
        return
      }
      setSearchState({
        phase: 'ready',
        query: q,
        papers: papers.slice(0, 30),
        source: data?.source || data?.result?.source || null,
      })
    } catch (err) {
      setSearchState({
        phase: 'error',
        query: q,
          errorMessage: err instanceof Error ? err.message : '网络请求失败。',
      })
    }
  }, [searchInput])

  const clearSearch = useCallback(() => {
    setSearchState({ phase: 'idle' })
    setSelectedPaper(null)
    setPaperDetail(null)
  }, [])

  // Fetch the tree JSON when active category changes.
  useEffect(() => {
    if (!activeCategory) return
    let cancelled = false
    setIsLoadingTree(true)
    setTreeError(null)
    setSelectedPaper(null)
    setPaperDetail(null)
    fetch(`${dataRoot}${activeCategory.tree_path}`)
      .then((r) => {
        if (!r.ok) throw new Error(`tree HTTP ${r.status}`)
        return r.json()
      })
      .then((data) => {
        if (cancelled) return
        setTree(data)
      })
      .catch((err) => {
        if (!cancelled) setTreeError(err)
      })
      .finally(() => {
        if (!cancelled) setIsLoadingTree(false)
      })
    return () => {
      cancelled = true
    }
  }, [activeCategory, dataRoot])

  // The graph shown by Sigma is either the currently-loaded tree OR a search
  // result. `isSearchMode` derives from the state machine — when a search is
  // 'ready', we swap the canvas to a query-centered star.
  const isSearchMode = searchState.phase === 'ready' && Array.isArray(searchState.papers)

  // Build Sigma whenever the data source changes. Depends on `tree` in tree
  // mode, or on the search result in search mode. Palette and category come
  // from the data itself so we never rebuild before the payload has arrived.
  useEffect(() => {
    if (!containerRef.current) return
    if (!isSearchMode && !tree) return

    // Tear down previous Sigma / worker if any.
    if (workerRef.current) {
      try { workerRef.current.stop() } catch { /* noop */ }
      try { workerRef.current.kill?.() } catch { /* noop */ }
      workerRef.current = null
    }
    if (sigmaRef.current) {
      try { sigmaRef.current.kill() } catch { /* noop */ }
      sigmaRef.current = null
    }

    const treePalette = CATEGORY_PALETTE[tree?.id] ?? CATEGORY_PALETTE.mechanism_skills
    const treeCategory = tree ? manifest.categories.find((c) => c.id === tree.id) ?? null : null

    let sigma = null
    let graph = null
    let mouse = null
    const mouseHandlers = {}   // stored so we can .off(event, handler) precisely

    try {
      if (isSearchMode) {
        // Search-result graph: Fermat spiral positions are already final;
        // skip FA2 + horizontal-ellipse squash to keep the compact circular
        // composition intact.
        graph = buildSearchGraph(searchState.query, searchState.papers, treePalette)
      } else {
        graph = buildGraph(tree, treePalette)
        spreadGraph(graph)
      }
      graphRef.current = graph

      sigma = new Sigma(graph, containerRef.current, {
        ...SETTINGS,
        nodeReducer: (nodeId, attrs) => {
          const hovered = hoveredIdRef.current
          const selected = selectedPaperRef.current
          const isHover = hovered === nodeId
          const isSelected = selected && attrs.paperRef && selected.id === attrs.paperRef.id
          const highlight = attrs.kind === 'paper' && (isHover || isSelected)
          return {
            ...attrs,
            color: highlight ? NODE_PAPER.hover : attrs.color,
            zIndex: highlight ? 5 : attrs.kind === 'root' ? 3 : attrs.kind === 'big' ? 2 : 1,
          }
        },
        edgeReducer: (edgeId, attrs) => {
          const hovered = hoveredIdRef.current
          if (!hovered) return attrs
          try {
            const [src, dst] = graph.extremities(edgeId)
            if (src !== hovered && dst !== hovered) return attrs
            const isPaperEdge = attrs.kind === 'paper-cites' || attrs.kind === 'paper-related'
            if (isPaperEdge) {
              // Paper-paper edges: bolded but visibly LESS than a structural
              // link, and the base tint is bumped in alpha so the citation
              // neighbourhood actually reads on hover.
              return {
                ...attrs,
                color: boostAlpha(attrs.color, 0.88),
                size: attrs.size * 2.0,
              }
            }
            // Structural big-node link: dark slate + strongest bold, so it
            // clearly dominates the visual hierarchy on hover.
            return {
              ...attrs,
              color: EDGE_HL,
              size: attrs.size * 2.6,
            }
          } catch {
            return attrs
          }
        },
      })
      sigmaRef.current = sigma
    } catch (err) {
      console.error('[DatabaseGraph] failed to build Sigma:', err)
      if (sigma) { try { sigma.kill() } catch { /* noop */ } }
      sigmaRef.current = null
      return () => {}
    }

    // ── Node dragging ──
    mouse = sigma.getMouseCaptor()

    sigma.on('downNode', ({ node }) => {
      dragStateRef.current = { node, moved: false }
      try { graph.setNodeAttribute(node, 'highlighted', true) } catch { /* noop */ }
    })

    mouseHandlers.mousemovebody = (e) => {
      const drag = dragStateRef.current
      if (!drag.node || !sigmaRef.current) return
      try {
        const pos = sigma.viewportToGraph(e)
        graph.setNodeAttribute(drag.node, 'x', pos.x)
        graph.setNodeAttribute(drag.node, 'y', pos.y)
        drag.moved = true
        e.preventSigmaDefault()
        e.original.preventDefault()
        e.original.stopPropagation()
      } catch { /* graph might have been torn down mid-drag */ }
    }

    mouseHandlers.mouseup = () => {
      const drag = dragStateRef.current
      if (drag.node) {
        try { graph.removeNodeAttribute(drag.node, 'highlighted') } catch { /* noop */ }
      }
      window.setTimeout(() => {
        dragStateRef.current = { node: null, moved: false }
      }, 0)
    }
    mouseHandlers.mouseleave = mouseHandlers.mouseup

    mouse.on('mousemovebody', mouseHandlers.mousemovebody)
    mouse.on('mouseup',       mouseHandlers.mouseup)
    mouse.on('mouseleave',    mouseHandlers.mouseleave)

    sigma.on('clickNode', ({ node }) => {
      const drag = dragStateRef.current
      if (drag.moved) return
      try {
        const attrs = graph.getNodeAttributes(node)
        if (attrs.kind === 'big') {
          onOpenHistoryRef.current?.(treeCategory, attrs.bigNodeRef)
          return
        }
        if (attrs.kind === 'paper') {
          setSelectedPaper(attrs.paperRef)
        } else {
          setSelectedPaper(null)
        }
      } catch { /* stale click after teardown */ }
    })
    sigma.on('enterNode', ({ node }) => setHoveredNodeId(node))
    sigma.on('leaveNode', () => setHoveredNodeId(null))
    sigma.on('clickStage', () => setSelectedPaper(null))

    const centreId = window.requestAnimationFrame(() => {
      try {
        if (sigmaRef.current === sigma) {
          sigma.getCamera().animatedReset({ duration: 220 })
        }
      } catch { /* noop */ }
    })

    return () => {
      window.cancelAnimationFrame(centreId)
      try { mouse.off('mousemovebody', mouseHandlers.mousemovebody) } catch { /* noop */ }
      try { mouse.off('mouseup',       mouseHandlers.mouseup)       } catch { /* noop */ }
      try { mouse.off('mouseleave',    mouseHandlers.mouseleave)    } catch { /* noop */ }
      try { sigma.kill() } catch { /* noop */ }
      if (sigmaRef.current === sigma) sigmaRef.current = null
    }
  }, [tree, manifest, isSearchMode, searchState.query, searchState.papers])

  useEffect(() => {
    sigmaRef.current?.refresh()
  }, [hoveredNodeId, selectedPaper])

  /* Wheel over the canvas scrolls the page; wheel with a modifier zooms.
   *
   * Sigma binds its own `wheel` listener on the graph container, in the bubble
   * phase. This one is on the container's parent in the CAPTURE phase, so it
   * always runs first, and a plain wheel is stopped there — Sigma never sees
   * it, never calls preventDefault, and the page scrolls the way it does over
   * any other part of the page. Sigma's own handler is left in place for the
   * modifier case rather than reimplemented: its zoom is anchored on the
   * cursor and respects minCameraRatio / maxCameraRatio, and a hand-rolled
   * version would have to get both of those right again.
   *
   * The listener is passive. Nothing here calls preventDefault — stopping
   * propagation is all it does, and that is allowed in a passive listener.
   *
   * Full screen is exempt: there is no page behind it to scroll, so the plain
   * wheel should do the useful thing instead of nothing.
   */
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return undefined

    function onWheel(event) {
      if (isFullscreen || event.ctrlKey || event.metaKey) return
      event.stopPropagation()
      setZoomHint(true)
      window.clearTimeout(hintTimerRef.current)
      hintTimerRef.current = window.setTimeout(() => setZoomHint(false), 1500)
    }

    stage.addEventListener('wheel', onWheel, { capture: true, passive: true })
    return () => {
      stage.removeEventListener('wheel', onWheel, { capture: true })
      window.clearTimeout(hintTimerRef.current)
    }
  }, [isFullscreen])

  // The hint is about a restriction that does not apply in full screen.
  useEffect(() => {
    if (isFullscreen) setZoomHint(false)
  }, [isFullscreen])

  // Refit on fullscreen toggle so the camera lands correctly in the new frame.
  useEffect(() => {
    if (!sigmaRef.current) return
    const id = window.setTimeout(() => {
      sigmaRef.current?.refresh()
      sigmaRef.current?.getCamera()?.animatedReset?.({ duration: 260 })
    }, 320)
    return () => window.clearTimeout(id)
  }, [isFullscreen])

  // Lazy-load full paper detail when a paper is selected.
  useEffect(() => {
    if (!selectedPaper) {
      setPaperDetail(null)
      return
    }
    let cancelled = false
    setPaperDetailLoading(true)
    setPaperDetail(null)
    // Fallback record synthesised from the search payload — used when the
    // paper isn't in our local 194-record cache (very common for search hits
    // outside the curated trees).
    const searchFallback = selectedPaper._searchOrigin
      ? {
          id: selectedPaper.id,
          openalex_id: selectedPaper.openalex_id,
          title: selectedPaper.title,
          year: selectedPaper.year,
          cited: selectedPaper.cited,
          venue: selectedPaper.venue,
          research_question: selectedPaper.research_question,
          core_contribution: selectedPaper.core_contribution,
          conclusion: selectedPaper.conclusion,
          key_findings: selectedPaper.key_findings ?? [],
          abstract: selectedPaper.abstract ?? null,
          doi: selectedPaper.doi,
          authors: [],
        }
      : null
    fetch(`${dataRoot}papers/${selectedPaper.id}.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`paper HTTP ${r.status}`)
        return r.json()
      })
      .then((data) => {
        if (!cancelled) setPaperDetail(data)
      })
      .catch(() => {
        if (!cancelled) setPaperDetail(searchFallback)
      })
      .finally(() => {
        if (!cancelled) setPaperDetailLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedPaper, dataRoot])

  const treeSize = useMemo(() => {
    if (!tree) return { big: 0, papers: 0, citeEdges: 0, relEdges: 0 }
    const big = tree.big_nodes.length
    // Prefer the new de-duplicated `tree.papers`; fall back to per-big-node
    // embedded lists for compatibility with older data files.
    const papers = Array.isArray(tree.papers)
      ? tree.papers.length
      : tree.big_nodes.reduce((a, n) => a + (n.papers?.length ?? 0), 0)
    const paperEdges = tree.paper_edges ?? []
    const citeEdges = paperEdges.filter((e) => e.type === 'CITES').length
    const relEdges  = paperEdges.filter((e) => e.type === 'RELATED_TO').length
    return { big, papers, citeEdges, relEdges }
  }, [tree])

  const handleResetView = useCallback(() => {
    sigmaRef.current?.getCamera()?.animatedReset?.({ duration: 260 })
  }, [])

  return (
    <div className="database-graph">
      <div className="database-graph__tabs" role="tablist" aria-label="知识图谱视图">
        {CATEGORY_ORDER.map((catId) => {
          const cat = manifest.categories.find((c) => c.id === catId)
          if (!cat) return null
          const active = catId === activeCategoryId
          const cp = CATEGORY_PALETTE[catId]
          return (
            <button
              key={catId}
              type="button"
              role="tab"
              aria-selected={active}
              className={`database-graph__tab${active ? ' is-active' : ''}`}
              onClick={() => {
                // Switching tabs always leaves search mode — the user is
                // asking to see a curated tree, not the query result.
                if (searchState.phase !== 'idle') clearSearch()
                onSelectCategory(catId)
              }}
              style={active ? { '--tab-color': cp.primary, '--tab-soft': cp.soft } : undefined}
            >
              <span className="database-graph__tab-dot" style={{ backgroundColor: cp.primary }} />
              <span>{CATEGORY_LABELS[catId] ?? cat.label}</span>
            </button>
          )
        })}
      </div>

      <div className="database-graph__stage" ref={stageRef}>
        <div
          ref={containerRef}
          className="database-graph__canvas"
          aria-label="可交互知识图谱"
        />

        {/* Told, not guessed at: a canvas that declines to zoom looks broken
            unless it says why. Announced politely so a screen reader is not
            interrupted by something it cannot act on. */}
        <div
          className="database-graph__zoomhint"
          data-shown={zoomHint ? 'true' : 'false'}
          role="status"
          aria-live="polite"
        >
          按住 {ZOOM_KEY} 缩放，或打开全屏
        </div>

        {isLoadingTree && (
          <div className="database-graph__overlay">
            <span className="database-loading-spinner" aria-hidden="true" />
            <span>正在加载 {activeCategory?.label} 图谱…</span>
          </div>
        )}

        {treeError && (
          <div className="database-graph__overlay database-graph__overlay--error">
            <strong>该分类树加载失败。</strong>
            <p>请刷新页面后重试。</p>
          </div>
        )}

        {/* Top-left: search card — GET Wang's public /search endpoint
            directly from the browser (no auth key, no proxy). */}
        <div
          className={`database-graph__searchcard${isSearchMode ? ' is-result' : ''}`}
          aria-label="搜索知识图谱"
        >
          <div className="database-graph__searchcard-head">
            <span className="database-graph__searchcard-kicker">搜索</span>
            {isSearchMode ? (
              <>
                <strong>搜索结果图谱</strong>
                <small>
                  “{searchState.query}”的前 {searchState.papers.length} 篇论文
                </small>
              </>
            ) : (
              <>
                <strong>查询知识图谱</strong>
                <small>对 13.9k 篇解释性论文进行语义检索</small>
              </>
            )}
          </div>
          <form
            className="database-graph__searchcard-body"
            onSubmit={(e) => { e.preventDefault(); submitSearch() }}
          >
            <label className="sr-only" htmlFor="database-graph-search">
              搜索论文
            </label>
            <input
              id="database-graph-search"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="例如：催化剂设计、反应条件优化…"
              className="database-graph__searchinput"
              disabled={searchState.phase === 'loading'}
            />
            <button
              type="submit"
              className="database-graph__searchbutton"
              disabled={!searchInput.trim() || searchState.phase === 'loading'}
              title="提交到云端检索服务"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={iconPath('search')} />
              </svg>
            </button>
          </form>
          {isSearchMode && (
            <button
              type="button"
              className="database-graph__searchcard-back"
              onClick={clearSearch}
            >
              ← 返回分类树
            </button>
          )}
        </div>

        {/* Progress overlay while the GET is in flight */}
        {searchState.phase === 'loading' && (
          <div className="database-graph__search-progress" role="status">
            <span className="database-loading-spinner" aria-hidden="true" />
            <div className="database-graph__search-progress-body">
              <strong>正在进行语义检索…</strong>
              <p>
                查询：<em>{searchState.query}</em>
              </p>
              <small>
                已用时 {Math.floor(elapsedMs / 60000)} 分 {Math.floor((elapsedMs % 60000) / 1000)} 秒
                云端正在运行多路排序融合，复杂问题可能需要几分钟。
              </small>
              <button
                type="button"
                className="database-graph__search-progress-cancel"
                onClick={clearSearch}
              >
                取消并返回
              </button>
            </div>
          </div>
        )}

        {/* Error overlay — friendly message + retry */}
        {searchState.phase === 'error' && (
          <div className="database-graph__search-progress database-graph__search-progress--error" role="alert">
            <div className="database-graph__search-progress-body">
                <strong>搜索失败</strong>
              <p>{searchState.errorMessage || '未知错误。'}</p>
              <button
                type="button"
                className="database-graph__search-progress-cancel"
                onClick={clearSearch}
              >
                关闭
              </button>
            </div>
          </div>
        )}

        {/* Top-right: legend + reset + fullscreen toggle */}
        <div className="database-graph__toolbar">
          <div className="database-graph__legend" aria-label="图例">
            <span className="database-graph__legend-item">
              <i style={{ backgroundColor: NODE_ROOT.bg }} />{isSearchMode ? '查询' : '根节点'}
            </span>
            {!isSearchMode && (
              <span className="database-graph__legend-item">
                <i style={{ backgroundColor: palette.primary }} />分类节点
              </span>
            )}
            <span className="database-graph__legend-item">
              <i style={{ backgroundColor: NODE_PAPER.color }} />论文
            </span>
            {!isSearchMode && (
              <>
                <span className="database-graph__legend-item">
                  <i className="database-graph__legend-line" style={{ backgroundColor: palette.cite }} />
                  引用
                </span>
                <span className="database-graph__legend-item">
                  <i className="database-graph__legend-line" style={{ backgroundColor: palette.related }} />
                  相关
                </span>
              </>
            )}
          </div>
          <IconButton name="reset" label="重置视图" onClick={handleResetView} />
          <IconButton
            name={isFullscreen ? 'compress' : 'expand'}
            label={isFullscreen ? '退出全屏（Esc）' : '全屏'}
            onClick={onToggleFullscreen}
          />
        </div>

        {/* Bottom-left: stats chip */}
        {isSearchMode ? (
          <div className="database-graph__stats" aria-label="搜索结果统计">
            <span>{searchState.papers.length}<em>结果</em></span>
            {searchState.source && <span>{searchState.source}<em>来源</em></span>}
            <span>云端检索</span>
          </div>
        ) : tree && activeCategory && (
          <div className="database-graph__stats" aria-label="当前分类树统计">
            <span>{treeSize.big}<em>分类节点</em></span>
            <span>{treeSize.papers}<em>论文</em></span>
            <span>{treeSize.citeEdges + treeSize.relEdges}<em>关系</em></span>
            <span>{(activeCategory.label || '').split(' ').slice(0, 2).join(' ')}</span>
          </div>
        )}

        {/* Bottom-right: paper detail card */}
        {selectedPaper && (
          <div className="database-paper-card" role="dialog" aria-label="选中的论文">
            <button
              type="button"
              className="database-paper-card__close"
              onClick={() => setSelectedPaper(null)}
              aria-label="关闭论文详情"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={iconPath('close')} />
              </svg>
            </button>
            <span className="database-paper-card__kicker">论文</span>
            <h3 className="database-paper-card__title">{selectedPaper.title}</h3>
            <div className="database-paper-card__meta">
              <span>{selectedPaper.year ?? 'n/a'}</span>
              <span>·</span>
              <span>{selectedPaper.cited ?? 0} 次引用</span>
              {selectedPaper.venue && (
                <>
                  <span>·</span>
                  <span>{selectedPaper.venue}</span>
                </>
              )}
            </div>
            {paperDetailLoading && (
              <p className="database-paper-card__loading">
                <span className="database-loading-spinner" aria-hidden="true" />
                正在加载详情…
              </p>
            )}
            {paperDetail && (
              <>
                {paperDetail.authors?.length > 0 && (
                  <p className="database-paper-card__authors">
                    {paperDetail.authors.slice(0, 6).join(', ')}
                    {paperDetail.authors.length > 6 ? ' …' : ''}
                  </p>
                )}
                {paperDetail.research_question && (
                  <div className="database-paper-card__block">
                    <span>研究问题</span>
                    <p>{truncate(paperDetail.research_question, 260)}</p>
                  </div>
                )}
                {paperDetail.core_contribution && (
                  <div className="database-paper-card__block">
                    <span>核心贡献</span>
                    <p>{truncate(paperDetail.core_contribution, 260)}</p>
                  </div>
                )}
                {paperDetail.key_findings?.length > 0 && (
                  <div className="database-paper-card__block">
                    <span>关键发现</span>
                    <ul>
                      {paperDetail.key_findings.slice(0, 3).map((kf, idx) => (
                        <li key={idx}>{truncate(kf, 180)}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {paperDetail.openalex_id && (
                  <a
                    className="database-paper-card__link"
                    href={paperDetail.openalex_id}
                    target="_blank"
                    rel="noreferrer"
                  >
                    在 OpenAlex 查看 ↗
                  </a>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
