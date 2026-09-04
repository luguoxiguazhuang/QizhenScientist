import { Component } from 'react'
import './RootErrorBoundary.css'
import { BASE_PATH } from '../lib/basePath.js'

/* The last line of defence. Without it, one thrown render anywhere in the tree
   takes the whole site to a blank white page with nothing in it — no header, no
   way back, and nothing on screen telling the visitor that the failure is ours.
 *
 * The Database page already had its own boundary around the graph, but it
 * closed before the history overlay, so the one component most likely to throw
 * (it dereferences a category that the graph is allowed to hand over as null)
 * sat outside every boundary on the site.
 *
 * This one deliberately does not try to recover state. Reloading is the honest
 * offer: whatever put the tree in a bad state is still in memory otherwise. */
export default class RootErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[Mechanist] unhandled render error', error, info)
  }

  render() {
    const { error } = this.state

    if (!error) {
      return this.props.children
    }

    return (
      <div className="root-error">
        <div className="root-error__inner">
          <p className="root-error__eyebrow">Mechanist</p>
          <h1 className="root-error__title">This page failed to load</h1>
          <p className="root-error__body">
            Something broke on our side, not yours. Reloading usually clears it.
            If it keeps happening, the details are in the browser console and we
            would like to hear about it.
          </p>
          <div className="root-error__actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Reload the page
            </button>
            {/* A full document navigation, not a router link: the router is
                part of the tree that just failed. */}
            <a className="btn btn-ghost" href={BASE_PATH}>
              Back to the home page
            </a>
          </div>
        </div>
      </div>
    )
  }
}
