import { describe, expect, it } from 'vitest'
import {
  dayHeading,
  DEFAULT_TIMELINE_VIEW,
  filterEntries,
  groupEntriesByDay,
  hasActiveTimelineFilters,
  normalizeTimelineView,
  shapeTimeline,
  type TimelineFilters,
} from '@/lib/timeline'
import { entryFixture, goalFixture } from '@/lib/progress/test-fixtures'

const ALL: TimelineFilters = { type: 'all', skillId: 'all', query: '' }

describe('normalizeTimelineView', () => {
  it('falls back to the defaults when nothing was saved', () => {
    expect(normalizeTimelineView(undefined)).toEqual(DEFAULT_TIMELINE_VIEW)
  })

  it('keeps a saved grid layout', () => {
    expect(
      normalizeTimelineView({
        groupBy: 'week',
        sort: 'oldest',
        layout: 'grid',
      }),
    ).toEqual({ groupBy: 'week', sort: 'oldest', layout: 'grid' })
  })

  it('defaults the layout to list for data saved before it existed', () => {
    const legacy = { groupBy: 'week', sort: 'oldest' } as Partial<
      typeof DEFAULT_TIMELINE_VIEW
    >
    expect(normalizeTimelineView(legacy)).toEqual({
      groupBy: 'week',
      sort: 'oldest',
      layout: 'list',
    })
  })

  it('falls back to day when grouping by the retired "type"', () => {
    const legacy = {
      groupBy: 'type',
      sort: 'newest',
      layout: 'list',
    } as unknown as Partial<typeof DEFAULT_TIMELINE_VIEW>
    expect(normalizeTimelineView(legacy).groupBy).toBe('day')
  })
})

describe('filterEntries', () => {
  const entries = [
    entryFixture({ id: 'a', type: 'learned', skillId: 'learning' }),
    entryFixture({ id: 'b', type: 'reading', skillId: 'reading' }),
    entryFixture({ id: 'c', type: 'idea', skillId: 'ideas' }),
  ]

  it('returns everything when no filter is set', () => {
    expect(filterEntries(entries, ALL).map((entry) => entry.id)).toEqual([
      'a',
      'b',
      'c',
    ])
  })

  it('narrows by type (type filter removed)', () => {
    expect(
      filterEntries(entries, { ...ALL, type: 'learned' }).map(
        (entry) => entry.id,
      ),
    ).toEqual(['a', 'b', 'c'])
  })

  it('narrows by skill', () => {
    expect(
      filterEntries(entries, { ...ALL, skillId: 'ideas' }).map(
        (entry) => entry.id,
      ),
    ).toEqual(['c'])
  })

  it('applies skill filter with search together', () => {
    expect(
      filterEntries(entries, { ...ALL, skillId: 'ideas', query: 'i' }).map(
        (entry) => entry.id,
      ),
    ).toEqual(['c'])
  })

  it('matches the query against entry text, case-insensitively', () => {
    const withText = [
      entryFixture({ id: 'a', text: 'Read about IndexedDB' }),
      entryFixture({ id: 'b', text: 'Wrote some CSS' }),
    ]
    expect(
      filterEntries(withText, { ...ALL, query: 'indexeddb' }).map(
        (entry) => entry.id,
      ),
    ).toEqual(['a'])
  })

  it('matches the query against a reading book title', () => {
    const withBook = [
      entryFixture({
        id: 'a',
        type: 'reading',
        meta: { pages: 10, bookTitle: 'Refactoring' },
      }),
      entryFixture({ id: 'b', type: 'reading', meta: { pages: 5 } }),
    ]
    expect(
      filterEntries(withBook, { ...ALL, query: 'refactor' }).map(
        (entry) => entry.id,
      ),
    ).toEqual(['a'])
  })

  it('matches Arabic text and ignores surrounding whitespace', () => {
    const arabic = [
      entryFixture({ id: 'a', text: 'قرأت عن رياكت' }),
      entryFixture({ id: 'b', text: 'Wrote a component' }),
    ]
    expect(
      filterEntries(arabic, { ...ALL, query: '  رياكت ' }).map(
        (entry) => entry.id,
      ),
    ).toEqual(['a'])
  })

  it('combines the query with the skill filter (Arabic)', () => {
    const mixed = [
      entryFixture({
        id: 'a',
        type: 'reading',
        skillId: 'reading',
        text: 'React docs',
      }),
      entryFixture({
        id: 'b',
        type: 'idea',
        skillId: 'ideas',
        text: 'React فكرة',
      }),
    ]
    expect(
      filterEntries(mixed, {
        ...ALL,
        skillId: 'ideas',
        query: 'فكرة',
      }).map((entry) => entry.id),
    ).toEqual(['b'])
  })
})

describe('hasActiveTimelineFilters', () => {
  it('is false for the defaults', () => {
    expect(hasActiveTimelineFilters(ALL)).toBe(false)
  })

  it('is false when the query is only whitespace', () => {
    expect(hasActiveTimelineFilters({ ...ALL, query: '   ' })).toBe(false)
  })

  it('is true when a skill or query is set', () => {
    expect(hasActiveTimelineFilters({ ...ALL, type: 'learned' })).toBe(false)
    expect(hasActiveTimelineFilters({ ...ALL, skillId: 'ideas' })).toBe(true)
    expect(hasActiveTimelineFilters({ ...ALL, query: 'hi' })).toBe(true)
  })
})

describe('groupEntriesByDay', () => {
  it('buckets entries into local days, newest day first', () => {
    const entries = [
      entryFixture({ id: 'today-a', createdAt: '2026-10-14T08:00:00.000Z' }),
      entryFixture({ id: 'yesterday', createdAt: '2026-10-13T20:00:00.000Z' }),
      entryFixture({ id: 'today-b', createdAt: '2026-10-14T09:30:00.000Z' }),
    ]
    const days = groupEntriesByDay(entries, 'UTC')
    expect(days.map((day) => day.dateKey)).toEqual(['2026-10-14', '2026-10-13'])
    expect(days[0].entries.map((entry) => entry.id)).toEqual([
      'today-b',
      'today-a',
    ])
  })

  it('groups by the requested time zone', () => {
    // 23:30 UTC on the 13th is already the 14th in Tokyo (+09:00).
    const entries = [
      entryFixture({ id: 'late', createdAt: '2026-10-13T23:30:00.000Z' }),
    ]
    expect(groupEntriesByDay(entries, 'Asia/Tokyo')[0].dateKey).toBe(
      '2026-10-14',
    )
    expect(groupEntriesByDay(entries, 'UTC')[0].dateKey).toBe('2026-10-13')
  })

  it('returns no days for no entries', () => {
    expect(groupEntriesByDay([], 'UTC')).toEqual([])
  })
})

describe('dayHeading', () => {
  it('labels today', () => {
    expect(dayHeading('2026-10-14', '2026-10-14')).toBe('Today')
  })

  it('labels yesterday', () => {
    expect(dayHeading('2026-10-13', '2026-10-14')).toBe('Yesterday')
  })

  it('falls back to a long date for older days', () => {
    const heading = dayHeading('2026-10-11', '2026-10-14')
    expect(heading).not.toBe('Today')
    expect(heading).not.toBe('Yesterday')
    expect(heading).toContain('October')
    expect(heading).toContain('11')
  })
})

const TODAY = '2026-10-14'

describe('shapeTimeline', () => {
  it('groups by day, newest day first, by default', () => {
    const entries = [
      entryFixture({ id: 'a', createdAt: '2026-10-14T08:00:00.000Z' }),
      entryFixture({ id: 'b', createdAt: '2026-10-13T20:00:00.000Z' }),
    ]
    const groups = shapeTimeline(entries, DEFAULT_TIMELINE_VIEW, 'UTC', TODAY)
    expect(groups.map((group) => group.heading)).toEqual(['Today', 'Yesterday'])
  })

  it('sorts oldest first within a day and flips the day order', () => {
    const entries = [
      entryFixture({ id: 'new', createdAt: '2026-10-14T09:00:00.000Z' }),
      entryFixture({ id: 'old', createdAt: '2026-10-14T08:00:00.000Z' }),
    ]
    const groups = shapeTimeline(
      entries,
      { ...DEFAULT_TIMELINE_VIEW, sort: 'oldest' },
      'UTC',
      TODAY,
    )
    expect(groups[0].entries.map((entry) => entry.id)).toEqual(['old', 'new'])
  })

  it('groups by week starting on Monday', () => {
    // Mon Oct 12 through Sun Oct 18 2026 share one week; Sun Oct 11 is earlier.
    const entries = [
      entryFixture({ id: 'sun', createdAt: '2026-10-11T12:00:00.000Z' }),
      entryFixture({ id: 'wed', createdAt: '2026-10-14T12:00:00.000Z' }),
      entryFixture({ id: 'mon', createdAt: '2026-10-12T12:00:00.000Z' }),
    ]
    const groups = shapeTimeline(
      entries,
      { ...DEFAULT_TIMELINE_VIEW, groupBy: 'week' },
      'UTC',
      TODAY,
    )
    expect(groups).toHaveLength(2)
    expect(groups[0].heading).toBe('Week of Oct 12')
    expect(groups[0].entries.map((entry) => entry.id).sort()).toEqual([
      'mon',
      'wed',
    ])
    expect(groups[1].heading).toBe('Week of Oct 5')
    expect(groups[1].entries.map((entry) => entry.id)).toEqual(['sun'])
  })

  it('groups by skill in canonical order, entries without a skill last', () => {
    const entries = [
      entryFixture({ id: 'idea', type: 'idea', skillId: 'ideas' }),
      entryFixture({ id: 'prog', type: 'session', skillId: 'programming' }),
      entryFixture({ id: 'other', type: 'learned', skillId: null }),
    ]
    const groups = shapeTimeline(
      entries,
      { ...DEFAULT_TIMELINE_VIEW, groupBy: 'skill' },
      'UTC',
      TODAY,
    )
    expect(groups.map((group) => group.heading)).toEqual([
      'Programming',
      'Ideas',
      'No skill',
    ])
    expect(groups[2]?.entries.map((entry) => entry.id)).toEqual(['other'])
  })

  it('drops empty groups', () => {
    const groups = shapeTimeline(
      [],
      { ...DEFAULT_TIMELINE_VIEW, groupBy: 'skill' },
      'UTC',
      TODAY,
    )
    expect(groups).toEqual([])
  })

  it('annotates a day group with its done/total goals', () => {
    const entries = [
      entryFixture({ id: 'a', createdAt: '2026-10-14T08:00:00.000Z' }),
      entryFixture({ id: 'b', createdAt: '2026-10-13T20:00:00.000Z' }),
    ]
    const goals = [
      goalFixture({ id: 'g1', date: '2026-10-14', done: true }),
      goalFixture({ id: 'g2', date: '2026-10-14', done: false }),
      goalFixture({ id: 'g3', date: '2026-10-12', done: true }),
    ]
    const groups = shapeTimeline(
      entries,
      DEFAULT_TIMELINE_VIEW,
      'UTC',
      TODAY,
      goals,
    )
    expect(groups[0].goals).toEqual({ done: 1, total: 2 })
    expect(groups[1].goals).toBeUndefined()
  })

  it('does not create a group for a day that has goals but no entries', () => {
    const goals = [
      goalFixture({ id: 'g1', date: '2026-10-14', done: true }),
      goalFixture({ id: 'g2', date: '2026-10-14', done: false }),
    ]
    // A day with goals but nothing logged has no timeline of its own, under any
    // grouping: only days with entries produce a group.
    expect(
      shapeTimeline([], DEFAULT_TIMELINE_VIEW, 'UTC', TODAY, goals),
    ).toEqual([])
    expect(
      shapeTimeline(
        [],
        { ...DEFAULT_TIMELINE_VIEW, groupBy: 'week' },
        'UTC',
        TODAY,
        goals,
      ),
    ).toEqual([])
    expect(
      shapeTimeline(
        [],
        { ...DEFAULT_TIMELINE_VIEW, groupBy: 'skill' },
        'UTC',
        TODAY,
        goals,
      ),
    ).toEqual([])
  })

  it('excludes notes from timeline output and count', () => {
    const entries = [
      entryFixture({
        id: 'note',
        type: 'note',
        skillId: null,
        text: 'journal note',
        createdAt: '2025-10-15T10:00:00.000Z',
      }),
      entryFixture({
        id: 'log',
        type: 'learned',
        skillId: 'ideas',
        text: 'done thing',
        createdAt: '2025-10-15T08:00:00.000Z',
      }),
    ]
    const filtered = filterEntries(entries, {
      type: 'all',
      skillId: 'all',
      query: '',
    })
    expect(filtered.map((entry) => entry.id)).toEqual(['log'])
    const groups = shapeTimeline(
      entries,
      { ...DEFAULT_TIMELINE_VIEW, groupBy: 'day' },
      'UTC',
      '2025-10-15',
    )
    expect(groups.flatMap((g) => g.entries.map((e) => e.id))).toEqual(['log'])
  })

  it('ignores goals dated after today when annotating a day group', () => {
    const entries = [
      entryFixture({ id: 'a', createdAt: '2026-10-14T08:00:00.000Z' }),
    ]
    const goals = [
      goalFixture({ id: 'today', date: '2026-10-14', done: true }),
      goalFixture({ id: 'tomorrow', date: '2026-10-15', done: false }),
    ]
    const groups = shapeTimeline(
      entries,
      DEFAULT_TIMELINE_VIEW,
      'UTC',
      TODAY,
      goals,
    )
    expect(groups[0].goals).toEqual({ done: 1, total: 1 })
  })
})
