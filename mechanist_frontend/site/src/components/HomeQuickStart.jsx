import { Link } from 'react-router-dom'
import { SITE } from '../content/mechanistContent.js'
import ArrowIcon from './ArrowIcon.jsx'
import './HomeQuickStart.css'

/* Beat four: how to try it.
 *
 * This used to reproduce three install commands inline, under the heading
 * "From install to first run in three commands" — which the Quick Start page
 * itself then contradicted, because those three commands assume Claude Code on
 * Opus 4.7, uv, a conda environment and a non-Claude reviewer key are already
 * in place. Showing the short version on the home page made the real path look
 * shorter than it is, and duplicated a page that has to be kept correct anyway.
 *
 * So the section closes the page rather than teaching it: say what installing
 * means, then send the reader to the two places that can actually take them
 * further. */
export default function HomeQuickStart() {
  return (
    <section className="home-qs section on-dark" id="quick-start">
      <div className="container home-qs__inner">
        <header className="home-qs__head">
          <h2 className="section-title">Run it on your own question</h2>
          <p className="section-lede">
            Install Mechanist as a Claude Code plugin — no repository clone
            required.
            <br />
            Hand it a research question and get a verifiable research report.
            Experiments run on your own machine and GPUs.
            <br />
            <br />
            Codex support is coming soon.
          </p>
        </header>

        <div className="home-qs__foot">
          <Link className="btn btn-primary link-unstyled" to="/quick-start">
            Quick start
            <ArrowIcon />
          </Link>
          <a
            className="btn btn-ghost"
            href={SITE.githubUrl}
            target="_blank"
            rel="noreferrer"
          >
            Source on GitHub
            <ArrowIcon />
          </a>
        </div>
      </div>
    </section>
  )
}
