import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import './SiteHeader.css'

const NAV_LINKS = [
  { to: '/', label: '首页', end: true },
  { to: '/knowledge-graphs', label: '知识图谱' },
]

const EXTERNAL_LINKS = [
  { href: 'https://github.com/luguoxiguazhuang/QizhenScientist', label: 'GitHub', external: true },
]

function navLinkClass({ isActive }) {
  return isActive ? 'site-header__link active' : 'site-header__link'
}

export default function SiteHeader() {
  const location = useLocation()
  const menuRef = useRef(null)
  const toggleRef = useRef(null)

  /* The panel is open only for the location it was opened at. Navigating with
     it open should close it — otherwise the new page renders underneath the
     menu used to reach it — and deriving that from location.key gets it for
     every kind of navigation, including the back button, with no effect and no
     cascading render. The previous version called setMenuOpen(false) from an
     effect on every route change, which re-rendered the whole header a second
     time on every navigation whether or not the menu had ever been opened. */
  const [openedAt, setOpenedAt] = useState(null)
  const menuOpen = openedAt !== null && openedAt === location.key

  const closeMenu = useCallback(() => setOpenedAt(null), [])

  useEffect(() => {
    if (!menuOpen) return

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeMenu()
        // Escape should leave focus somewhere sensible, not on a panel that is
        // no longer there.
        toggleRef.current?.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen, closeMenu])

  // The panel covers the page, so the page behind it must not scroll. The
  // Database page already does this for its fullscreen graph; the menu did not,
  // and a touch drag over the overlay scrolled the content underneath it.
  useEffect(() => {
    if (!menuOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [menuOpen])

  // Opening moves focus into the panel; without it a keyboard user opens the
  // menu and their next Tab continues from the toggle into the page behind.
  useEffect(() => {
    if (!menuOpen) return
    menuRef.current?.querySelector('a, button')?.focus()
  }, [menuOpen])

  return (
    <header className={`site-header${menuOpen ? ' is-open' : ''}`}>
      <div className="container site-header__inner">
        <Link className="site-header__brand" to="/" aria-label="启真 Scientist 首页">
          <span className="site-header__wordmark">启真 <em>Scientist</em></span>
        </Link>

        <nav className="site-header__nav" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} className={navLinkClass} end={link.end} to={link.to}>
              {link.label}
            </NavLink>
          ))}
          <span className="site-header__divider" aria-hidden="true" />
          {EXTERNAL_LINKS.map((link) => (
            <a
              key={link.label}
              className="site-header__link"
              href={link.href}
              {...(link.external ? { target: '_blank', rel: 'noreferrer' } : {})}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Below 900px the nav no longer fits on one line. It used to be hidden
            by nth-child rules — which silently dropped Database, Docs and
            everything else past the fourth item — so the small-screen site had
            no way to reach half of itself. */}
        <button
          ref={toggleRef}
          type="button"
          className="site-header__toggle"
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          /* Keyed off menuOpen, not off openedAt: after navigating away with
             the panel open, openedAt is still set but stale, and toggling on
             that would need two clicks to reopen. */
          onClick={() => setOpenedAt(menuOpen ? null : location.key)}
        >
          <span className="sr-only">{menuOpen ? '关闭菜单' : '打开菜单'}</span>
          <span className="site-header__toggle-bars" aria-hidden="true" />
        </button>
      </div>

      <div className="site-header__menu" id="site-menu" ref={menuRef} hidden={!menuOpen}>
        <div className="container site-header__menu-inner">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} className={navLinkClass} end={link.end} to={link.to}>
              {link.label}
            </NavLink>
          ))}
          {EXTERNAL_LINKS.map((link) => (
            <a
              key={link.label}
              className="site-header__link"
              href={link.href}
              {...(link.external ? { target: '_blank', rel: 'noreferrer' } : {})}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </header>
  )
}
