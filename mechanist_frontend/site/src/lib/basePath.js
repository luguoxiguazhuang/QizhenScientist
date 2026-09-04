/* Build a URL under the deployment base.
 *
 * The site is served from '/' on its own domain and from '/<repo>/' on GitHub
 * Pages, so every static reference has to go through the base. Five call sites
 * used to do it by hand:
 *
 *     `${import.meta.env.BASE_URL}mechanist-logo.png`
 *
 * which is correct only while BASE_URL ends in a slash. It stopped doing so
 * when the Pages workflow switched to passing `--base` from
 * actions/configure-pages, whose `base_path` output has no trailing slash —
 * and every one of those five produced a glued-together path like
 * `/mechanist_frontendmechanist-logo.png`, which 404s. The logo and the docs
 * page disappeared from the deployed site.
 *
 * The workflow now appends the slash, but that fix lives in a file nobody
 * reads when adding a component. This one is immune either way: it normalises
 * both sides before joining, so `withBase('docs/index.html')` is right whether
 * BASE_URL is '/', '/repo', or '/repo/'.
 */
export function withBase(path = '') {
  const base = import.meta.env.BASE_URL || '/'
  return `${base.replace(/\/+$/, '')}/${String(path).replace(/^\/+/, '')}`
}

/** The deployment root itself — '/' or '/<repo>/'. */
export const BASE_PATH = withBase('')
