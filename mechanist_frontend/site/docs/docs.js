/* Runtime behaviour for the documentation page.
 *
 * Deliberately small. The hero, the sidebar and the body are already in the
 * page as finished HTML — vite-plugin-docs.js renders them from
 * docs/content/docs.{en,zh}.md at build time, and lang-swap.js (inlined,
 * runs before first paint) has already honoured ?lang=zh. So there is no fetch
 * here, no Markdown parser in the bundle, and nothing this file does stands
 * between the reader and the first pixel.
 *
 * What is left: the language buttons, the scroll-spy, and the copy buttons.
 *
 * It imports no CSS on purpose — index.html links the stylesheet directly so
 * that styling never waits on this module.
 *
 * To change the documentation's *content*, edit the two Markdown files. The
 * authoring contract is documented at the top of render.js.
 */

/* Scrollspy. Rebuilt after each language swap, because the sidebar links and
 * the sections are replaced wholesale. */
let observer = null
function wireScrollspy() {
  if (observer) observer.disconnect()
  if (!('IntersectionObserver' in window)) return
  const links = Array.from(document.querySelectorAll(".side a[href^='#']"))
  const map = Object.fromEntries(links.map((a) => [a.getAttribute('href').slice(1), a]))
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return
        links.forEach((a) => a.classList.remove('active'))
        map[en.target.id]?.classList.add('active')
      })
    },
    { rootMargin: '-40% 0px -55% 0px' },
  )
  document.querySelectorAll('main section[id]').forEach((s) => observer.observe(s))
}

function markActiveButton(lang) {
  document.querySelectorAll('[data-set-lang]').forEach((b) => {
    b.classList.toggle('active', b.dataset.setLang === lang)
  })
}

function setLang(lang) {
  const current = document.body.classList.contains('lang-zh') ? 'zh' : 'en'
  if (lang !== current) {
    // Defined by the inlined lang-swap.js: it exchanges the live content with
    // the inert <template> holding the other language. No fetch, no parse.
    window.__docsSwapLang?.()
    wireScrollspy()
  }
  markActiveButton(lang)

  try {
    const u = new URL(location.href)
    if (lang === 'zh') u.searchParams.set('lang', 'zh')
    else u.searchParams.delete('lang')
    history.replaceState(null, '', u.pathname + (u.search || '') + u.hash)
  } catch {
    /* history is best-effort */
  }

  // Replacing the slots' innerHTML destroyed whatever the browser had scrolled
  // to, so put the reader back on the same section.
  if (location.hash) {
    document.getElementById(location.hash.slice(1))?.scrollIntoView()
  }
}

document.querySelectorAll('[data-set-lang]').forEach((b) => {
  b.addEventListener('click', () => setLang(b.dataset.setLang))
})

document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-copy-code]')
  if (!btn) return
  const code = btn.parentElement.querySelector('code')
  if (!navigator.clipboard || !code) return
  navigator.clipboard
    .writeText(code.innerText)
    .then(() => {
      const original = btn.textContent
      btn.textContent = 'Copied'
      setTimeout(() => {
        btn.textContent = original
      }, 1200)
    })
    .catch(() => {})
})

markActiveButton(document.body.classList.contains('lang-zh') ? 'zh' : 'en')
wireScrollspy()
