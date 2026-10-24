import { describe, expect, it } from 'vitest'
import {
  isTagNameTaken,
  tagColorVar,
  tagNameKey,
  tagsForQuest,
} from '@/lib/tags'
import type { Tag } from '@/lib/types'

const TIMESTAMP = '2026-10-13T08:00:00.000Z'

function tagFixture(overrides: Partial<Tag> = {}): Tag {
  return {
    id: 'tag-1',
    createdAt: TIMESTAMP,
    updatedAt: TIMESTAMP,
    deletedAt: null,
    name: 'frontend',
    ...overrides,
  }
}

describe('tagColorVar', () => {
  it('maps a token to its CSS variable', () => {
    expect(tagColorVar('gold')).toBe('var(--tag-gold)')
  })

  it('defaults to neutral when no token is set', () => {
    expect(tagColorVar()).toBe('var(--tag-neutral)')
  })
})

describe('tagNameKey', () => {
  it('trims and lowercases for case-insensitive comparison', () => {
    expect(tagNameKey('  FrontEnd ')).toBe('frontend')
  })
})

describe('isTagNameTaken', () => {
  const tags = [tagFixture({ id: 'tag-1', name: 'Frontend' })]

  it('matches regardless of case and surrounding space', () => {
    expect(isTagNameTaken(tags, ' frontend ')).toBe(true)
  })

  it('is false for a new name', () => {
    expect(isTagNameTaken(tags, 'books')).toBe(false)
  })

  it('ignores the tag being renamed', () => {
    expect(isTagNameTaken(tags, 'frontend', 'tag-1')).toBe(false)
  })
})

describe('tagsForQuest', () => {
  const tags = [
    tagFixture({ id: 'tag-1', name: 'frontend' }),
    tagFixture({ id: 'tag-2', name: 'books' }),
    tagFixture({ id: 'tag-3', name: 'course' }),
  ]

  it('returns the live tags a quest references, in tag-list order', () => {
    expect(
      tagsForQuest(['tag-3', 'tag-1'], tags).map((tag) => tag.name),
    ).toEqual(['frontend', 'course'])
  })

  it('drops ids whose tag no longer exists', () => {
    expect(tagsForQuest(['tag-9'], tags)).toEqual([])
  })

  it('brings the chip back when a deleted tag is restored', () => {
    // Deleting a tag is a soft delete, so the quest's ids never change; only
    // the live list the UI passes in loses the tag, then gets it back on undo.
    const questTagIds = ['tag-2']
    expect(tagsForQuest(questTagIds, [])).toEqual([])
    expect(tagsForQuest(questTagIds, tags).map((tag) => tag.id)).toEqual([
      'tag-2',
    ])
  })
})
