import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

/* There was no linter here before, which the source had already noticed: three
   files carried `// eslint-disable-line` comments suppressing rules that
   nothing was checking. react-hooks/exhaustive-deps in particular was being
   silenced in the one place it had a real finding.
 *
 * Kept deliberately small. This is a static site, not a framework — the value
 * is in the hooks rules, which catch the stale-closure and missing-cleanup
 * classes of bug that are invisible in review and only show up as a leak. */
export default [
  { ignores: ['dist/**', 'node_modules/**', 'public/**'] },

  js.configs.recommended,
  // `configs.flat` is a namespace, not a config: the flat-shaped object is one
  // level down. `configs['recommended-latest']` at the top level is still
  // eslintrc-shaped (plugins as an array of strings) and flat config rejects it.
  reactHooks.configs.flat['recommended-latest'],

  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // console.warn / console.error are how this site reports a failed fetch
      // it has already handled in the UI. Bare console.log is the one worth
      // catching before it ships.
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      /* recommended-latest ships this as an error, aimed at derived-state
         mirroring. Every hit here is the ordinary fetch-effect shape —
         setLoading(true) before the request, or resetting a timer — which the
         React docs themselves use. Keep it visible as a warning, but don't
         let it block the build. */
      'react-hooks/set-state-in-effect': 'warn',
      /* No varsIgnorePattern. An earlier version here exempted anything
         SCREAMING_CASE, on the theory that it covered component names — but JSX
         identifiers already count as references, so all that exemption actually
         did was hide every unused module-level constant, which is exactly the
         debris that accumulates when a section gets deleted.

         argsIgnorePattern stays: `_next` in an Express error handler is
         required by arity and never read. */
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },

  // Node context, not browser.
  {
    files: ['server/**/*.js', 'vite.config.js', 'eslint.config.js'],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      // stdout is this process's user interface — the boot banner belongs there.
      'no-console': 'off',
    },
  },
]
