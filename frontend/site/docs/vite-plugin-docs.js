/* Renders docs/content/docs.{en,zh}.md into the documentation page at
 * build time.
 *
 * The browser used to do this on every load, and it showed: the Markdown fetch
 * could not even start until the JS module had downloaded and run, and then
 * ~100 ms of parsing stood between the response and the first pixel. In
 * production it was worse than the dev numbers suggested — nginx has no MIME
 * type for `.md`, so it never gzipped it and shipped the full 138 KB.
 *
 * So the page ships finished HTML again, exactly as it did when it was written
 * by hand — only now the hand-written thing is Markdown. Both languages are
 * inlined: the active one live, the other parked in an inert <template> that
 * lang-swap.js exchanges. That is what the original page did too (it carried
 * both languages and toggled them with CSS), and at 335 KB it is slightly
 * smaller than the 347 KB page it replaced.
 *
 * Dev gets the same treatment through the same hook, plus a watcher, so editing
 * a .md file still just means reloading the page.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { renderDocument } from './render.js'

const LANGS = ['en', 'zh']
const MARKERS = ['hero', 'sidebar', 'main']

export default function docsMarkdown({ root }) {
  const mdPath = (lang) => resolve(root, 'docs/content/docs.' + lang + '.md')
  const swapPath = resolve(root, 'docs/lang-swap.js')

  const build = () => {
    const docs = Object.fromEntries(
      LANGS.map((lang) => [lang, renderDocument(readFileSync(mdPath(lang), 'utf8'))]),
    )
    const [live, alt] = [docs.en, docs.zh]
    const template =
      `<template id="docs-alt" data-lang="zh" data-title="${alt.title}">` +
      MARKERS.map((slot) => `<div data-slot="${slot}">${alt[slot]}</div>`).join('') +
      '</template>'
    return { live, template, bootstrap: readFileSync(swapPath, 'utf8') }
  }

  return {
    name: 'docs-markdown',

    configureServer(server) {
      LANGS.forEach((lang) => server.watcher.add(mdPath(lang)))
      server.watcher.on('change', (file) => {
        if (!file.endsWith('.md') && file !== swapPath) return
        if (file !== swapPath && !LANGS.some((l) => file === mdPath(l))) return
        server.ws.send({ type: 'full-reload', path: '*' })
      })
    },

    /* Inline the page's stylesheet.
     *
     * An external <link rel="stylesheet"> is render-blocking, so on a slow
     * connection it costs a whole extra round trip before anything is drawn —
     * measured here as FCP 424 ms against 172 ms for the hand-written page this
     * replaced, whose CSS sat in a <style> tag. For one static page with ~11 KB
     * of CSS, inlining is simply better, and it gzips with the HTML.
     *
     * It has to be the *bundled* CSS rather than the source file: the font
     * package's url() references are rewritten to fingerprinted /assets/ paths
     * during the build, and inlining the raw source would point them nowhere.
     * Dev needs none of this — Vite injects CSS through JS there, so nothing
     * blocks rendering. */
    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
        const page = Object.values(bundle).find((f) => f.fileName === 'docs/index.html')
        if (!page) return
        const link = /<link rel="stylesheet"[^>]*href="\/?([^"]+\.css)"[^>]*>/.exec(page.source)
        if (!link) return
        const asset = Object.values(bundle).find((f) => f.fileName === link[1])
        if (!asset) return
        page.source = page.source.replace(link[0], `<style>${asset.source}</style>`)
        const stillUsed = Object.values(bundle).some(
          (f) => f.fileName.endsWith('.html') && f !== page && String(f.source).includes(link[1]),
        )
        if (!stillUsed) delete bundle[asset.fileName]
      },
    },

    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        // Both entries pass through here; only the docs page wants filling.
        if (!ctx.path.endsWith('docs/index.html')) return html
        const { live, template, bootstrap } = build()
        let out = html
        for (const slot of MARKERS) {
          out = out.replace(`<!--docs:${slot}-->`, live[slot])
        }
        return out.replace(
          '<!--docs:alt-->',
          template + '\n<script>' + bootstrap + '</script>',
        )
      },
    },
  }
}
