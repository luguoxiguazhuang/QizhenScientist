import { Link } from 'react-router-dom'
import ArrowIcon from './ArrowIcon.jsx'
import PageHeader from './PageHeader.jsx'
import './HypothesisLibraryPage.css'

/* Placeholder. The previous version rendered a topic browser fed by
   public/hypothesis-library/*.json; those files are left in place so the page
   can be rebuilt when the content is ready. */
export default function HypothesisLibraryPage() {
  return (
    <div className="hyp">
      <PageHeader
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Hypothesis Library' }]}
        title="Every hypothesis, and what became of it"
        lede="A browsable record of the hypotheses Mechanist has generated, and what became of each one. This page is not ready yet — until it is, the four research posts are the fullest account of how a hypothesis is formed, tested, and either kept or dropped."
      />

      <div className="container hyp__inner">
        <p className="hyp__back">
          <Link className="link-cue" to="/research">
            Read the research posts
            <ArrowIcon />
          </Link>
        </p>
      </div>
    </div>
  )
}
