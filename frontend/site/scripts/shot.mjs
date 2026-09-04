/* Screenshot the built site.
 *
 *   npm run shot                          every route, 1440 and 390
 *   npm run shot -- /knowledge-graphs /research      just those
 *   npm run shot -- --width 1280 /
 *   npm run shot -- --full /methods        whole page, not just the fold
 *
 * Writes PNGs to site/.shots/ (gitignored). Builds first unless --no-build.
 *
 * Why this exists: there is no system browser on this machine and no root to
 * install one. Playwright's Chromium was already in ~/.cache/ms-playwright but
 * would not start — six X/ATK libraries are absent from the image. They are
 * unpacked, without root, into ~/.local/chrome-deps (see DEPS_LIB below), and
 * pointing LD_LIBRARY_PATH at them here rather than in a shell profile means
 * `npm run shot` works from a bare shell with nothing sourced.
 */

import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import { homedir } from 'node:os'
import path from 'node:path'
import process from 'node:process'

const DEPS_LIB = path.join(homedir(), '.local/chrome-deps/root/usr/lib/x86_64-linux-gnu')
process.env.LD_LIBRARY_PATH = process.env.LD_LIBRARY_PATH
  ? `${DEPS_LIB}:${process.env.LD_LIBRARY_PATH}`
  : DEPS_LIB

const { chromium } = await import('playwright')

const ROUTES = ['/', '/research', '/knowledge-graphs', '/methods', '/quick-start', '/research/belief-mechanism']
const PORT = 4183
const OUT = new URL('../.shots/', import.meta.url).pathname

const argv = process.argv.slice(2)
const flag = (name) => argv.includes(name)
const value = (name, fallback) => {
  const i = argv.indexOf(name)
  return i === -1 ? fallback : argv[i + 1]
}

const full = flag('--full')
const build = !flag('--no-build')
const widths = argv.includes('--width')
  ? [Number(value('--width'))]
  : [1440, 390]
const routes = argv.filter((a) => a.startsWith('/'))
const targets = routes.length ? routes : ROUTES

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', ...opts })
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))))
  })
}

/* vite preview serves dist/ at the same base the build used, so a screenshot
   exercises the real bundle — hashed asset URLs, code-split chunks and all —
   rather than the dev server's module graph. */
async function serve() {
  const child = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    cwd: new URL('..', import.meta.url).pathname,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('preview did not start in 30s')), 30_000)
    const onData = (buf) => {
      if (String(buf).includes(`:${PORT}`)) {
        clearTimeout(timer)
        resolve()
      }
    }
    child.stdout.on('data', onData)
    child.stderr.on('data', onData)
    child.on('exit', (code) => reject(new Error(`preview exited ${code}`)))
  })
  return child
}

if (build) await run('npx', ['vite', 'build'], { cwd: new URL('..', import.meta.url).pathname })

/* Not wiped between runs. Shots are named by route and width, so a re-run
   overwrites what it re-takes and leaves the rest — otherwise checking one
   page deletes the other eleven you took a minute ago. */
await mkdir(OUT, { recursive: true })

const server = await serve()
const browser = await chromium.launch({ args: ['--no-sandbox'] })

try {
  for (const width of widths) {
    const context = await browser.newContext({
      viewport: { width, height: full ? 900 : Math.round(width > 700 ? 900 : 780) },
      deviceScaleFactor: 2,
      /* Animations are held still for the shot. Every reveal in this site is
         `initial={false}` under reduce, so the page renders in its settled
         state and a screenshot is not a race against a stagger. */
      reducedMotion: 'reduce',
    })
    const page = await context.newPage()

    for (const route of targets) {
      // HashRouter: the route lives after the #, so every path is one document.
      await page.goto(`http://localhost:${PORT}/#${route}`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(400)
      const name = `${route === '/' ? 'home' : route.slice(1).replace(/\//g, '-')}@${width}${full ? '-full' : ''}.png`
      await page.screenshot({ path: path.join(OUT, name), fullPage: full })
      console.log(`  ${name}`)
    }
    await context.close()
  }
} finally {
  await browser.close()
  server.kill()
}

console.log(`\n${targets.length * widths.length} shots → site/.shots/`)
