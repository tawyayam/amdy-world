import { describe, expect, it } from 'vitest'
import {
  counterAtTotal,
  counterCurrentValue,
  counterCurrentSection,
  counterMilestones,
  counterMilestoneReachedOn,
  counterMilestoneXp,
  counterNextMilestone,
  questCounter,
} from '@/lib/progress'
import { counterQuestFixture } from './test-fixtures'
import type { QuestCounterUpdate } from '@/lib/types'

const UTC = 'UTC'

function update(delta: number, at: string): QuestCounterUpdate {
  return { id: `update-${delta}-${at}`, at, delta }
}

describe('questCounter', () => {
  it('returns the counter of a counter quest', () => {
    const quest = counterQuestFixture()
    expect(questCounter(quest)?.unit).toBe('lesson')
  })

  it('is null for a steps quest', () => {
    expect(questCounter(counterQuestFixture({}, { kind: 'steps' }))).toBeNull()
  })
})

describe('counterCurrentValue', () => {
  it('is the starting value when nothing was recorded', () => {
    expect(counterCurrentValue(counterQuestFixture())).toBe(0)
  })

  it('sums the deltas onto the starting value', () => {
    const quest = counterQuestFixture({
      updates: [
        update(3, '2026-10-13T08:00:00.000Z'),
        update(2, '2026-10-13T09:00:00.000Z'),
      ],
    })
    expect(counterCurrentValue(quest)).toBe(5)
  })

  it('clamps at the total', () => {
    const quest = counterQuestFixture({
      total: 4,
      updates: [update(10, '2026-10-13T08:00:00.000Z')],
    })
    expect(counterCurrentValue(quest)).toBe(4)
  })

  it('pulls the value back down for a negative correction', () => {
    const quest = counterQuestFixture({
      updates: [
        update(5, '2026-10-13T08:00:00.000Z'),
        update(-2, '2026-10-13T09:00:00.000Z'),
      ],
    })
    expect(counterCurrentValue(quest)).toBe(3)
  })

  it('never goes below zero', () => {
    const quest = counterQuestFixture({
      updates: [update(-5, '2026-10-13T08:00:00.000Z')],
    })
    expect(counterCurrentValue(quest)).toBe(0)
  })
})

describe('counterAtTotal', () => {
  it('is true once the value reaches the total', () => {
    const quest = counterQuestFixture({
      updates: [update(12, '2026-10-13T08:00:00.000Z')],
    })
    expect(counterAtTotal(quest)).toBe(true)
  })

  it('is false while the value is still short of the total', () => {
    const quest = counterQuestFixture({
      updates: [update(5, '2026-10-13T08:00:00.000Z')],
    })
    expect(counterAtTotal(quest)).toBe(false)
  })

  it('is false for a steps quest', () => {
    expect(counterAtTotal(counterQuestFixture({}, { kind: 'steps' }))).toBe(
      false,
    )
  })
})

describe('counterMilestones', () => {
  it('defaults to 25, 50, and 75 percent of the total', () => {
    expect(counterMilestones(counterQuestFixture())).toEqual([3, 6, 9])
  })

  it('uses section ends when sections exist, dropping the total itself', () => {
    const quest = counterQuestFixture({
      sections: [
        { id: 's1', title: 'Basics', endAt: 4 },
        { id: 's2', title: 'Practice', endAt: 8 },
        { id: 's3', title: 'Capstone', endAt: 12 },
      ],
    })
    expect(counterMilestones(quest)).toEqual([4, 8])
  })

  it('merges duplicate rounded-up values and sorts them', () => {
    expect(counterMilestones(counterQuestFixture({ total: 3 }))).toEqual([1, 2])
  })

  it('is empty when every candidate equals the total', () => {
    expect(counterMilestones(counterQuestFixture({ total: 1 }))).toEqual([])
  })

  it('is empty for a steps quest', () => {
    expect(
      counterMilestones(counterQuestFixture({}, { kind: 'steps' })),
    ).toEqual([])
  })
})

describe('counterNextMilestone', () => {
  it('is the first milestone above the current value', () => {
    const quest = counterQuestFixture({
      updates: [update(1, '2026-10-13T08:00:00.000Z')],
    })
    expect(counterNextMilestone(quest)).toBe(3)
  })

  it('skips milestones already reached', () => {
    const quest = counterQuestFixture({
      updates: [update(6, '2026-10-13T08:00:00.000Z')],
    })
    expect(counterNextMilestone(quest)).toBe(9)
  })

  it('is null when the quest is complete', () => {
    const quest = counterQuestFixture({
      updates: [update(12, '2026-10-13T08:00:00.000Z')],
    })
    expect(counterNextMilestone(quest)).toBeNull()
  })
})

describe('counterMilestoneXp', () => {
  it('grants 25 XP per reached milestone', () => {
    const quest = counterQuestFixture({
      updates: [update(3, '2026-10-13T08:00:00.000Z')],
    })
    expect(counterMilestoneXp(quest)).toBe(25)
  })

  it('stacks for every milestone passed at once', () => {
    const quest = counterQuestFixture({
      updates: [update(9, '2026-10-13T08:00:00.000Z')],
    })
    expect(counterMilestoneXp(quest)).toBe(75)
  })

  it('shrinks when a correction lowers the value below a milestone', () => {
    const quest = counterQuestFixture({
      updates: [
        update(9, '2026-10-13T08:00:00.000Z'),
        update(-4, '2026-10-13T09:00:00.000Z'),
      ],
    })
    expect(counterMilestoneXp(quest)).toBe(25)
  })
})

describe('counterMilestoneReachedOn', () => {
  it('is the local day the update crossed the milestone', () => {
    const quest = counterQuestFixture({
      updates: [
        update(2, '2026-10-12T20:00:00.000Z'),
        update(2, '2026-10-13T09:00:00.000Z'),
      ],
    })
    expect(counterMilestoneReachedOn(quest, 3, UTC)).toBe('2026-10-13')
  })

  it('replays out-of-order updates by timestamp', () => {
    // Listed newest-first; sorting by `at` matters, otherwise the crossing
    // would be blamed on the wrong day.
    const quest = counterQuestFixture({
      updates: [
        update(2, '2026-10-13T09:00:00.000Z'),
        update(2, '2026-10-12T20:00:00.000Z'),
      ],
    })
    expect(counterMilestoneReachedOn(quest, 3, UTC)).toBe('2026-10-13')
  })

  it('is null when only the starting value reached it', () => {
    const quest = counterQuestFixture({ startValue: 3 })
    expect(counterMilestoneReachedOn(quest, 3, UTC)).toBeNull()
  })

  it('is null when the milestone is not reached yet', () => {
    const quest = counterQuestFixture({
      updates: [update(1, '2026-10-13T08:00:00.000Z')],
    })
    expect(counterMilestoneReachedOn(quest, 3, UTC)).toBeNull()
  })
})

describe('counterCurrentSection', () => {
  const sectioned = counterQuestFixture({
    updates: [update(5, '2026-10-13T08:00:00.000Z')],
    sections: [
      { id: 's1', title: 'Basics', endAt: 4 },
      { id: 's2', title: 'Practice', endAt: 8 },
      { id: 's3', title: 'Capstone', endAt: 12 },
    ],
  })

  it('places the value in its section with in-section progress', () => {
    expect(counterCurrentSection(sectioned)).toEqual({
      title: 'Practice',
      number: 2,
      value: 1,
      size: 4,
    })
  })

  it('starts in the first section at zero', () => {
    expect(
      counterCurrentSection(
        counterQuestFixture({
          sections: [
            { id: 's1', title: 'Basics', endAt: 6 },
            { id: 's2', title: 'More', endAt: 12 },
          ],
        }),
      ),
    ).toMatchObject({ title: 'Basics', value: 0 })
  })

  it('is null when the quest has no sections', () => {
    expect(counterCurrentSection(counterQuestFixture())).toBeNull()
  })
})
