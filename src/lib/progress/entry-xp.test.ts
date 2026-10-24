import { describe, expect, it } from 'vitest'
import { readingXp, sessionXp, xpForEntry } from '@/lib/progress'
import { entryFixture } from './test-fixtures'
import type { Entry } from '@/lib/types'

function entry(overrides: Partial<Entry>): Entry {
  return entryFixture(overrides)
}

describe('xpForEntry', () => {
  it('grants 15 XP for something learned', () => {
    expect(xpForEntry(entry({ type: 'learned', skillId: 'learning' }))).toBe(15)
  })

  it('grants 10 XP for an idea', () => {
    expect(xpForEntry(entry({ type: 'idea', skillId: 'ideas' }))).toBe(10)
  })

  it('adds 25 XP when the idea was promoted to a quest', () => {
    const promoted = entry({
      type: 'idea',
      skillId: 'ideas',
      meta: { promotedToQuestId: 'quest-1' },
    })
    expect(xpForEntry(promoted)).toBe(35)
  })

  it('grants reading XP from pages', () => {
    expect(xpForEntry(entry({ type: 'reading', meta: { pages: 10 } }))).toBe(5)
  })

  it('grants session XP from minutes', () => {
    expect(xpForEntry(entry({ type: 'session', meta: { minutes: 60 } }))).toBe(
      12,
    )
  })

  it('grants nothing for a note', () => {
    expect(xpForEntry(entry({ type: 'note', skillId: null }))).toBe(0)
  })
})

describe('readingXp', () => {
  it('rounds one XP per two pages down', () => {
    expect(readingXp(0)).toBe(0)
    expect(readingXp(1)).toBe(0)
    expect(readingXp(2)).toBe(1)
    expect(readingXp(3)).toBe(1)
    expect(readingXp(10)).toBe(5)
  })

  it('caps at 40 XP per entry', () => {
    expect(readingXp(80)).toBe(40)
    expect(readingXp(1000)).toBe(40)
  })

  it('treats missing or negative pages as zero', () => {
    expect(readingXp(undefined)).toBe(0)
    expect(readingXp(-10)).toBe(0)
  })
})

describe('sessionXp', () => {
  it('rounds one XP per five minutes down', () => {
    expect(sessionXp(4)).toBe(0)
    expect(sessionXp(5)).toBe(1)
    expect(sessionXp(50)).toBe(10)
  })

  it('caps at 60 XP per entry', () => {
    expect(sessionXp(300)).toBe(60)
    expect(sessionXp(1000)).toBe(60)
  })

  it('treats missing or negative minutes as zero', () => {
    expect(sessionXp(undefined)).toBe(0)
    expect(sessionXp(-30)).toBe(0)
  })
})
