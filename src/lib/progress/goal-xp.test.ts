import { describe, expect, it } from 'vitest'
import { goalBonusForDay, xpForGoal } from '@/lib/progress'
import { goalFixture } from './test-fixtures'

describe('xpForGoal', () => {
  it('grants 10 XP once the goal is done', () => {
    expect(xpForGoal(goalFixture({ done: true }))).toBe(10)
  })

  it('grants nothing for an unfinished goal', () => {
    expect(xpForGoal(goalFixture({ done: false }))).toBe(0)
  })
})

describe('goalBonusForDay', () => {
  it('grants no bonus for an empty day', () => {
    expect(goalBonusForDay([])).toBe(0)
  })

  it('grants no bonus while any goal is unfinished', () => {
    const goals = [
      goalFixture({ id: 'a', done: true }),
      goalFixture({ id: 'b', done: false }),
    ]
    expect(goalBonusForDay(goals)).toBe(0)
  })

  it('grants 20 XP when every goal of the day is done', () => {
    const goals = [
      goalFixture({ id: 'a', done: true }),
      goalFixture({ id: 'b', done: true }),
    ]
    expect(goalBonusForDay(goals)).toBe(20)
  })
})
