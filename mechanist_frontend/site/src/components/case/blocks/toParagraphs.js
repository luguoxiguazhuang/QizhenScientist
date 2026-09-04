/* A block's `body` may be a single string or an array of paragraphs, because
   most are one paragraph and forcing every author to write `body: ['...']`
   would be noise on the common case. Three block components need to normalise
   it, and it lives in its own file because eslint's react-refresh rule wants a
   component module to export only components. */
export default function toParagraphs(body) {
  if (Array.isArray(body)) return body
  return [body]
}
