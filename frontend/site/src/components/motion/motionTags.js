import { m } from 'motion/react'
import { Link } from 'react-router-dom'

/* Motion-wrapped versions of the non-intrinsic elements the site animates.
 *
 * These are created once, here, at module scope. `m.create()` returns a fresh
 * component type on every call, so calling it inside a component — even behind
 * useMemo — means React can see a new type and remount the whole subtree; the
 * react-hooks/static-components rule rejects it for exactly that reason.
 *
 * `MotionLink` exists because the cases index staggers a grid of router links,
 * and each link has to be a direct child of the grid. Wrapping every card in an
 * animated <div> would put a non-grid element between the grid and its items. */

export const MotionLink = m.create(Link)
