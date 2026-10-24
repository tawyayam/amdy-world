// Presentation for a counter's unit inside UI copy. The rule lives here so
// every surface (cards, home, quest detail) words the count the same way.

/**
 * The unit with a capitalized first letter when it starts with a Latin letter
 * ("lesson" → "Lesson"); Arabic and other non-Latin scripts, digits, and empty
 * strings pass through untouched. Pair the result with `dir="auto"` so Arabic
 * phrases lay out right-to-left while Latin ones stay left-to-right.
 */
export function unitLabel(unit: string): string {
  const [first, ...rest] = unit
  if (first === undefined) return unit
  return /\p{Script=Latin}/u.test(first)
    ? first.toUpperCase() + rest.join('')
    : unit
}
