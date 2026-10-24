import { describe, expect, it } from 'vitest'
import {
  buildEntryMeta,
  emptyMetaForm,
  entryMetaForEdit,
  metaFormFromEntry,
} from '@/lib/entry-meta'
import { entryFixture } from '@/lib/progress/test-fixtures'

describe('buildEntryMeta', () => {
  it('reads pages and a book title for a reading entry', () => {
    expect(
      buildEntryMeta('reading', {
        pages: '20',
        bookTitle: 'Dune',
        minutes: '',
        questId: '',
      }),
    ).toEqual({ pages: 20, bookTitle: 'Dune' })
  })

  it('drops an empty book title', () => {
    expect(
      buildEntryMeta('reading', {
        pages: '5',
        bookTitle: '  ',
        minutes: '',
        questId: '',
      }),
    ).toEqual({ pages: 5 })
  })

  it('ignores a non-positive page count', () => {
    expect(
      buildEntryMeta('reading', {
        pages: '0',
        bookTitle: 'Dune',
        minutes: '',
        questId: '',
      }),
    ).toEqual({ bookTitle: 'Dune' })
  })

  it('returns undefined when a reading entry has no meta', () => {
    expect(buildEntryMeta('reading', emptyMetaForm())).toBeUndefined()
  })

  it('reads minutes for a session entry', () => {
    expect(
      buildEntryMeta('session', {
        pages: '',
        bookTitle: '',
        minutes: '30',
        questId: '',
      }),
    ).toEqual({ minutes: 30 })
  })

  it('returns undefined for types without extra fields', () => {
    expect(
      buildEntryMeta('learned', {
        pages: '9',
        bookTitle: 'x',
        minutes: '9',
        questId: '',
      }),
    ).toBeUndefined()
  })

  it('links a quest for any entry type', () => {
    expect(
      buildEntryMeta('learned', {
        ...emptyMetaForm(),
        questId: 'quest-1',
      }),
    ).toEqual({ questId: 'quest-1' })
  })

  it('links a quest alongside reading fields', () => {
    expect(
      buildEntryMeta('reading', {
        pages: '20',
        bookTitle: 'Dune',
        minutes: '',
        questId: 'quest-1',
      }),
    ).toEqual({ pages: 20, bookTitle: 'Dune', questId: 'quest-1' })
  })

  it('ignores a blank quest link', () => {
    expect(
      buildEntryMeta('note', { ...emptyMetaForm(), questId: '   ' }),
    ).toBeUndefined()
  })
})

describe('metaFormFromEntry', () => {
  it('restores fields from a saved reading entry', () => {
    const entry = entryFixture({
      type: 'reading',
      meta: { pages: 12, bookTitle: 'Dune' },
    })
    expect(metaFormFromEntry(entry)).toEqual({
      pages: '12',
      bookTitle: 'Dune',
      minutes: '',
      questId: '',
    })
  })

  it('restores the quest link', () => {
    const entry = entryFixture({ meta: { questId: 'quest-1' } })
    expect(metaFormFromEntry(entry).questId).toBe('quest-1')
  })

  it('returns blanks for an entry without meta', () => {
    expect(metaFormFromEntry(entryFixture())).toEqual(emptyMetaForm())
  })
})

describe('entryMetaForEdit', () => {
  it('keeps the promotion link when other fields change', () => {
    const entry = entryFixture({
      meta: { promotedToQuestId: 'quest-1', pages: 4 },
    })
    const meta = entryMetaForEdit(entry, {
      ...emptyMetaForm(),
      questId: 'quest-2',
    })
    expect(meta).toEqual({
      promotedToQuestId: 'quest-1',
      questId: 'quest-2',
    })
  })

  it('keeps the promotion link when the form clears everything else', () => {
    const entry = entryFixture({ meta: { promotedToQuestId: 'quest-1' } })
    expect(entryMetaForEdit(entry, emptyMetaForm())).toEqual({
      promotedToQuestId: 'quest-1',
    })
  })

  it('behaves like buildEntryMeta for un-promoted entries', () => {
    const entry = entryFixture()
    const form = { ...emptyMetaForm(), questId: 'quest-1' }
    expect(entryMetaForEdit(entry, form)).toEqual(
      buildEntryMeta(entry.type, form),
    )
  })
})
