import { describe, expect, it } from 'vitest'
import { computeProgress, detectLevelUps } from '@/lib/progress'
import type { ProgressInput } from '@/lib/progress'
import { entryFixture, questFixture } from './test-fixtures'

const TODAY = '2026-10-13'
const UTC = 'UTC'

function progress(overrides: Partial<ProgressInput> = {}) {
  return computeProgress({
    entries: [],
    quests: [],
    goals: [],
    todayKey: TODAY,
    timeZone: UTC,
    ...overrides,
  })
}

function learnedEntries(count: number, idPrefix = 'e') {
  return Array.from({ length: count }, (_, index) =>
    entryFixture({
      id: `${idPrefix}${index}`,
      type: 'learned',
      skillId: 'learning',
    }),
  )
}

describe('detectLevelUps', () => {
  it('reports nothing when progress is unchanged', () => {
    const before = progress({ entries: learnedEntries(3) })
    const after = progress({ entries: learnedEntries(3) })
    expect(detectLevelUps(before, after)).toEqual([])
  })

  it('reports the overall level-up before the skill level-up', () => {
    const before = progress()
    const after = progress({ entries: learnedEntries(7) })
    expect(detectLevelUps(before, after)).toEqual([
      {
        kind: 'overall',
        fromLevel: 1,
        toLevel: 2,
        fromRank: 'Newcomer',
        toRank: 'Newcomer',
      },
      {
        kind: 'skill',
        skillId: 'learning',
        fromLevel: 1,
        toLevel: 2,
        fromRank: 'Beginner',
        toRank: 'Beginner',
      },
    ])
  })

  it('reports a skill level-up while the overall level stays higher', () => {
    // Programming is already level 3 from two completed quests, so raising
    // learning to level 2 does not move the overall level.
    const quests = [
      questFixture({ id: 'q1', status: 'done' }),
      questFixture({ id: 'q2', status: 'done' }),
    ]
    const before = progress({ quests, entries: learnedEntries(1) })
    const after = progress({ quests, entries: learnedEntries(7) })
    expect(before.overall.level).toBe(3)
    expect(after.overall.level).toBe(3)
    expect(detectLevelUps(before, after)).toEqual([
      {
        kind: 'skill',
        skillId: 'learning',
        fromLevel: 1,
        toLevel: 2,
        fromRank: 'Beginner',
        toRank: 'Beginner',
      },
    ])
  })

  it('reports an overall level-up with no single skill levelling', () => {
    const before = progress({ entries: learnedEntries(6) })
    const after = progress({
      entries: [
        ...learnedEntries(6),
        entryFixture({
          id: 'r',
          type: 'reading',
          skillId: 'reading',
          meta: { pages: 120 },
        }),
      ],
    })
    expect(detectLevelUps(before, after)).toEqual([
      {
        kind: 'overall',
        fromLevel: 1,
        toLevel: 2,
        fromRank: 'Newcomer',
        toRank: 'Newcomer',
      },
    ])
  })

  it('carries the rank change when a level-up crosses a boundary', () => {
    // Four done quests are 600 XP (programming level 4, overall level 4); the
    // fifth takes both to level 5, where the ranks change.
    const fourQuests = [
      questFixture({ id: 'q1', status: 'done' }),
      questFixture({ id: 'q2', status: 'done' }),
      questFixture({ id: 'q3', status: 'done' }),
      questFixture({ id: 'q4', status: 'done' }),
    ]
    const fiveQuests = [
      ...fourQuests,
      questFixture({ id: 'q5', status: 'done' }),
    ]
    const before = progress({ quests: fourQuests })
    const after = progress({ quests: fiveQuests })
    expect(before.overall.level).toBe(4)
    expect(before.skillLevels.programming.level).toBe(4)
    expect(detectLevelUps(before, after)).toEqual([
      {
        kind: 'overall',
        fromLevel: 4,
        toLevel: 5,
        fromRank: 'Newcomer',
        toRank: 'Adventurer',
      },
      {
        kind: 'skill',
        skillId: 'programming',
        fromLevel: 4,
        toLevel: 5,
        fromRank: 'Apprentice',
        toRank: 'Builder',
      },
    ])
  })

  it('reports nothing when XP drops', () => {
    const before = progress({ entries: learnedEntries(7) })
    const after = progress({ entries: learnedEntries(6) })
    expect(detectLevelUps(before, after)).toEqual([])
  })
})
