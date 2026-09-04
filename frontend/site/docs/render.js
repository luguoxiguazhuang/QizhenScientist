/* Markdown -> documentation HTML. Pure string work: no DOM, no CSS imports, so
 * it runs under Node at build time. That is the whole point — the browser used
 * to do this on every page load, which cost a serial round-trip for a 138 KB
 * file plus ~100 ms of parsing before anything appeared. Now the build does it
 * once and ships finished HTML; see vite-plugin-docs.js.
 *
 * The authoring contract, in full:
 *
 *   ---                     YAML-ish front matter drives the hero block.
 *   eyebrow / title / lead / links[{text,href,primary}]
 *   ---
 *   # Group                 Sidebar group title. NOT rendered into <main>;
 *                           it exists only to bucket the sections under it.
 *   ## Section {#id | Nav}  One <section class="section" id> + one sidebar
 *                           link, labelled "Nav" if given, else by the full
 *                           heading — the rail is narrow and section titles
 *                           are long. The {#id} is explicit rather than
 *                           slugified because it has to be identical in both
 *                           languages: the language toggle keeps your place by
 *                           anchor, and a slug of Chinese text would not match
 *                           its English counterpart. It also keeps the 16
 *                           existing inbound anchors working.
 *   ### Sub {#id}           Optional id; only `keys-connectivity` needs one.
 *   first paragraph         Auto-tagged .section-lead. No markup required.
 *   > [!NOTE]               div.callout
 *   > [!WARNING]            div.callout.amber
 *   > [!SMALL]              p.small-note
 *   tables                  Auto-wrapped in div.table-scroll.
 *   ``` fences              Auto-given a copy button.
 *   <span class="badge …>   Raw HTML; these pills are English in both
 *                           languages and have no Markdown equivalent.
 */
import { marked } from 'marked'

marked.setOptions({ breaks: false, gfm: true })

/* Permissive strong emphasis.
 *
 * CommonMark will not close a `**` run that sits between a punctuation mark and
 * a letter, so `**Use case:**text` renders as literal asterisks — and every
 * Chinese bold lead-in in this document has that exact shape
 * (`**适用场景：**忠实复现`), because CJK typography puts no space after the
 * colon. That is 51 lines in docs.zh.md alone, and it is a trap an author would
 * fall into again on the next one they write.
 *
 * So the docs dialect closes `**` on the plain rule: non-space just inside each
 * delimiter. Inline extensions are tried before the built-in tokenizers, but
 * only at the lexer's current position, so a code span like `TABLE_*.tex` is
 * still tokenized as code — this pattern needs two asterisks to fire.
 */
marked.use({
  extensions: [
    {
      name: 'strong',
      level: 'inline',
      start: (src) => src.indexOf('**'),
      tokenizer(src) {
        const m = /^\*\*(?=[^\s*])([\s\S]*?[^\s*])\*\*/.exec(src)
        if (!m) return undefined
        return {
          type: 'strong',
          raw: m[0],
          text: m[1],
          tokens: this.lexer.inlineTokens(m[1]),
        }
      },
    },
  ],
})

const ALERTS = {
  '[!NOTE]': { tag: 'div', cls: 'callout' },
  '[!WARNING]': { tag: 'div', cls: 'callout amber' },
  '[!SMALL]': { tag: 'p', cls: 'small-note' },
}

const HEADING_ID = /\s*\{#([A-Za-z0-9_-]+)(?:\s*\|\s*([^}]+?))?\}\s*$/

const inline = (md) => marked.parseInline(md)

function splitFrontMatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text)
  if (!m) return { meta: {}, body: text }
  const meta = { links: [] }
  let link = null
  for (const raw of m[1].split(/\r?\n/)) {
    const item = /^\s{2}- text:\s*(.*)$/.exec(raw)
    if (item) {
      link = { text: item[1], href: '#' }
      meta.links.push(link)
      continue
    }
    const sub = /^\s{4}(\w+):\s*(.*)$/.exec(raw)
    if (sub && link) {
      link[sub[1]] = sub[1] === 'primary' ? sub[2] === 'true' : sub[2]
      continue
    }
    const kv = /^(\w+):\s*(.*)$/.exec(raw)
    if (kv && kv[2]) meta[kv[1]] = kv[2]
  }
  return { meta, body: text.slice(m[0].length) }
}

/** A blockquote token that opens with an alert marker, or null. */
function alertOf(token) {
  if (token.type !== 'blockquote') return null
  const first = token.tokens?.[0]
  const text = first?.type === 'paragraph' ? first.raw : ''
  const key = Object.keys(ALERTS).find((k) => text.trimStart().startsWith(k))
  if (!key) return null
  // Re-lex the body with the marker line removed rather than surgically
  // editing tokens: the marker is always its own line, so this is exact.
  const body = token.raw
    .split(/\r?\n/)
    .map((l) => l.replace(/^>\s?/, ''))
    .filter((l, i) => !(i === 0 && l.trimStart().startsWith(key)))
    .join('\n')
  const { tag, cls } = ALERTS[key]
  const inner = tag === 'p' ? inline(body.trim()) : marked.parse(body)
  return `<${tag} class="${cls}">${inner}</${tag}>`
}

/* Structural touches every instance wants, applied per token rather than by
   regex over finished HTML — making an author write them in Markdown would be
   busywork they could forget. */
function blockHtml(token) {
  const html = marked.parser([token])
  if (token.type === 'table') return `<div class="table-scroll">${html}</div>`
  if (token.type === 'code') {
    return html.replace(
      '<pre>',
      '<pre><button class="copy-code" type="button" data-copy-code>Copy</button>',
    )
  }
  return html
}

/** One pass over the token stream yields the sidebar and the body together,
 *  which is the point: they cannot disagree. */
export function renderDocument(markdown) {
  const { meta, body } = splitFrontMatter(markdown)
  const tokens = marked.lexer(body)

  const groups = []
  const sections = []
  let current = null
  const closeSection = () => {
    if (current) sections.push(current)
    current = null
  }

  for (const token of tokens) {
    if (token.type === 'heading' && token.depth === 1) {
      groups.push({ title: inline(token.text), links: [] })
      continue
    }
    if (token.type === 'heading' && token.depth === 2) {
      closeSection()
      const attrs = HEADING_ID.exec(token.text)
      const id = attrs?.[1] || ''
      const title = inline(token.text.replace(HEADING_ID, ''))
      current = { id, html: [`<h2>${title}</h2>`], leadDone: false }
      if (groups.length) {
        groups[groups.length - 1].links.push({ id, title: attrs?.[2] ? inline(attrs[2]) : title })
      }
      continue
    }
    if (!current) continue // stray content before the first section

    const alert = alertOf(token)
    if (alert) {
      current.html.push(alert)
      continue
    }
    if (token.type === 'heading') {
      const attrs = HEADING_ID.exec(token.text)
      const id = attrs?.[1]
      const title = inline(token.text.replace(HEADING_ID, ''))
      current.html.push(`<h${token.depth}${id ? ` id="${id}"` : ''}>${title}</h${token.depth}>`)
      continue
    }
    // The first paragraph of a section is its lead — inferred, not marked up.
    if (token.type === 'paragraph' && !current.leadDone) {
      current.leadDone = true
      current.html.push(`<p class="section-lead">${inline(token.text)}</p>`)
      continue
    }
    current.html.push(blockHtml(token))
  }
  closeSection()

  return {
    hero: heroHtml(meta),
    sidebar: sidebarHtml(groups),
    main: sections
      .map((s) => `<section class="section" id="${s.id}">${s.html.join('')}</section>`)
      .join(''),
    title: stripTags(meta.title || ''),
  }
}

const stripTags = (s) => s.replace(/<[^>]*>/g, '')

function heroHtml(meta) {
  const links = (meta.links || [])
    .map(
      (l) =>
        `<a class="button-link${l.primary ? ' primary' : ''}" href="${l.href}">${inline(l.text)}</a>`,
    )
    .join('')
  return (
    `<p class="eyebrow">${inline(meta.eyebrow || '')}</p>` +
    `<h1>${inline(meta.title || '')}</h1>` +
    `<p class="hero-copy">${inline(meta.lead || '')}</p>` +
    `<div class="hero-links">${links}</div>`
  )
}

function sidebarHtml(groups) {
  return groups
    .map(
      (g) =>
        `<strong class="side-title">${g.title}</strong>` +
        g.links.map((l) => `<a href="#${l.id}">${l.title}</a>`).join(''),
    )
    .join('')
}
