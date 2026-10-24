import { describe, expect, it } from 'vitest'
import { xpAwardsForQuest, xpForQuestStep } from '@/lib/progress'
import { withCounterStatusFollowUp, withCounterUpdate } from '@/lib/quests'
import { counterQuestFixture, questFixture, stepFixture } from './test-fixtures'

const RAISED_AT = '2026-10-13T10:00:00.000Z'
const RESTORED_AT = '2026-10-13T11:00:00.000Z'

describe('xpForQuestStep', () => {
  it('grants 20 XP once a step is done', () => {
    expect(xpForQuestStep(stepFixture({ done: true }))).toBe(20)
  })

  it('grants nothing for an unfinished step', () => {
    expect(xpForQuestStep(stepFixture({ done: false }))).toBe(0)
  })
})

describe('xpAwardsForQuest', () => {
  it('awards nothing for an empty active quest', () => {
    expect(xpAwardsForQuest(questFixture())).toEqual([])
  })

  it('awards 20 XP to programming per completed step', () => {
    const quest = questFixture({
      steps: [
        stepFixture({ id: 'a', done: true }),
        stepFixture({ id: 'b', done: false }),
        stepFixture({ id: 'c', done: true }),
      ],
    })
    expect(xpAwardsForQuest(quest)).toEqual([
      { skillId: 'programming', amount: 40 },
    ])
  })

  it('adds 150 XP to programming for completing the quest', () => {
    const quest = questFixture({
      status: 'done',
      completedAt: '2026-10-13T09:00:00.000Z',
    })
    expect(xpAwardsForQuest(quest)).toEqual([
      { skillId: 'programming', amount: 150 },
    ])
  })

  it('adds 50 XP to ideas when the completed quest came from an idea', () => {
    const quest = questFixture({
      status: 'done',
      originIdeaId: 'entry-idea',
      steps: [stepFixture({ done: true })],
    })
    expect(xpAwardsForQuest(quest)).toEqual([
      { skillId: 'programming', amount: 20 },
      { skillId: 'programming', amount: 150 },
      { skillId: 'ideas', amount: 50 },
    ])
  })

  it('does not award the idea bonus while the quest is unfinished', () => {
    const quest = questFixture({ originIdeaId: 'entry-idea' })
    expect(xpAwardsForQuest(quest)).toEqual([])
  })

  it('awards 25 XP to the quest skill per reached counter milestone', () => {
    const quest = counterQuestFixture({
      updates: [
        {
          id: 'u1',
          at: '2026-10-13T09:00:00.000Z',
          delta: 6,
        },
      ],
    })
    expect(xpAwardsForQuest(quest)).toEqual([
      { skillId: 'programming', amount: 50 },
    ])
  })

  it('awards milestones plus completion XP for a finished counter', () => {
    const quest = counterQuestFixture(
      { updates: [{ id: 'u1', at: '2026-10-13T09:00:00.000Z', delta: 12 }] },
      { status: 'done', completedAt: '2026-10-13T09:00:00.000Z' },
    )
    expect(xpAwardsForQuest(quest)).toEqual([
      { skillId: 'programming', amount: 75 },
      { skillId: 'programming', amount: 150 },
    ])
  })

  it('drops the completion XP while a done counter sits below its total', () => {
    const quest = counterQuestFixture(
      { updates: [{ id: 'u1', at: '2026-10-13T09:00:00.000Z', delta: 6 }] },
      { status: 'done', completedAt: '2026-10-13T09:00:00.000Z' },
    )
    expect(xpAwardsForQuest(quest)).toEqual([
      { skillId: 'programming', amount: 50 },
    ])
  })

  it('reopens a Set-to correction below the total, losing the completion XP and the idea bonus', () => {
    const done = counterQuestFixture(
      { updates: [{ id: 'u1', at: '2026-10-13T09:00:00.000Z', delta: 12 }] },
      {
        status: 'done',
        completedAt: '2026-10-13T09:00:00.000Z',
        originIdeaId: 'entry-idea',
      },
    )
    const lowered = withCounterStatusFollowUp(
      withCounterUpdate(
        done,
        { id: 'u2', at: RAISED_AT, delta: -4 },
        RAISED_AT,
      ),
      RAISED_AT,
    )
    expect(lowered.status).toBe('active')
    expect(lowered.completedAt).toBeNull()
    expect(xpAwardsForQuest(lowered)).toEqual([
      { skillId: 'programming', amount: 50 },
    ])
  })

  it('keeps one completion XP and one idea bonus when a lowered counter is set back to the total', () => {
    const done = counterQuestFixture(
      { updates: [{ id: 'u1', at: '2026-10-13T09:00:00.000Z', delta: 12 }] },
      {
        status: 'done',
        completedAt: '2026-10-13T09:00:00.000Z',
        originIdeaId: 'entry-idea',
      },
    )
    const restored = withCounterStatusFollowUp(
      withCounterUpdate(
        withCounterStatusFollowUp(
          withCounterUpdate(
            done,
            { id: 'u2', at: RAISED_AT, delta: -4 },
            RAISED_AT,
          ),
          RAISED_AT,
        ),
        { id: 'u3', at: RESTORED_AT, delta: 4 },
        RESTORED_AT,
      ),
      RESTORED_AT,
    )
    expect(restored.status).toBe('done')
    expect(xpAwardsForQuest(restored)).toEqual([
      { skillId: 'programming', amount: 75 },
      { skillId: 'programming', amount: 150 },
      { skillId: 'ideas', amount: 50 },
    ])
  })

  it('gives no extra completion XP when a done counter is set to the same total', () => {
    const done = counterQuestFixture(
      { updates: [{ id: 'u1', at: '2026-10-13T09:00:00.000Z', delta: 12 }] },
      { status: 'done', completedAt: '2026-10-13T09:00:00.000Z' },
    )
    const same = withCounterStatusFollowUp(
      withCounterUpdate(
        done,
        { id: 'u2', at: RESTORED_AT, delta: 0 },
        RESTORED_AT,
      ),
      RESTORED_AT,
    )
    expect(same.status).toBe('done')
    expect(xpAwardsForQuest(same)).toEqual([
      { skillId: 'programming', amount: 75 },
      { skillId: 'programming', amount: 150 },
    ])
  })

  it('drops the completion XP when a done counter has no counter data', () => {
    const quest = counterQuestFixture(
      {},
      {
        status: 'done',
        completedAt: '2026-10-13T09:00:00.000Z',
        counter: undefined,
      },
    )
    expect(xpAwardsForQuest(quest)).toEqual([])
  })

  it('ignores steps on a counter quest', () => {
    const quest = counterQuestFixture(
      {},
      { steps: [stepFixture({ done: true })] },
    )
    expect(xpAwardsForQuest(quest)).toEqual([])
  })
})
