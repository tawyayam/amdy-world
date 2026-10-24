import { describe, expect, it } from 'vitest'
import { SCHEMA_VERSION } from './common'
import { parseExportData } from './export'
import { createDefaultSettings } from './settings'

const ENTRY_ID = '11111111-1111-4111-8111-111111111111'
const TIMESTAMP = '2026-10-13T09:00:00.000Z'

function validPayload() {
  return {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: TIMESTAMP,
    entries: [
      {
        id: ENTRY_ID,
        type: 'reading',
        text: 'Read "Refactoring"',
        skillId: 'reading',
        isSample: true,
        meta: { pages: 12, bookTitle: 'Refactoring' },
        createdAt: TIMESTAMP,
        updatedAt: TIMESTAMP,
        deletedAt: null,
      },
    ],
    quests: [] as Record<string, unknown>[],
    tags: [] as Record<string, unknown>[],
    goalTemplates: [],
    dailyGoals: [],
    settings: createDefaultSettings(),
  }
}

function questPayload(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    id: '22222222-2222-4222-8222-222222222222',
    title: 'Build Amdy.world',
    description: 'Ship the RPG tracker',
    status: 'active',
    skillId: 'programming',
    tagIds: [],
    kind: 'steps',
    steps: [],
    createdAt: TIMESTAMP,
    updatedAt: TIMESTAMP,
    deletedAt: null,
    ...overrides,
  }
}

describe('parseExportData', () => {
  it('accepts a valid export, including a JSON round-trip', () => {
    const payload = validPayload()
    const parsed = parseExportData(JSON.parse(JSON.stringify(payload)))
    expect(parsed).toEqual(payload)
  })

  it('rejects a payload without a schema version', () => {
    const payload: Record<string, unknown> = { ...validPayload() }
    delete payload.schemaVersion
    expect(() => parseExportData(payload)).toThrow()
  })

  it('rejects an unknown entry type', () => {
    const payload = validPayload()
    const invalid = {
      ...payload,
      entries: [{ ...payload.entries[0], type: 'diary' }],
    }
    expect(() => parseExportData(invalid)).toThrow()
  })

  it('rejects an id that is not a UUID', () => {
    const payload = validPayload()
    const invalid = {
      ...payload,
      entries: [{ ...payload.entries[0], id: 'not-a-uuid' }],
    }
    expect(() => parseExportData(invalid)).toThrow()
  })

  it('accepts settings without a timeline view (older exports)', () => {
    const payload = validPayload()
    const parsed = parseExportData(payload)
    expect(parsed.settings.timelineView).toBeUndefined()
  })

  it('accepts settings with a timeline view', () => {
    const payload = validPayload()
    payload.settings = {
      ...payload.settings,
      timelineView: { groupBy: 'week', sort: 'oldest', layout: 'grid' },
    }
    const parsed = parseExportData(payload)
    expect(parsed.settings.timelineView).toEqual({
      groupBy: 'week',
      sort: 'oldest',
      layout: 'grid',
    })
  })

  it('defaults the layout to list for settings that stored a density', () => {
    const payload = validPayload()
    ;(payload.settings as unknown as Record<string, unknown>).timelineView = {
      groupBy: 'week',
      sort: 'oldest',
      density: 'compact',
    }
    const parsed = parseExportData(payload)
    expect(parsed.settings.timelineView).toEqual({
      groupBy: 'week',
      sort: 'oldest',
      layout: 'list',
    })
  })

  it('maps a retired "type" grouping to day', () => {
    const payload = validPayload()
    ;(payload.settings as unknown as Record<string, unknown>).timelineView = {
      groupBy: 'type',
      sort: 'newest',
      layout: 'grid',
    }
    const parsed = parseExportData(payload)
    expect(parsed.settings.timelineView).toEqual({
      groupBy: 'day',
      sort: 'newest',
      layout: 'grid',
    })
  })

  it('rejects an unknown timeline grouping', () => {
    const payload = validPayload()
    const invalid = {
      ...payload,
      settings: {
        ...payload.settings,
        timelineView: { groupBy: 'month', sort: 'newest', layout: 'grid' },
      },
    }
    expect(() => parseExportData(invalid)).toThrow()
  })

  it('accepts tag records and defaults the color when it is omitted', () => {
    const payload = validPayload()
    payload.tags = [
      {
        id: '33333333-3333-4333-8333-333333333333',
        name: 'frontend',
        createdAt: TIMESTAMP,
        updatedAt: TIMESTAMP,
        deletedAt: null,
      },
    ]
    const parsed = parseExportData(payload)
    expect(parsed.tags[0]?.name).toBe('frontend')
    expect(parsed.tags[0]?.colorToken).toBeUndefined()
  })

  it('rejects an unknown tag color', () => {
    const payload = validPayload()
    payload.tags = [
      {
        id: '33333333-3333-4333-8333-333333333333',
        name: 'frontend',
        colorToken: 'chartreuse',
        createdAt: TIMESTAMP,
        updatedAt: TIMESTAMP,
        deletedAt: null,
      },
    ]
    expect(() => parseExportData(payload)).toThrow()
  })

  it('imports an older payload with no tags list as an empty list', () => {
    const payload = validPayload()
    const older: Record<string, unknown> = { ...payload }
    delete older.tags
    expect(parseExportData(older).tags).toEqual([])
  })

  it('fills a quest skill, tags, and kind added after the first format', () => {
    const payload = validPayload()
    const olderQuest = questPayload()
    delete olderQuest.skillId
    delete olderQuest.tagIds
    delete olderQuest.kind
    payload.quests = [olderQuest]
    const parsed = parseExportData(payload)
    expect(parsed.quests[0]).toMatchObject({
      skillId: 'programming',
      tagIds: [],
      kind: 'steps',
    })
  })

  it('imports a counter quest with its sections and updates', () => {
    const payload = validPayload()
    payload.quests = [
      questPayload({
        kind: 'counter',
        counter: {
          unit: 'lesson',
          total: 12,
          startValue: 0,
          sections: [
            {
              id: '44444444-4444-4444-8444-444444444444',
              title: 'Basics',
              endAt: 4,
            },
            {
              id: '55555555-5555-4555-8555-555555555555',
              title: 'Deep dive',
              endAt: 12,
            },
          ],
          updates: [
            {
              id: '66666666-6666-4666-8666-666666666666',
              at: TIMESTAMP,
              delta: 3,
            },
          ],
        },
      }),
    ]
    const parsed = parseExportData(payload)
    expect(parsed.quests[0]?.counter).toEqual({
      unit: 'lesson',
      total: 12,
      startValue: 0,
      sections: [
        {
          id: '44444444-4444-4444-8444-444444444444',
          title: 'Basics',
          endAt: 4,
        },
        {
          id: '55555555-5555-4555-8555-555555555555',
          title: 'Deep dive',
          endAt: 12,
        },
      ],
      updates: [
        {
          id: '66666666-6666-4666-8666-666666666666',
          at: TIMESTAMP,
          delta: 3,
        },
      ],
    })
  })

  it('rejects a counter whose last section does not end at the total', () => {
    const payload = validPayload()
    payload.quests = [
      questPayload({
        kind: 'counter',
        counter: {
          unit: 'lesson',
          total: 12,
          startValue: 0,
          sections: [
            {
              id: '44444444-4444-4444-8444-444444444444',
              title: 'Basics',
              endAt: 4,
            },
          ],
          updates: [],
        },
      }),
    ]
    expect(() => parseExportData(payload)).toThrow()
  })
})
