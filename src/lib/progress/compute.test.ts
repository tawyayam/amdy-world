import { describe, expect, it } from 'vitest'
import { computeProgress } from '@/lib/progress'
import type { ProgressInput } from '@/lib/progress'
import {
  entryFixture,
  goalFixture,
  questFixture,
  stepFixture,
} from './test-fixtures'

const TODAY = '2026-10-13'
const UTC = 'UTC'

function input(overrides: Partial<ProgressInput> = {}): ProgressInput {
  return {
    entries: [],
    quests: [],
    goals: [],
    todayKey: TODAY,
    timeZone: UTC,
    ...overrides,
  }
}

describe('computeProgress', () => {
  it('returns level 1 and no XP for empty input', () => {
    const progress = computeProgress(input())
    expect(progress.skillXp).toEqual({
      programming: 0,
      reading: 0,
      learning: 0,
      ideas: 0,
    })
    expect(progress.totalSkillXp).toBe(0)
    expect(progress.bonusXp).toBe(0)
    expect(progress.totalXp).toBe(0)
    expect(progress.overall.level).toBe(1)
    expect(progress.streak).toBe(0)
  })

  it('attributes entry XP to each skill', () => {
    const entries = [
      entryFixture({ id: 'a', type: 'learned', skillId: 'learning' }),
      entryFixture({ id: 'b', type: 'idea', skillId: 'ideas' }),
      entryFixture({
        id: 'c',
        type: 'reading',
        skillId: 'reading',
        meta: { pages: 10 },
      }),
      entryFixture({
        id: 'd',
        type: 'session',
        skillId: 'programming',
        meta: { minutes: 60 },
      }),
      entryFixture({ id: 'e', type: 'note', skillId: null }),
    ]
    const progress = computeProgress(input({ entries }))
    expect(progress.skillXp).toEqual({
      programming: 12,
      reading: 5,
      learning: 15,
      ideas: 10,
    })
    expect(progress.totalSkillXp).toBe(42)
  })

  it('attributes an entry to its stored skill, not its type default', () => {
    // A "Learned" entry the person filed under Programming: the XP amount comes
    // from the type, but it lands on the skill the entry is tagged with.
    const entries = [
      entryFixture({ id: 'a', type: 'learned', skillId: 'programming' }),
    ]
    const progress = computeProgress(input({ entries }))
    expect(progress.skillXp.programming).toBe(15)
    expect(progress.skillXp.learning).toBe(0)
  })

  it('ignores soft-deleted entries', () => {
    const entries = [
      entryFixture({
        type: 'learned',
        skillId: 'learning',
        deletedAt: '2026-10-13T09:00:00.000Z',
      }),
    ]
    expect(computeProgress(input({ entries })).totalSkillXp).toBe(0)
  })

  it('combines quest step, completion, and idea-origin XP', () => {
    const quests = [
      questFixture({
        status: 'done',
        originIdeaId: 'idea-1',
        steps: [
          stepFixture({ id: 'a', done: true }),
          stepFixture({ id: 'b', done: true }),
        ],
      }),
    ]
    const progress = computeProgress(input({ quests }))
    expect(progress.skillXp.programming).toBe(190)
    expect(progress.skillXp.ideas).toBe(50)
  })

  it('sends a quest step and completion XP to the quest skill', () => {
    const quests = [
      questFixture({
        status: 'done',
        skillId: 'learning',
        steps: [stepFixture({ id: 'a', done: true })],
      }),
    ]
    const progress = computeProgress(input({ quests }))
    expect(progress.skillXp.learning).toBe(170)
    expect(progress.skillXp.programming).toBe(0)
    expect(progress.skillXp.ideas).toBe(0)
  })

  it('moves already-earned quest XP when the skill changes', () => {
    // The XP is derived, so re-filing a quest after its steps were done moves
    // the points from the old skill to the new one.
    const before = questFixture({
      skillId: 'programming',
      steps: [stepFixture({ id: 'a', done: true })],
    })
    const after = { ...before, skillId: 'reading' as const }
    expect(
      computeProgress(input({ quests: [before] })).skillXp.programming,
    ).toBe(20)
    expect(
      computeProgress(input({ quests: [after] })).skillXp.programming,
    ).toBe(0)
    expect(computeProgress(input({ quests: [after] })).skillXp.reading).toBe(20)
  })

  it('keeps the idea bonus on ideas even when the quest skill differs', () => {
    const quests = [
      questFixture({
        status: 'done',
        skillId: 'reading',
        originIdeaId: 'idea-1',
      }),
    ]
    const progress = computeProgress(input({ quests }))
    expect(progress.skillXp.reading).toBe(150)
    expect(progress.skillXp.ideas).toBe(50)
  })

  it('ignores soft-deleted quests', () => {
    const quests = [
      questFixture({ status: 'done', deletedAt: '2026-10-13T09:00:00.000Z' }),
    ]
    expect(computeProgress(input({ quests })).totalSkillXp).toBe(0)
  })

  it('awards goal skill XP and an overall-only bonus for a fully done day', () => {
    const goals = [
      goalFixture({
        id: 'a',
        date: TODAY,
        skillId: 'reading',
        done: true,
        doneAt: `${TODAY}T09:00:00.000Z`,
      }),
      goalFixture({
        id: 'b',
        date: TODAY,
        skillId: 'programming',
        done: true,
        doneAt: `${TODAY}T10:00:00.000Z`,
      }),
    ]
    const progress = computeProgress(input({ goals }))
    expect(progress.skillXp.reading).toBe(10)
    expect(progress.skillXp.programming).toBe(10)
    expect(progress.totalSkillXp).toBe(20)
    expect(progress.bonusXp).toBe(20)
    expect(progress.totalXp).toBe(40)
  })

  it('ignores a completed goal dated after today', () => {
    // Ticked ahead of its day: no skill XP, no all-goals bonus, no streak.
    const goals = [
      goalFixture({
        id: 'tomorrow',
        date: '2026-10-14',
        skillId: 'reading',
        done: true,
        doneAt: `${TODAY}T09:00:00.000Z`,
      }),
    ]
    const progress = computeProgress(input({ goals }))
    expect(progress.skillXp.reading).toBe(0)
    expect(progress.bonusXp).toBe(0)
    expect(progress.totalXp).toBe(0)
    expect(progress.streak).toBe(0)
  })

  it('does not award the day bonus while a goal is unfinished', () => {
    const goals = [
      goalFixture({
        id: 'a',
        date: TODAY,
        skillId: 'reading',
        done: true,
        doneAt: `${TODAY}T09:00:00.000Z`,
      }),
      goalFixture({
        id: 'b',
        date: TODAY,
        skillId: 'programming',
        done: false,
      }),
    ]
    const progress = computeProgress(input({ goals }))
    expect(progress.bonusXp).toBe(0)
    expect(progress.totalXp).toBe(10)
  })

  it('computes skill levels and the overall level from totals', () => {
    // 100 XP of learning reaches level 2; the overall level follows the total.
    const entries = Array.from({ length: 7 }, (_, index) =>
      entryFixture({ id: `e${index}`, type: 'learned', skillId: 'learning' }),
    )
    const progress = computeProgress(input({ entries }))
    expect(progress.skillXp.learning).toBe(105)
    expect(progress.skillLevels.learning.level).toBe(2)
    expect(progress.overall.level).toBe(2)
    expect(progress.overall.xpIntoLevel).toBe(5)
  })

  it('includes the streak for the given day context', () => {
    const entries = [
      entryFixture({ id: 'a', createdAt: '2026-10-12T08:00:00.000Z' }),
      entryFixture({ id: 'b', createdAt: '2026-10-13T08:00:00.000Z' }),
    ]
    expect(computeProgress(input({ entries })).streak).toBe(2)
  })
})
