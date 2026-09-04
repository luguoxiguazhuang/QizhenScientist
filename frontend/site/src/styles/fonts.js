/* Self-hosted IBM Plex, replacing the render-blocking Google Fonts <link> that
   used to sit in index.html.

   Two reasons it had to go. The stylesheet request was synchronous, so first
   paint waited on a third-party host; and fonts.googleapis.com is routinely
   unreachable from mainland China, where that wait became a multi-second white
   screen before the fallback finally rendered. Bundling the files removes both.

   The weights below are exactly the ones the old <link> asked for — Sans
   400/500/600/700 + 400 italic, Mono 400/500 + 400 italic, Serif 400/500 + 400
   italic. Latin subsets only: the site is entirely English, and pulling the
   cyrillic/greek/vietnamese subsets would multiply the font payload for glyphs
   nothing on the site can render.

   Adding a weight here is cheap; adding a family is not. Before reaching for a
   fourth, read the type rules in styles/global.css — the three faces already
   have distinct jobs (prose, statements, scaffolding) and a fourth blurs them. */

/* Sans — body copy, h3/h4, UI. */
import '@fontsource/ibm-plex-sans/latin-400.css'
import '@fontsource/ibm-plex-sans/latin-400-italic.css'
import '@fontsource/ibm-plex-sans/latin-500.css'
import '@fontsource/ibm-plex-sans/latin-600.css'
import '@fontsource/ibm-plex-sans/latin-700.css'

/* Serif — h1/h2, section titles, case titles. The "statement" face. */
import '@fontsource/ibm-plex-serif/latin-400.css'
import '@fontsource/ibm-plex-serif/latin-400-italic.css'
import '@fontsource/ibm-plex-serif/latin-500.css'

/* Mono — eyebrows, breadcrumbs, file names, tabular figures. */
import '@fontsource/ibm-plex-mono/latin-400.css'
import '@fontsource/ibm-plex-mono/latin-400-italic.css'
import '@fontsource/ibm-plex-mono/latin-500.css'
