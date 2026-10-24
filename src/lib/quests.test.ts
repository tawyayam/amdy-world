import { describe, expect, it } from 'vitest'
import {
  activeQuests,
  defaultSkillForPromotion,
  filterQuests,
  groupQuestsByStatus,
  isPromotedToLiveQuest,
  orderQuestsForList,
  QUEST_STATUS_ORDER,
  questLastProgressAt,
  questNextUp,
  questStepProgress,
  questStalledDays,
  STALLED_AFTER_DAYS,
  withAddedStep,
  withCounterDetails,
  withCounterStatusFollowUp,
  withCounterUpdate,
  withMovedStep,
  withQuestDetails,
  withQuestStatus,
  withRemovedLastUpdate,
  withToggledStep,
} from '@/lib/quests'
import {
  counterQuestFixture,
  entryFixture,
  questFixture,
  stepFixture,
} from '@/lib/progress/test-fixtures'

const NOW = '2026-10-14T10:00:00.000Z'

describe('isPromotedToLiveQuest', () => {
  it('is true when the linked quest still exists', () => {
    const entry = entryFixture({
      type: 'idea',
      skillId: 'ideas',
      meta: { promotedToQuestId: 'quest-1' },
    })
    expect(
      isPromotedToLiveQuest(entry, [questFixture({ id: 'quest-1' })]),
    ).toBe(true)
  })

  it('is false when the linked quest is gone (soft-deleted)', () => {
    const entry = entryFixture({
      type: 'idea',
      skillId: 'ideas',
      meta: { promotedToQuestId: 'quest-1' },
    })
    expect(
      isPromotedToLiveQuest(entry, [questFixture({ id: 'quest-2' })]),
    ).toBe(false)
  })

  it('is false for an entry with no promotion meta', () => {
    const entry = entryFixture({ type: 'learned', skillId: 'learning' })
    expect(isPromotedToLiveQuest(entry, [])).toBe(false)
  })
})

describe('defaultSkillForPromotion', () => {
  it('turns an idea into a programming quest', () => {
    const idea = entryFixture({ type: 'idea', skillId: 'ideas' })
    expect(defaultSkillForPromotion(idea)).toBe('programming')
  })

  it('keeps the entry skill for other types', () => {
    const reading = entryFixture({ type: 'reading', skillId: 'reading' })
    expect(defaultSkillForPromotion(reading)).toBe('reading')
  })

  it('falls back to programming when the entry has no skill', () => {
    const note = entryFixture({ type: 'note', skillId: null })
    expect(defaultSkillForPromotion(note)).toBe('programming')
  })
})

describe('filterQuests', () => {
  const quests = [
    questFixture({
      id: 'a',
      status: 'active',
      skillId: 'programming',
      tagIds: ['tag-1'],
    }),
    questFixture({ id: 'b', status: 'done', skillId: 'reading', tagIds: [] }),
    questFixture({
      id: 'c',
      status: 'active',
      skillId: 'reading',
      tagIds: ['tag-2'],
    }),
  ]

  it('returns everything when no facet is narrowed', () => {
    const all = { status: 'all', skillId: 'all', tagId: 'all' } as const
    expect(filterQuests(quests, all).map((quest) => quest.id)).toEqual([
      'a',
      'b',
      'c',
    ])
  })

  it('filters by status, skill, and tag together', () => {
    const filtered = filterQuests(quests, {
      status: 'active',
      skillId: 'reading',
      tagId: 'tag-2',
    })
    expect(filtered.map((quest) => quest.id)).toEqual(['c'])
  })

  it('drops quests missing the requested tag', () => {
    const filtered = filterQuests(quests, {
      status: 'all',
      skillId: 'all',
      tagId: 'tag-1',
    })
    expect(filtered.map((quest) => quest.id)).toEqual(['a'])
  })
})

describe('activeQuests', () => {
  it('keeps only in-progress quests', () => {
    const quests = [
      questFixture({ id: 'a', status: 'active' }),
      questFixture({ id: 'b', status: 'paused' }),
      questFixture({ id: 'c', status: 'done' }),
    ]
    expect(activeQuests(quests).map((quest) => quest.id)).toEqual(['a'])
  })
})

describe('questStepProgress', () => {
  it('counts done and total steps', () => {
    const quest = questFixture({
      steps: [
        stepFixture({ id: 'a', done: true }),
        stepFixture({ id: 'b', done: false }),
      ],
    })
    expect(questStepProgress(quest)).toEqual({ done: 1, total: 2 })
  })

  it('reports zero of zero for a quest without steps', () => {
    expect(questStepProgress(questFixture())).toEqual({ done: 0, total: 0 })
  })
})

describe('orderQuestsForList', () => {
  it('lists the newest quests first', () => {
    const quests = [
      questFixture({ id: 'oldest', createdAt: '2026-10-01T00:00:00.000Z' }),
      questFixture({ id: 'newest', createdAt: '2026-10-10T00:00:00.000Z' }),
      questFixture({ id: 'middle', createdAt: '2026-10-05T00:00:00.000Z' }),
    ]
    expect(orderQuestsForList(quests).map((quest) => quest.id)).toEqual([
      'newest',
      'middle',
      'oldest',
    ])
  })
})

describe('groupQuestsByStatus', () => {
  it('buckets quests by status, each newest first, keeping empty buckets', () => {
    const quests = [
      questFixture({
        id: 'active-old',
        status: 'active',
        createdAt: '2026-10-01T00:00:00.000Z',
      }),
      questFixture({
        id: 'active-new',
        status: 'active',
        createdAt: '2026-10-10T00:00:00.000Z',
      }),
      questFixture({ id: 'done', status: 'done' }),
    ]
    const groups = groupQuestsByStatus(quests)
    expect(groups.active.map((quest) => quest.id)).toEqual([
      'active-new',
      'active-old',
    ])
    expect(groups.paused).toEqual([])
    expect(groups.done.map((quest) => quest.id)).toEqual(['done'])
  })

  it('exposes the section order Active, Paused, Completed', () => {
    expect(QUEST_STATUS_ORDER).toEqual(['active', 'paused', 'done'])
  })
})

describe('withAddedStep', () => {
  it('appends the step and stamps updatedAt', () => {
    const quest = questFixture()
    const step = stepFixture({ id: 'new' })
    const updated = withAddedStep(quest, step, NOW)
    expect(updated.steps).toEqual([step])
    expect(updated.updatedAt).toBe(NOW)
    expect(quest.steps).toEqual([])
  })
})

describe('withToggledStep', () => {
  it('marks a step done and stamps doneAt', () => {
    const quest = questFixture({ steps: [stepFixture({ id: 'a' })] })
    const updated = withToggledStep(quest, 'a', NOW)
    expect(updated.steps[0]).toMatchObject({ done: true, doneAt: NOW })
    expect(updated.updatedAt).toBe(NOW)
  })

  it('unmarks a done step and clears doneAt', () => {
    const quest = questFixture({
      steps: [stepFixture({ id: 'a', done: true, doneAt: NOW })],
    })
    const updated = withToggledStep(quest, 'a', NOW)
    expect(updated.steps[0]).toMatchObject({ done: false, doneAt: null })
  })

  it('leaves other steps untouched', () => {
    const quest = questFixture({
      steps: [stepFixture({ id: 'a' }), stepFixture({ id: 'b' })],
    })
    const updated = withToggledStep(quest, 'a', NOW)
    expect(updated.steps[1]).toEqual(quest.steps[1])
  })
})

describe('withMovedStep', () => {
  const quest = questFixture({
    steps: [
      stepFixture({ id: 'a' }),
      stepFixture({ id: 'b' }),
      stepFixture({ id: 'c' }),
    ],
  })

  it('moves a step up', () => {
    const updated = withMovedStep(quest, 'b', 'up', NOW)
    expect(updated.steps.map((step) => step.id)).toEqual(['b', 'a', 'c'])
    expect(updated.updatedAt).toBe(NOW)
  })

  it('moves a step down', () => {
    const updated = withMovedStep(quest, 'b', 'down', NOW)
    expect(updated.steps.map((step) => step.id)).toEqual(['a', 'c', 'b'])
  })

  it('does nothing at the top edge', () => {
    expect(withMovedStep(quest, 'a', 'up', NOW)).toBe(quest)
  })

  it('does nothing at the bottom edge', () => {
    expect(withMovedStep(quest, 'c', 'down', NOW)).toBe(quest)
  })

  it('does nothing for an unknown step', () => {
    expect(withMovedStep(quest, 'missing', 'up', NOW)).toBe(quest)
  })
})

describe('withQuestStatus', () => {
  it('sets completedAt when a quest is done', () => {
    const updated = withQuestStatus(questFixture(), 'done', NOW)
    expect(updated.status).toBe('done')
    expect(updated.completedAt).toBe(NOW)
    expect(updated.updatedAt).toBe(NOW)
  })

  it('clears completedAt when a quest is reopened or paused', () => {
    const done = questFixture({ status: 'done', completedAt: NOW })
    expect(withQuestStatus(done, 'active', NOW).completedAt).toBeNull()
    expect(withQuestStatus(done, 'paused', NOW).completedAt).toBeNull()
  })
})

describe('withQuestDetails', () => {
  it('updates the title, description, skill, and tags', () => {
    const updated = withQuestDetails(
      questFixture(),
      {
        title: 'New title',
        description: 'New description',
        skillId: 'learning',
        tagIds: ['tag-1', 'tag-2'],
      },
      NOW,
    )
    expect(updated).toMatchObject({
      title: 'New title',
      description: 'New description',
      skillId: 'learning',
      tagIds: ['tag-1', 'tag-2'],
      updatedAt: NOW,
    })
  })
})

describe('withCounterUpdate', () => {
  it('appends the update and stamps updatedAt', () => {
    const quest = counterQuestFixture()
    const update = { id: 'u1', at: NOW, delta: 2 }
    const updated = withCounterUpdate(quest, update, NOW)
    expect(updated.counter?.updates).toEqual([update])
    expect(updated.updatedAt).toBe(NOW)
    expect(quest.counter?.updates).toEqual([])
  })

  it('leaves a steps quest untouched', () => {
    const quest = questFixture()
    const update = { id: 'u1', at: NOW, delta: 2 }
    expect(withCounterUpdate(quest, update, NOW)).toBe(quest)
  })
})

describe('withRemovedLastUpdate', () => {
  it('drops the most recent update', () => {
    const quest = counterQuestFixture({
      updates: [
        { id: 'u1', at: '2026-10-13T08:00:00.000Z', delta: 3 },
        { id: 'u2', at: NOW, delta: 1 },
      ],
    })
    const updated = withRemovedLastUpdate(quest, NOW)
    expect(updated.counter?.updates.map((item) => item.id)).toEqual(['u1'])
    expect(updated.updatedAt).toBe(NOW)
  })

  it('is a no-op when the log is empty', () => {
    const quest = counterQuestFixture()
    expect(withRemovedLastUpdate(quest, NOW)).toBe(quest)
  })
})

describe('withCounterStatusFollowUp', () => {
  it('completes the quest once the value reaches the total', () => {
    const quest = counterQuestFixture({
      updates: [{ id: 'u1', at: NOW, delta: 12 }],
    })
    const updated = withCounterStatusFollowUp(quest, NOW)
    expect(updated.status).toBe('done')
    expect(updated.completedAt).toBe(NOW)
  })

  it('stays active below the total', () => {
    const quest = counterQuestFixture({
      updates: [{ id: 'u1', at: NOW, delta: 5 }],
    })
    expect(withCounterStatusFollowUp(quest, NOW).status).toBe('active')
  })

  it('reopens a completed quest when the value drops below the total', () => {
    const quest = counterQuestFixture(
      {
        updates: [
          { id: 'u1', at: '2026-10-13T08:00:00.000Z', delta: 12 },
          { id: 'u2', at: NOW, delta: -4 },
        ],
      },
      { status: 'done', completedAt: '2026-10-13T08:00:00.000Z' },
    )
    const updated = withCounterStatusFollowUp(quest, NOW)
    expect(updated.status).toBe('active')
    expect(updated.completedAt).toBeNull()
    expect(updated.updatedAt).toBe(NOW)
  })

  it('leaves a paused quest paused when the value reaches the total', () => {
    const quest = counterQuestFixture(
      { updates: [{ id: 'u1', at: NOW, delta: 12 }] },
      { status: 'paused', completedAt: null },
    )
    const updated = withCounterStatusFollowUp(quest, NOW)
    expect(updated.status).toBe('paused')
    expect(updated.completedAt).toBeNull()
  })

  it('leaves a paused quest paused when the value drops below the total', () => {
    const quest = counterQuestFixture(
      {
        updates: [
          { id: 'u1', at: '2026-10-13T08:00:00.000Z', delta: 12 },
          { id: 'u2', at: NOW, delta: -4 },
        ],
      },
      { status: 'paused', completedAt: null },
    )
    expect(withCounterStatusFollowUp(quest, NOW).status).toBe('paused')
  })

  it('is a no-op when the status already matches the count', () => {
    const short = counterQuestFixture({
      updates: [{ id: 'u1', at: NOW, delta: 5 }],
    })
    expect(withCounterStatusFollowUp(short, NOW)).toBe(short)
    const finished = counterQuestFixture(
      { updates: [{ id: 'u1', at: NOW, delta: 12 }] },
      { status: 'done', completedAt: NOW },
    )
    expect(withCounterStatusFollowUp(finished, NOW)).toBe(finished)
  })

  it('never touches a steps quest', () => {
    const quest = questFixture()
    expect(withCounterStatusFollowUp(quest, NOW)).toBe(quest)
  })
})

describe('withCounterDetails', () => {
  it('updates unit, total, and sections', () => {
    const quest = counterQuestFixture()
    const updated = withCounterDetails(
      quest,
      {
        unit: 'chapter',
        total: 8,
        sections: [{ id: 's1', title: 'Halfway', endAt: 4 }],
      },
      NOW,
    )
    expect(updated.counter).toMatchObject({
      unit: 'chapter',
      total: 8,
      sections: [{ id: 's1', title: 'Halfway', endAt: 4 }],
    })
    expect(updated.updatedAt).toBe(NOW)
  })

  it('clears sections when the last one is removed', () => {
    const quest = counterQuestFixture({
      sections: [{ id: 's1', title: 'Basics', endAt: 12 }],
    })
    const updated = withCounterDetails(
      quest,
      { unit: 'lesson', total: 12, sections: [] },
      NOW,
    )
    expect(updated.counter?.sections).toBeUndefined()
  })

  it('keeps the start value and the update log', () => {
    const quest = counterQuestFixture({
      startValue: 2,
      updates: [{ id: 'u1', at: NOW, delta: 1 }],
    })
    const updated = withCounterDetails(
      quest,
      { unit: 'lesson', total: 10, sections: [] },
      NOW,
    )
    expect(updated.counter?.startValue).toBe(2)
    expect(updated.counter?.updates).toHaveLength(1)
  })

  it('leaves a steps quest untouched', () => {
    const quest = questFixture()
    expect(
      withCounterDetails(quest, { unit: 'x', total: 1, sections: [] }, NOW),
    ).toBe(quest)
  })
})

describe('questNextUp', () => {
  it('is the next unit value on a counter', () => {
    const quest = counterQuestFixture({
      updates: [{ id: 'u1', at: NOW, delta: 5 }],
    })
    expect(questNextUp(quest)).toEqual({
      kind: 'counter',
      nextValue: 6,
      unit: 'lesson',
    })
  })

  it('is the first unfinished step on a steps quest', () => {
    const quest = questFixture({
      steps: [
        stepFixture({ id: 'a', done: true, doneAt: NOW }),
        stepFixture({ id: 'b', title: 'Ship it' }),
      ],
    })
    expect(questNextUp(quest)).toEqual({ kind: 'step', title: 'Ship it' })
  })

  it('is null when a counter is complete', () => {
    const quest = counterQuestFixture({
      updates: [{ id: 'u1', at: NOW, delta: 12 }],
    })
    expect(questNextUp(quest)).toBeNull()
  })

  it('is null when a steps quest is done', () => {
    expect(questNextUp(questFixture({ status: 'done' }))).toBeNull()
  })
})

describe('questLastProgressAt', () => {
  it('is the latest counter update', () => {
    const quest = counterQuestFixture({
      updates: [
        { id: 'u1', at: '2026-10-13T08:00:00.000Z', delta: 1 },
        { id: 'u2', at: '2026-10-14T09:00:00.000Z', delta: 1 },
      ],
    })
    expect(questLastProgressAt(quest, [])).toBe('2026-10-14T09:00:00.000Z')
  })

  it('is the latest of steps, updates, and linked entries', () => {
    const quest = counterQuestFixture({
      updates: [{ id: 'u1', at: '2026-10-12T08:00:00.000Z', delta: 1 }],
    })
    const entries = [
      entryFixture({
        id: 'e1',
        createdAt: '2026-10-14T07:00:00.000Z',
        meta: { questId: quest.id },
      }),
      entryFixture({ id: 'e2', createdAt: '2026-10-13T07:00:00.000Z' }),
    ]
    expect(questLastProgressAt(quest, entries)).toBe('2026-10-14T07:00:00.000Z')
  })

  it('counts a promotion link as progress', () => {
    const quest = questFixture()
    const entries = [
      entryFixture({
        id: 'e1',
        createdAt: '2026-10-14T07:00:00.000Z',
        meta: { promotedToQuestId: quest.id },
      }),
    ]
    expect(questLastProgressAt(quest, entries)).toBe('2026-10-14T07:00:00.000Z')
  })

  it('ignores soft-deleted entries', () => {
    const quest = questFixture()
    const entries = [
      entryFixture({
        id: 'e1',
        createdAt: '2026-10-14T07:00:00.000Z',
        deletedAt: '2026-10-14T08:00:00.000Z',
        meta: { questId: quest.id },
      }),
    ]
    expect(questLastProgressAt(quest, entries)).toBeNull()
  })

  it('is null when nothing ever progressed', () => {
    expect(questLastProgressAt(questFixture(), [])).toBeNull()
  })
})

describe('questStalledDays', () => {
  it('counts whole local days since the last progress', () => {
    expect(
      questStalledDays('2026-10-10T23:00:00.000Z', '2026-10-14', 'UTC'),
    ).toBe(4)
  })

  it('is zero when the last progress was today', () => {
    expect(
      questStalledDays('2026-10-14T01:00:00.000Z', '2026-10-14', 'UTC'),
    ).toBe(0)
  })

  it('groups by the given time zone', () => {
    // 02:00 UTC is still the previous day in New York (UTC-4 in October).
    expect(
      questStalledDays(
        '2026-10-14T02:00:00.000Z',
        '2026-10-14',
        'America/New_York',
      ),
    ).toBe(1)
  })

  it('is null when the quest has never progressed', () => {
    expect(questStalledDays(null, '2026-10-14', 'UTC')).toBeNull()
  })

  it('exposes the 7-day stall threshold', () => {
    expect(STALLED_AFTER_DAYS).toBe(7)
  })
})
