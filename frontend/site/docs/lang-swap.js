/* Language swap, inlined into the page head-to-toe by vite-plugin-docs.js.
 *
 * It lives in its own file, and is injected as a classic inline <script> rather
 * than imported by docs.js, for one reason: module scripts are deferred, so a
 * `?lang=zh` deep link would paint English first and flip a moment later. This
 * runs during parse, before the first paint.
 *
 * Both languages are already in the page — one live, the other parked in an
 * inert <template> (inert matters: two copies of `id="overview"` in the live
 * DOM would break every anchor on the page). Swapping is therefore an exchange,
 * not a load: the outgoing language goes back into the template, so calling it
 * again returns you to where you started and there is only ever one copy live.
 */
;(function () {
  var SLOTS = ['hero', 'sidebar', 'main']

  window.__docsSwapLang = function swapLang() {
    var tpl = document.getElementById('docs-alt')
    if (!tpl) return null
    for (var i = 0; i < SLOTS.length; i++) {
      var live = document.querySelector('[data-slot="' + SLOTS[i] + '"]')
      var alt = tpl.content.querySelector('[data-slot="' + SLOTS[i] + '"]')
      if (!live || !alt) continue
      var held = live.innerHTML
      live.innerHTML = alt.innerHTML
      alt.innerHTML = held
    }
    var incoming = tpl.dataset.lang
    var incomingTitle = tpl.dataset.title
    tpl.dataset.lang = document.body.classList.contains('lang-zh') ? 'zh' : 'en'
    tpl.dataset.title = document.title
    document.body.className = 'lang-' + incoming
    document.documentElement.lang = incoming === 'zh' ? 'zh-CN' : 'en'
    document.title = incomingTitle
    return incoming
  }

  // Honour ?lang=zh before anything is painted.
  try {
    if (
      new URLSearchParams(location.search).get('lang') === 'zh' &&
      !document.body.classList.contains('lang-zh')
    ) {
      window.__docsSwapLang()
    }
  } catch {
    /* a broken query string is not worth failing the page over */
  }
})()
