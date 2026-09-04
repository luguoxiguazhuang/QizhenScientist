import { spawn } from 'node:child_process'
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { randomUUID } from 'node:crypto'

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

import docsMarkdown from './docs/vite-plugin-docs.js'

const IDEA_SCRIPT_ROOT = resolve(__dirname, '../../idea_generation_scripts')
const FRONTEND_ENV_FILE = resolve(__dirname, '../.env')
const IDEA_JOBS = new Map()
const STEP_ARTIFACTS = [
  'step1_seed_papers.json',
  'step2_research_graph.json',
  'step3_trend.txt',
  'step4_rss.json',
  'step5_radius_plan.json',
  'step6_inspiration_candidates.json',
  'step7_inspirations.json',
  'step8_selected_inspirations.json',
  'step9_ideas.md',
]

async function readIdeaBaseEnv() {
  try {
    return await readFile(resolve(IDEA_SCRIPT_ROOT, '.env'), 'utf8')
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
    return readFile(FRONTEND_ENV_FILE, 'utf8')
  }
}

function replaceEnvValue(source, key, value) {
  // run_idea.sh sources this file, so quote user-provided values as shell
  // literals before writing the short-lived environment file.
  const shellValue = `'${String(value).replaceAll("'", "'\\''")}'`
  const line = `${key}=${shellValue}`
  const pattern = new RegExp(`^${key}=.*$`, 'm')
  return pattern.test(source) ? source.replace(pattern, () => line) : `${source.trimEnd()}\n${line}\n`
}

async function latestRunDirectory(runsDir) {
  const entries = await readdir(runsDir, { withFileTypes: true })
  const candidates = entries.filter((entry) => entry.isDirectory()).sort((a, b) => b.name.localeCompare(a.name))
  return candidates[0] ? resolve(runsDir, candidates[0].name) : null
}

async function updateJobProgress(job, runsDir) {
  try {
    const outputDir = await latestRunDirectory(runsDir)
    if (!outputDir) return
    const files = new Set(await readdir(outputDir))
    let step = 0
    for (let index = 0; index < STEP_ARTIFACTS.length; index += 1) {
      if (!files.has(STEP_ARTIFACTS[index])) break
      step = index + 1
    }
    if (step > job.step) {
      job.step = step
      job.public = { ...job.public, step, totalSteps: 9 }
    }
  } catch {
    // The run directory is created asynchronously and removed after completion.
  }
}

function ideaGenerationApi() {
  return {
    name: 'qizhen-idea-generation-api',
    configureServer(server) {
      server.middlewares.use('/api/generate-idea', async (req, res, next) => {
        const match = req.url?.match(/^\/([^/]+)$/)
        if (req.method === 'GET' && match) {
          const job = IDEA_JOBS.get(match[1])
          if (!job) {
            res.statusCode = 404
            res.end(JSON.stringify({ error: '任务不存在或已过期' }))
            return
          }
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(job.public))
          return
        }

        if (req.method !== 'POST' || (req.url && req.url !== '/')) {
          next()
          return
        }

        try {
          const chunks = []
          for await (const chunk of req) chunks.push(chunk)
          const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
          const { baseUrl, apiKey, model = 'qwen3.8-max', category = 'Chemistry', question, description = '' } = body
          if (!baseUrl || !apiKey || !question?.trim()) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: '请提供 Qwen3.8-Max 的 API Key 和 base URL。' }))
            return
          }

          const jobId = randomUUID()
          const job = { id: jobId, status: 'starting', step: 0, public: { id: jobId, status: 'starting', step: 0, totalSteps: 9 } }
          IDEA_JOBS.set(jobId, job)
          res.statusCode = 202
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(job.public))

          const tempDir = await mkdtemp(resolve(tmpdir(), 'qizhen-idea-'))
          const inputPath = resolve(tempDir, 'input_question.json')
          const envPath = resolve(tempDir, '.env')
          const baseEnv = await readIdeaBaseEnv()
          let envText = replaceEnvValue(baseEnv, 'LLM_API_KEY', apiKey)
          envText = replaceEnvValue(envText, 'LLM_BASE_URL', baseUrl)
          envText = replaceEnvValue(envText, 'LLM_MODEL', model || 'qwen3.8-max')
          await writeFile(inputPath, JSON.stringify({ category, question: question.trim(), description }, null, 2))
          await writeFile(envPath, envText)

          job.status = 'running'
          job.public = { id: jobId, status: 'running', step: 0, totalSteps: 9 }
          // Keep each run isolated. The script writes its final Markdown into
          // RUNS_DIR; sharing the repository-level runs directory would let
          // concurrent requests pick up one another's newest output.
          const runsDir = resolve(tempDir, 'runs')
          const updateProgressFromLog = (chunk) => {
            const matches = [...chunk.toString().matchAll(/step\s*([1-9]\d?)/gi)]
            const latestStep = matches.at(-1)?.[1]
            if (latestStep) {
              job.step = Math.max(job.step, Math.min(Number(latestStep), 9))
              job.public = { ...job.public, step: job.step, totalSteps: 9 }
            }
          }
          const child = spawn('bash', ['run_idea.sh'], {
            cwd: IDEA_SCRIPT_ROOT,
            env: {
              ...process.env,
              ENV_FILE: envPath,
              INPUT_FILE: inputPath,
              IDEA_FILE: resolve(IDEA_SCRIPT_ROOT, 'idea.md'),
              RUNS_DIR: runsDir,
              FULL: 'false',
            },
          })
          let stderr = ''
          let stdout = ''
          child.stderr.on('data', (chunk) => { stderr += chunk.toString(); updateProgressFromLog(chunk) })
          child.stdout.on('data', (chunk) => { stdout += chunk.toString(); updateProgressFromLog(chunk) })
          const progressTimer = setInterval(() => updateJobProgress(job, runsDir), 2000)
          child.on('close', async (code) => {
            clearInterval(progressTimer)
            try {
              if (code !== 0) throw new Error(stderr.trim() || `生成脚本退出码 ${code}`)
              const outputDir = await latestRunDirectory(runsDir)
              if (!outputDir) throw new Error('脚本未生成输出目录')
              const result = await readFile(resolve(outputDir, 'step9_ideas.md'), 'utf8').catch(() => '')
              job.status = 'completed'
              job.step = 9
              job.public = { id: jobId, status: 'completed', step: 9, totalSteps: 9, result }
            } catch (error) {
              job.status = 'failed'
              job.public = { id: jobId, status: 'failed', error: error.message }
            } finally {
              await rm(tempDir, { recursive: true, force: true })
            }
          })
        } catch (error) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: `无法启动生成任务：${error.message}` }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const port = Number(env.VITE_PORT ?? 5173)
  // Bind address. Defaults to loopback; set VITE_HOST=0.0.0.0 to reach the dev
  // server from another machine (it is then exposed to the whole network).
  const host = env.VITE_HOST ?? '127.0.0.1'
  // The Mechanic-DB API (FastAPI, :9001). In production it sits behind the same
  // nginx vhost as this site, so the app calls it with same-origin paths; in
  // development those paths have to be proxied to wherever it is running. The
  // old target here was the site's own Express backend on :3301, which no
  // longer exists — nginx serves the static build directly now.
  const proxyTarget = env.VITE_DEV_API_PROXY_TARGET ?? 'http://127.0.0.1:9001'

  return {
    plugins: [react(), docsMarkdown({ root: __dirname }), ideaGenerationApi()],
    build: {
      /* Two entries: the React app, and the documentation page.
         The docs page is a plain static page, not part of the SPA — but it has
         to be an entry rather than a file in public/, because Vite copies
         public/ verbatim and never processes it, and docs-markdown fills this
         page in through transformIndexHtml. Its Markdown source sits alongside
         it in docs/content/ — a build input, not a served asset, so it is not
         in public/ and does not ship. */
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          docs: resolve(__dirname, 'docs/index.html'),
        },
      },
    },
    server: {
      host,
      port,
      // Fail loudly rather than silently moving to another port — but on a
      // shared machine the default 5173 is often already taken, so set
      // VITE_PORT (see .env.example) instead of letting this abort the run.
      strictPort: true,
      open: false,
      /* Mirrors the nginx location blocks in the deployment config, so what
         works in `npm run dev` is what works in production.

         Regex keys (Vite treats a leading `^` as RegExp) and anchored ends,
         because these are root-level paths on a shared origin: a plain
         '/register' prefix would match via startsWith() and could swallow a
         future page route, and '/api' alone used to be able to swallow
         '/api-token'. Every entry here is a path the FastAPI service owns —
         keep this list and deploy/nginx.mechanist.openkg.cn.conf in step. */
      proxy: Object.fromEntries(
        [
          '^/api/',        // visit counter
          '^/register$',
          '^/verify$',
          '^/quota$',
          '^/search$',
          '^/jobs/',
          '^/health$',
        ].map((pattern) => [
          pattern,
          { target: proxyTarget, changeOrigin: true, ws: true },
        ]),
      )
    },
    preview: {
      host,
      port
    }
  }
})
