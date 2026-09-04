/* Case bodies, loaded on demand.

   Each case file is a few kilobytes of prose, tables and chart data that only
   ever matters on its own route, so they are code-split rather than pulled
   into the main bundle alongside the home page.

   The map is written out one entry at a time on purpose. `import(`./${id}.js`)`
   would be shorter, but Vite cannot statically analyse a template-literal
   dynamic import: it either gives up and bundles every match into the parent
   chunk — losing the split this exists for — or warns, depending on the
   surrounding code. Four explicit thunks are four real split points, and an
   unknown id fails at the lookup rather than at request time.

   The thunks are exported raw rather than behind a load function because
   CaseDetailPage wraps each one in React.lazy at module scope, which needs the
   thunk itself and not the promise calling it would return. */

export const CASE_LOADERS = {
  'subliminal-lab-safety': () => import('./subliminal-lab-safety.js'),
  'belief-mechanism': () => import('./belief-mechanism.js'),
  'belief-intervention': () => import('./belief-intervention.js'),
  'evo2-alpha-helix': () => import('./evo2-alpha-helix.js'),
}

export const CASE_IDS = Object.keys(CASE_LOADERS)
