// Formatting of the counter copy that shows person-written text: the completion
// toast and the "Next: Lesson 4" line. Keeps the unit capitalization rule and
// the mixed-language titles in view.

import { describe, expect, it } from 'vitest'
import { QUEST_COPY } from './copy'

describe('counterCompleted', () => {
  it('names the quest and the XP the change granted', () => {
    expect(QUEST_COPY.counterCompleted('Learn Spanish', 150)).toBe(
      'Quest complete: Learn Spanish · +150 XP',
    )
  })

  it('keeps an Arabic title and the XP intact', () => {
    expect(QUEST_COPY.counterCompleted('أكملت الدورة', 200)).toBe(
      'Quest complete: أكملت الدورة · +200 XP',
    )
  })

  it('reports a change that granted nothing', () => {
    expect(QUEST_COPY.counterCompleted('Ship the app', 0)).toBe(
      'Quest complete: Ship the app · +0 XP',
    )
  })
})

describe('nextUpCounter', () => {
  it('capitalizes a Latin unit, like the count line', () => {
    expect(QUEST_COPY.nextUpCounter(4, 'lesson')).toBe('Lesson 4')
  })

  it('keeps an already capitalized unit as written', () => {
    expect(QUEST_COPY.nextUpCounter(4, 'Lesson')).toBe('Lesson 4')
  })

  it('leaves an Arabic unit as written', () => {
    expect(QUEST_COPY.nextUpCounter(3, 'درس')).toBe('درس 3')
  })

  it('capitalizes only the first word of a multi-word unit', () => {
    expect(QUEST_COPY.nextUpCounter(2, 'coding session')).toBe(
      'Coding session 2',
    )
  })
})
