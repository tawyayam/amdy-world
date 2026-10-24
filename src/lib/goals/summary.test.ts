import { describe, expect, it } from 'vitest'
import { summarizeGoalsByDay } from '@/lib/goals'
import { goalFixture } from '@/lib/progress/test-fixtures'

const TODAY = '2026-10-13'

describe('summarizeGoalsByDay', () => {
  it('counts done versus total goals per day', () => {
    const summaries = summarizeGoalsByDay(
      [
        goalFixture({ id: 'a', date: '2026-10-12', done: true }),
        goalFixture({ id: 'b', date: '2026-10-12', done: false }),
        goalFixture({ id: 'c', date: '2026-10-12', done: true }),
        goalFixture({ id: 'd', date: '2026-10-13', done: false }),
      ],
      TODAY,
    )
    expect(summaries.get('2026-10-12')).toEqual({ done: 2, total: 3 })
    expect(summaries.get('2026-10-13')).toEqual({ done: 0, total: 1 })
  })

  it('skips soft-deleted goals', () => {
    const summaries = summarizeGoalsByDay(
      [
        goalFixture({ id: 'a', date: '2026-10-12', done: true }),
        goalFixture({
          id: 'b',
          date: '2026-10-12',
          done: true,
          deletedAt: '2026-10-12T10:00:00.000Z',
        }),
      ],
      TODAY,
    )
    expect(summaries.get('2026-10-12')).toEqual({ done: 1, total: 1 })
  })

  it('ignores goals dated after today', () => {
    const summaries = summarizeGoalsByDay(
      [
        goalFixture({ id: 'a', date: '2026-10-13', done: true }),
        goalFixture({ id: 'b', date: '2026-10-14', done: true }),
      ],
      TODAY,
    )
    expect(summaries.has('2026-10-14')).toBe(false)
    expect(summaries.get('2026-10-13')).toEqual({ done: 1, total: 1 })
  })

  it('returns an empty map when there are no goals', () => {
    expect(summarizeGoalsByDay([], TODAY).size).toBe(0)
  })
})
