import { describe, expect, it } from 'vitest'
import { entryDetailSegments } from '@/lib/entries'
import type { Entry } from '@/lib/types'

function makeEntry(overrides: Partial<Entry>): Entry {
  return {
    id: 'e1',
    type: 'reading',
    text: 'read',
    createdAt: '2026-01-01T12:13:00.000Z',
    updatedAt: '2026-01-01T12:13:00.000Z',
    deletedAt: null,
    skillId: 'reading',
    ...overrides,
  }
}

describe('entryDetailSegments', () => {
  it('Arabic book title with pages and time context', () => {
    const entry = makeEntry({
      type: 'reading',
      meta: { pages: 12, bookTitle: 'كتاب' },
    })
    const segments = entryDetailSegments(entry)
    expect(segments).toEqual([
      { kind: 'text', value: '12 pages' },
      { kind: 'user', value: 'كتاب' },
    ])
    expect(segments.length).toBe(2)
  })

  it('mixed Arabic/English title', () => {
    const entry = makeEntry({
      type: 'reading',
      meta: { pages: 5, bookTitle: 'قرأت Deep Work اليوم' },
    })
    const segments = entryDetailSegments(entry)
    expect(segments[0]).toEqual({ kind: 'text', value: '5 pages' })
    expect(segments[1]).toEqual({ kind: 'user', value: 'قرأت Deep Work اليوم' })
  })

  it('English title', () => {
    const entry = makeEntry({
      type: 'reading',
      meta: { pages: 10, bookTitle: 'Deep Work' },
    })
    const segments = entryDetailSegments(entry)
    expect(segments).toEqual([
      { kind: 'text', value: '10 pages' },
      { kind: 'user', value: 'Deep Work' },
    ])
  })

  it('no book title', () => {
    const entry = makeEntry({
      type: 'reading',
      meta: { pages: 3 },
    })
    const segments = entryDetailSegments(entry)
    expect(segments).toEqual([{ kind: 'text', value: '3 pages' }])
  })

  it('title containing digits', () => {
    const entry = makeEntry({
      type: 'reading',
      meta: { pages: 7, bookTitle: 'Book 1984' },
    })
    const segments = entryDetailSegments(entry)
    expect(segments[1]).toEqual({ kind: 'user', value: 'Book 1984' })
  })

  it('punctuation or parentheses at edges', () => {
    const entry = makeEntry({
      type: 'reading',
      meta: { pages: 2, bookTitle: '(كتاب)!' },
    })
    const segments = entryDetailSegments(entry)
    expect(segments[1]).toEqual({ kind: 'user', value: '(كتاب)!' })
  })

  it('time segment never split (structure)', () => {
    const entry = makeEntry({
      type: 'reading',
      meta: { pages: 12, bookTitle: 'كتاب' },
    })
    const segments = entryDetailSegments(entry)
    // Time is rendered separately by component, not in segments
    expect(segments.every((s) => s.kind === 'text' || s.kind === 'user')).toBe(
      true,
    )
  })
})
