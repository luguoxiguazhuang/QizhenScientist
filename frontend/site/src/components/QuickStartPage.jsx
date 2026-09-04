import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ArrowIcon from './ArrowIcon.jsx'
import CodeBlock from './CodeBlock.jsx'
import PageHeader from './PageHeader.jsx'
import './QuickStartPage.css'
import { withBase } from '../lib/basePath.js'
import { PAGE_ACCENTS } from '../content/mechanistContent.js'
// Kept: the install replay for the header rail. Hidden for now in favour of
// the shared grey HeaderMotif; restore with aside={<InstallDemo />} wideRail.
// import InstallDemo from './InstallDemo.jsx'

/* Where the registration request goes.
 *
 * The site has two deployments, and they need different answers:
 *
 *   Self-hosted on mechanist.openkg.cn — the Mechanic-DB API sits behind the
 *     same nginx vhost, so a relative '/register' is same-origin. That is the
 *     default, and it is the only configuration in which the inline form can
 *     actually work: same-origin means no preflight, which matters because
 *     the API ships no CORS middleware at all.
 *
 *   GitHub Pages — a different origin, and an HTTPS one. Set VITE_REGISTER_API
 *     to the absolute http://… URL there; the guard below then sees an http:
 *     target on an https: page — mixed content, blocked before the request is
 *     sent — and swaps the form for the equivalent curl command rather than
 *     shipping a control that is guaranteed to fail.
 *
 * The guard stays even though the self-hosted deployment is plain HTTP today
 * and so can never trip it: it costs nothing, and it is what keeps the Pages
 * build honest. It also means turning TLS on later needs no change here.
 */
const REGISTER_API = import.meta.env.VITE_REGISTER_API || '/register'

const CAN_SUBMIT_INLINE = !(
  typeof window !== 'undefined' &&
  window.location.protocol === 'https:' &&
  REGISTER_API.startsWith('http:')
)

// Absolute in the copy-paste command even when the app calls it relatively —
// a curl of '/register' means nothing in a terminal. http, not https: the
// deployment has no TLS yet, and an https URL here would just fail to connect.
const REGISTER_CURL_URL = REGISTER_API.startsWith('http')
  ? REGISTER_API
  : `http://mechanist.openkg.cn${REGISTER_API}`

const REGISTER_CURL = `curl -X POST ${REGISTER_CURL_URL} \\
  -H 'Content-Type: application/json' \\
  -d '{"email": "you@example.com"}'`
// Deployment-base aware: the site can be served from a subpath
// (e.g. GitHub Pages /<repo>/), so static links must not start with '/'.
// index.html is spelled out because the Vite dev server does not resolve a
// directory index for `docs/` and falls through to the SPA instead.
const DOCS_URL = withBase('docs/index.html')
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const CLAUDE_CODE_SNIPPET = `# Install Claude Code, restart your terminal, then verify
curl -fsSL https://claude.ai/install.sh | bash
claude --version`

const UV_SNIPPET = `# Mechanist's MCP servers use uv to bootstrap temporary Python environments
curl -LsSf https://astral.sh/uv/install.sh | sh
uv --version`

const CONDA_SNIPPET = `# Example: a dedicated conda env named scientist
conda create -n scientist python=3.11 -y
conda activate scientist
pip install -r <(curl -sSL https://raw.githubusercontent.com/zjunlp/Mechanist/main/requirements.txt)`

const REVIEW_ENV_SNIPPET = `# --- Mechanist (add to ~/.bashrc or ~/.zshrc) ---
export LLM_API_KEY="sk-..."                       # required: external review model key
export LLM_MODEL="<your_model_name>"              # optional, default: gpt-5.4
export LLM_BASE_URL="<your_base_url>"             # optional, default: official endpoint`

const REVIEW_ENV_APPLY_SNIPPET = `source ~/.bashrc            # or open a brand-new terminal
echo "$LLM_API_KEY"         # should print your key, not an empty line`

const MECHANIC_DB_SNIPPET = `export MECHANIC_DB_API_KEY="sk_..."   # paste the key shown after verification`

const PLUGIN_SNIPPET = `/plugin marketplace add zjunlp/Mechanist
/plugin install mechanist@mechanist`

/* Claude Code lists plugin skills under their fully-qualified names, so /help
   shows /mechanist:auto. Everything else on this site — and in the Mechanist
   README — writes the short form. Saying so here, at the one place the two
   spellings meet, stops it reading as a mismatch.

   /reload-plugins leads the block rather than a restart: the install summary
   only asks for a restart as a last resort (stale cache, failed reload), and
   leading with that made the common path look heavier than it is. */
const VERIFY_SNIPPET = `/reload-plugins
/mechanist        # listed as /mechanist:auto, /mechanist:msearch, /mechanist:mhistory ...
/mcp              # llm-chat and mechanic-db should both be "connected"`

const PROJECT_SNIPPET = `mkdir my-experiment && cd my-experiment   # one research question per directory`

/* What you can hand `/mguide`, in the two groups the front door itself splits
   on: a request that ends in a run, and a request that ends in an answer. The
   split is not cosmetic — only the first group writes `task.md` and starts the
   pipeline, which is exactly what the paragraph under the list says. These are
   prompts you type into the session, not files you write. Study examples
   adapted from docs (#quickstart / #run-modes); the reproduce, literature and
   history prompts are the ones in the project README.

   Note the template literals below are load-bearing whitespace: they are the
   prompt text as it renders, so they sit flush left regardless of nesting. */
const MGUIDE_GROUPS = [
  {
    id: 'runs',
    label: 'Research runs',
    hint: 'runs the full research pipeline',
    examples: [
      {
        id: 'mechanism',
        title: 'Explore a mechanism',
        blurb:
          'A known model behavior — find which internal component causes it.',
        code: `/mguide On belief-attribution questions, Llama-3.1-8B-Instruct is less
accurate on first-person framing ("I believe that P. Is P true?") than on
the matched third-person framing. Take that behavior as established and
find the layer / direction that carries the first-person framing and
causes the drop. Dataset: KaBLE.`,
      },
      {
        id: 'reproduce',
        title: 'Reproduce a paper',
        blurb:
          'Both the finding and the method are already known — re-run them faithfully at the stated scale.',
        // Expandable but closed: the screenshot above the examples already
        // shows this exact prompt, and printing it twice on one screen reads
        // as a bug.
        expandable: true,
        code: `/mguide Reproduce this paper: LLMs encode harmfulness and refusal separately`,
      },
      {
        id: 'validate',
        title: 'Validate a suspected phenomenon',
        blurb:
          'You have a concrete hypothesis, but no paper (or prior run) has confirmed it yet.',
        code: `/mguide I suspect that fine-tuning a student model on teacher-generated
data that *looks* safety-improving can still transfer unsafe behavior to
the student — subliminal learning. Design and run the check on a
chemistry-safety dataset, filtering the semantically unsafe samples out
of the training data first.`,
      },
      {
        id: 'discovery',
        title: 'Open-ended discovery',
        blurb:
          'Only a research direction — let Mechanist mine a new phenomenon, then investigate it.',
        code: `/mguide Explore the mechanics of LLM beliefs on KaBLE with
Llama-3.1-8B-Instruct. Do not assume a behavior in advance: mine a
specific new phenomenon first — something other than the well-known
first-person vs third-person asymmetry — then investigate its mechanism.`,
      },
    ],
  },
  {
    id: 'literature',
    label: 'Literature',
    hint: 'answers only — no pipeline run',
    examples: [
      {
        id: 'search',
        title: 'Find literature',
        blurb:
          'Search the 14k-paper interpretability corpus, the 157M-node citation graph, and the web.',
        expandable: true,
        code: `/mguide find me papers on sparse autoencoder feature absorption in large language models`,
      },
      {
        id: 'history',
        title: 'See how a field developed',
        blurb:
          'A timeline of the key papers, turning points, debates, and open problems.',
        expandable: true,
        code: `/mguide I'd like to know how circuit-level interpretability got to where it is today`,
      },
    ],
  },
]

const LAUNCH_SHELL = `claude --model claude-opus-4-8`

const MGUIDE_SHOT = withBase('figures/mguide-session.webp')

/* Four stages from docs (#pipeline / #artifacts). Each artifact gets its
   own path + one-line "what's inside" — drawn from the docs artifact map. */
const PIPELINE_STAGES = [
  {
    id: 'claim',
    title: 'claim',
    artifacts: [
      {
        path: 'idea-stage/IDEA_REPORT.md',
        desc: 'Ranked candidate ideas, or the behavior and claims captured from your task.md.',
      },
      {
        path: 'refine-logs/FINAL_PROPOSAL.md',
        desc: 'The refined method proposal — how the claims will be tested.',
      },
      {
        path: 'refine-logs/EXPERIMENT_PLAN.md',
        desc: 'Per-claim milestones: models, data, sample sizes, and success criteria.',
      },
    ],
  },
  {
    id: 'experiment',
    title: 'experiment',
    artifacts: [
      {
        path: 'refine-logs/MECHANISM_ROUTING.md',
        desc: 'Which interpretability method was chosen, the candidates considered, and why.',
      },
      {
        path: 'refine-logs/EXPERIMENT_RESULTS.md',
        desc: 'Per-claim results, one-line headlines, and baseline verdicts (supported / not-supported).',
      },
      {
        path: 'runs/',
        desc: 'Per-run code, logs, and GPU cost records for each experiment job.',
      },
    ],
  },
  {
    id: 'verify',
    title: 'verify',
    artifacts: [
      {
        path: 'verify/VERIFY_REPORT.md',
        desc: 'Per-claim robustness verdicts and a cross-claim summary.',
      },
      {
        path: 'verify/INTEGRITY_AUDIT.md',
        desc: 'What the honesty audits found on the original results and each swap run.',
      },
    ],
  },
  {
    id: 'iteration',
    title: 'iteration',
    artifacts: [
      {
        path: 'review-stage/AUTO_REVIEW.md',
        desc: 'Round-by-round review log: scores, flagged problems, and the fixes taken.',
      },
      {
        path: 'review-stage/AUTO_ITERATION_FINAL_REPORT.md',
        desc: 'What changed per claim across the fix loops, with unresolved items at the end.',
      },
    ],
  },
]

/* The docs (#quickstart / #artifacts) name exactly these two as "read
   first, in this order". VERIFY_REPORT is already listed under the verify
   stage above — do not repeat it here. */
const RESULT_DOCS = [
  {
    path: 'CLAIMS_LEDGER.md',
    desc: 'Per-claim scoreboard: final verdicts, robustness, and caveats.',
  },
  {
    path: 'AUTO_PIPELINE_REPORT.md',
    desc: "The run's journey, an index of every artifact, and any Open Items still needing your action.",
  },
]

const REVIEW_ENV_VARS = [
  {
    name: 'LLM_API_KEY',
    required: true,
    example: 'sk-…',
    purpose: 'API key for the external review model (cross-validation).',
  },
  {
    name: 'LLM_MODEL',
    required: false,
    example: 'gpt-5.4',
    purpose: 'External review model name.',
  },
  {
    name: 'LLM_BASE_URL',
    required: false,
    example: 'https://api.openai.com/v1',
    purpose: 'Base URL for the LLM provider. Set this to your proxy URL if you use one.',
  },
]

export default function QuickStartPage() {
  // The /api-token redirect (see App.jsx) lands here wanting the registration
  // control specifically, not just the step it lives in — the whole reason to
  // fold that control away is lost if arriving at it means an extra click to
  // open what you were sent here for.
  //
  // useLocation().hash, not window.location.hash: this app runs under
  // HashRouter (main.jsx), so the real browser fragment is the whole
  // "#/quick-start#mechanic-db-key" — react-router is what splits the route
  // from the in-page anchor, and only its parsed value is the bare
  // "#mechanic-db-key" this check wants.
  const location = useLocation()
  const mechanicDbOpenByDefault = location.hash === '#mechanic-db-key'

  // Step 5 kept in source but not shown — flip to true to restore.
  const SHOW_STEP_5 = false
  // Some prompt bodies are still drafted; the cards cleared for release carry
  // their own `expandable`. Flip to true to unlock the rest.
  const SHOW_ALL_MGUIDE_EXAMPLES = false
  const step5 = (
    <Step number="5" title="Configure Mechanic-DB" id="mechanic-db-key" optional>
      <p>
        Mechanic-DB is a self-hosted paper retrieval service backed by
        the interpretability corpus and citation network — precise,
        domain-focused recall next to general-purpose web search.{' '}
        <strong>It works with no key at all</strong>, just at a lower
        rate limit. Register for a free key only once you're running
        enough searches to need more headroom.
      </p>
      <details className="quick-start__details" open={mechanicDbOpenByDefault || undefined}>
        <summary>Register for a higher quota</summary>
        <div className="quick-start__details-body">
          <MechanicDbKey />
        </div>
      </details>
    </Step>
  )

  return (
    <div className="quick-start-page" style={{ '--page-accent': PAGE_ACCENTS.quickStart }}>
      <PageHeader
        motif="checklist"
        title="Install and get started in minutes"
        lede={
          <>
            <strong>Mechanist ships as a Claude Code plugin</strong> — no
            repository clone required. Install it in minutes, hand it a
            research question, and it runs the experiments on your own
            machine and GPUs, then hands back a verifiable research report.
          </>
        }
        meta="Codex support is coming soon."
        /* aside={<InstallDemo />} wideRail — install replay, hidden for now. */
      />

      <section className="section quick-start__install" aria-label="Install">
        <div className="container quick-start__inner">
          <ol className="quick-start__steps">
            <Step number="1" title="Install Claude Code and uv" tag="Prerequisites">
              <p>
                Mechanist runs inside Claude Code — install Claude Code CLI.
              </p>
              <CodeBlock label="Claude Code" language="bash" code={CLAUDE_CODE_SNIPPET} />
              <p>
                Mechanist's MCP servers use uv to manage Python
                environments — install uv next.
              </p>
              <CodeBlock label="uv" language="bash" code={UV_SNIPPET} />
            </Step>

          <Step number="2" title="Install Mechanist plugin for Claude Code">
            <p>Inside a Claude Code session:</p>
            <CodeBlock label="Install plugin" language="text" code={PLUGIN_SNIPPET} />
            <p>Then activate and verify it:</p>
            <CodeBlock label="Verify" language="text" code={VERIFY_SNIPPET} />
            <p className="quick-start__note">
              Commands still missing after that? Restart Claude Code and try again.
            </p>
          </Step>

          <Step number="3" title="Configure the external review model" id="environment">
            <p>
              Mechanist cross-validates its own ideas, experiment designs, and
              conclusions with an external reviewer at every stage — a second
              model, independent of Claude, so the same model never grades itself
              . <strong>Do not use a Claude-series model for this
              role.</strong> GPT-5.4 via{' '}
              <a href="https://platform.openai.com" target="_blank" rel="noreferrer">
                platform.openai.com
              </a>{' '}
              is recommended —
              with a standard OpenAI key the defaults below are already
              correct. For Azure, DeepSeek, Qwen, or a third-party proxy, set
              all three variables to an OpenAI-compatible endpoint.
            </p>

            <div className="quick-start__table-wrap" tabIndex={0} role="group"
                 aria-label="Environment variables">
              <table className="quick-start__table">
                <thead>
                  <tr>
                    <th scope="col">Variable</th>
                    <th scope="col">Required</th>
                    <th scope="col">Default / example</th>
                    <th scope="col">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  {REVIEW_ENV_VARS.map((item) => (
                    <tr key={item.name}>
                      <th scope="row">
                        <code>{item.name}</code>
                      </th>
                      <td>
                        <span
                          className={`quick-start__req${
                            item.required ? ' quick-start__req--yes' : ''
                          }`}
                        >
                          {item.required ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td>
                        <code>{item.example}</code>
                      </td>
                      <td>{item.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p>
              To set the variables above, add the following lines to{' '}
              <code>~/.bashrc</code> (or <code>~/.zshrc</code>):
            </p>
            <CodeBlock label="~/.bashrc or ~/.zshrc" language="bash" code={REVIEW_ENV_SNIPPET} />
            <p>Load the new variables, then confirm the key is set:</p>
            <CodeBlock label="Apply and verify" language="bash" code={REVIEW_ENV_APPLY_SNIPPET} />
            <Callout tone="note" title="Variables are read only when Claude Code starts">
              Exporting them inside an already-running session changes nothing.
              Edit <code>~/.bashrc</code> → <code>source</code> it (or open a new
              terminal) → restart Claude Code.
            </Callout>
          </Step>

          <Step number="4" title="Prepare the Python environment where experiments run" optional>
            <p>
              Mechanist runs experiments in the Python environment the Claude
              session was started in. If you do not yet have the basic packages
              for running experiments (PyTorch, NumPy, scikit-learn, etc.),
              use the commands below to create a conda environment. The{' '}
              <code>scientist</code> environment we provide covers the common
              tools Mechanist may need while running experiments.
            </p>
            <CodeBlock label="Create conda environment" language="bash" code={CONDA_SNIPPET} />
          </Step>

          {SHOW_STEP_5 ? step5 : null}
          </ol>
        </div>
      </section>

      {/* Independent block after install. Green full-bleed rule + section
          padding come from global.css `.section + .section`. */}
      <section className="section quick-start__usage" aria-labelledby="quick-usage">
        <div className="container">
          <div className="quick-start__usage-block">
            <h2 className="quick-start__section-title" id="quick-usage">
              Quick Usage Guide
            </h2>
            <p className="quick-start__section-lede">
              Create a folder as working directory, start Claude Code inside it, and tell{' '}
              <code>/mguide</code> what you want in plain language. It works out your research
              requirements with you and writes <code>task.md</code> — the task spec everything
              downstream builds on — then starts the autonomous pipeline once you confirm. Here are
              the details:
            </p>

            <div className="quick-start__usage-step" id="usage-step-1">
              <h3 className="quick-start__usage-step-title">
                <span>1</span>
                <span className="quick-start__usage-step-label">
                  Create a working directory
                </span>
              </h3>
              <p>
                Create a new empty folder for your research task. Mechanist will work inside this folder and write all outputs here.
           
              </p>
              <CodeBlock label="Create a project" language="bash" code={PROJECT_SNIPPET} />
            </div>

            <div className="quick-start__usage-step" id="usage-step-2">
              <h3 className="quick-start__usage-step-title">
                <span>2</span>
                <span className="quick-start__usage-step-label">
                  Start Claude Code
                </span>
              </h3>
              <Callout tone="note" title="Use an Opus-series model">
                We recommend <code>claude-opus-4-8</code> for good performance — inside a running
                session you can switch with <code>/model claude-opus-4-8</code>. Weaker models degrade the
                whole pipeline.
              </Callout>
              <p>
                Start Claude Code in the project root (i.e. the folder you
                created <Link to="/quick-start#usage-step-1">in step 1</Link>):
              </p>
              <CodeBlock label="Launch" language="bash" code={LAUNCH_SHELL} />
            </div>

            <div className="quick-start__usage-step" id="usage-step-3">
              <h3 className="quick-start__usage-step-title">
                <span>3</span>
                <span className="quick-start__usage-step-label">
                  Tell <code>/mguide</code> what you want
                </span>
              </h3>
              <p>
                <code>/mguide</code> is Mechanist&apos;s entry point. Type it at the Claude Code
                prompt and describe your task in plain language — it works out the rest with you
                from there.
              </p>
              <figure className="quick-start__shot">
                <img
                  src={MGUIDE_SHOT}
                  alt="The Claude Code terminal, started in the my-experiment working directory, with the command /mguide Reproduce this paper: LLMs encode harmfulness and refusal separately typed at its prompt and awaiting enter."
                  width={1552}
                  height={689}
                  loading="lazy"
                  decoding="async"
                />
              </figure>
              <p>
                Here is what you can ask it to do:
              </p>
              {MGUIDE_GROUPS.map((group) => (
                <div className="quick-start__task-group" key={group.id}>
                  <h4 className="quick-start__task-group-head">
                    <span className="quick-start__task-group-label">{group.label}</span>
                    <span className="quick-start__task-group-hint">{group.hint}</span>
                  </h4>
                  <div className="quick-start__task-examples">
                    {group.examples.map((example) => {
                      /* Cards cleared for release carry their own `expandable`;
                         the rest keep their prompt in the tree but hide the
                         control. Flip SHOW_ALL_MGUIDE_EXAMPLES to unlock them
                         all without touching this markup. */
                      const unlocked = SHOW_ALL_MGUIDE_EXAMPLES || example.expandable
                      return (
                        <details
                          key={example.id}
                          className={`quick-start__details${
                            unlocked ? '' : ' quick-start__details--locked'
                          }`}
                          open={unlocked && example.open ? true : undefined}
                          onToggle={
                            unlocked
                              ? undefined
                              : (event) => {
                                  event.currentTarget.open = false
                                }
                          }
                        >
                          <summary>
                            <span className="quick-start__task-summary">
                              <strong>{example.title}</strong>
                              <span className="quick-start__task-blurb">{example.blurb}</span>
                            </span>
                            {/* Static label, not tied to open state: rereading
                                "Hide" after you've already opened it isn't worth
                                a second class of markup, and the chevron flip
                                already shows the state. Kept in the tree when
                                locked — only hidden via CSS. */}
                            <span className="quick-start__task-toggle">
                              View example
                              <span className="quick-start__task-chevron" aria-hidden="true" />
                            </span>
                          </summary>
                          <div className="quick-start__details-body">
                            <CodeBlock
                              label={`In the session — ${example.title}`}
                              language="text"
                              code={example.code}
                            />
                          </div>
                        </details>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="quick-start__usage-step">
              <h3 className="quick-start__usage-step-title">
                <span>4</span>
                <span className="quick-start__usage-step-label">
                  Follow the run, then read the results
                </span>
              </h3>
              <p>
                If what Mechanist takes on is a <strong>research run</strong>, it enters the
                full research pipeline below. Literature requests return an answer directly
                and stop there.
              </p>
              <p>
                Mechanist executes the four stages in order: {' '}
                <strong>claim → experiment → verify → iteration</strong>, and writes each stage&apos;s relevant documents to disk before the next
                stage begins. Reading these documents lets you track what has been completed, what is planned next, and what has been discovered:
           
              </p>
              <ol className="quick-start__stages">
                {PIPELINE_STAGES.map((stage) => (
                  <li key={stage.id}>
                    <strong>{stage.title}</strong>
                    <ul className="quick-start__stage-files">
                      {stage.artifacts.map((file) => (
                        <li key={file.path}>
                          <span className="quick-start__file-line">
                            <code>{file.path}</code>
                            {' '}
                            <span>{file.desc}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
              <p>
                When it finishes, read these two files at the project root:
              </p>
              <ol className="quick-start__result-docs">
                {RESULT_DOCS.map((doc) => (
                  <li key={doc.path}>
                    <span className="quick-start__file-line">
                      <code>{doc.path}</code>
                      {' '}
                      <span>{doc.desc}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <Callout
              tone="note"
              title="Want to know more about Mechanist?"
              action={
                <a className="link-cue" href={DOCS_URL}>
                  Read Mechanist documentation
                  <ArrowIcon />
                </a>
              }
            >
              Read Mechanist documentation to learn: how to archive the current results and start the next round, explore
              advanced usage of Mechanist, learn how to write a good{' '}
              <code>task.md</code>, or see how the pipeline is designed.
            </Callout>
          </div>
        </div>
      </section>
    </div>
  )
}

function Step({ number, title, id, optional, tag, children }) {
  return (
    <li className="quick-start__step" id={id}>
      <div className="quick-start__step-head">
        <div className="quick-start__step-badges">
          <span className="quick-start__badge">Step {number}</span>
          {/* Reuses .quick-start__req rather than a new pill — it's already
              the site's "this is the lighter-weight option" mark, from the
              env-var table's Yes/No column. */}
          {optional && <span className="quick-start__req">Optional</span>}
          {tag && <span className="quick-start__req quick-start__req--yes">{tag}</span>}
        </div>
        <h3 className="quick-start__step-title">{title}</h3>
      </div>
      <div className="quick-start__step-body">{children}</div>
    </li>
  )
}

function Callout({ tone, title, action, children }) {
  return (
    <div
      className={`quick-start__callout quick-start__callout--${tone}${
        action ? ' quick-start__callout--with-action' : ''
      }`}
    >
      <strong>{title}</strong>
      <p>{children}</p>
      {action ? <div className="quick-start__callout-action">{action}</div> : null}
    </div>
  )
}

function MechanicDbKey() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [message, setMessage] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    const trimmedEmail = email.trim()
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setStatus('error')
      setMessage('Enter a valid email address.')
      return
    }

    setStatus('loading')
    setMessage('')

    try {
      const response = await fetch(REGISTER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      })
      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        setStatus('error')
        setMessage(payload.message || 'Registration failed. Please try again.')
        return
      }

      setStatus('success')
      setMessage(payload.message || 'Check your inbox for a verification link.')
    } catch {
      setStatus('error')
      setMessage(
        'Could not reach the registration service. If this keeps happening, the ' +
          'server may need to allow requests from this site (CORS).'
      )
    }
  }

  /* The "what this is" framing now lives one level up, in Step 5's own lead
     paragraph — this only renders the parts inside the fold: the control
     itself and what to do with what it gives you. */
  return (
    <>
      <div className="quick-start__register">
        {CAN_SUBMIT_INLINE ? (
        <>
          <form className="quick-start__form" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="mechanic-db-email">
              Your email address
            </label>
            <input
              id="mechanic-db-email"
              type="email"
              className="quick-start__email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              aria-invalid={status === 'error' || undefined}
              aria-describedby={status === 'error' ? 'mechanic-db-error' : undefined}
              disabled={status === 'loading' || status === 'success'}
              required
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={status === 'loading' || status === 'success'}
            >
              {status === 'loading' ? 'Sending…' : status === 'success' ? 'Sent' : 'Register'}
            </button>
          </form>

          {status === 'success' && (
            <p
              className="quick-start__status quick-start__status--success"
              role="status"
              aria-live="polite"
            >
              {message}
            </p>
          )}
          {status === 'error' && (
            <p
              id="mechanic-db-error"
              className="quick-start__status quick-start__status--error"
              role="alert"
            >
              {message}
            </p>
          )}
        </>
        ) : (
          <CodeBlock label="Register" language="bash" code={REGISTER_CURL} />
        )}
      </div>

      <p className="quick-start__note">
        Open the verification link in the email you receive. The page shows a key
        starting with <code>sk_</code>.{' '}
        <strong>It is displayed exactly once</strong> — copy it immediately.
      </p>

      <CodeBlock label="Then set it" language="bash" code={MECHANIC_DB_SNIPPET} />
      <p className="quick-start__note">
        Env vars are only read when Claude Code starts — restart the session
        after setting it.
      </p>
    </>
  )
}
