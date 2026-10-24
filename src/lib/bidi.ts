// Pure helpers for bidirectional text isolation. Only use these where the result
// must stay a plain string (aria-label, title attributes, document title, plain
// toast strings). For rendering user text inside JSX next to other text, use
// the UserText component with <bdi dir="auto"> instead.

const LRI = '\u2068'
const PDI = '\u2069'

/** One piece of a line: fixed UI text or user-written text. */
export type TextSegment =
  { kind: 'text'; value: string } | { kind: 'user'; value: string }

/** Wraps text in Unicode first-strong isolate and pop isolate characters. */
export function isolate(text: string): string {
  if (text === '') return ''
  return `${LRI}${text}${PDI}`
}
