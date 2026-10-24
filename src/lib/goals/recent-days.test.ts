import { describe, expect, it } from 'vitest'
import { RECENT_GOAL_DAYS, recentGoalDays } from '@/lib/goals'
import { goalFixture } from '@/lib/progress/test-fixtures'

const TODAY = '2026-10-13'

describe('recentGoalDays', () => {
  it('groups live goals by day, newest day first, with done/total counts', () => {
    const days = recentGoalDays(
      [
        goalFixture({ id: 'a', date: '2026-10-11', done: true }),
        goalFixture({ id: 'b', date: '2026-10-13', done: true }),
        goalFixture({ id: 'c', date: '2026-10-13', done: false }),
      ],
      TODAY,
    )
    expect(days.map((day) => day.dateKey)).toEqual(['2026-10-13', '2026-10-11'])
    expect(days[0]).toMatchObject({ done: 1, total: 2 })
    expect(days[0].goals.map((goal) => goal.id)).toEqual(['b', 'c'])
    expect(days[1]).toMatchObject({ done: 1, total: 1 })
  })

  it('orders a day’s goals by when they were created', () => {
    const days = recentGoalDays(
      [
        goalFixture({
          id: 'later',
          date: TODAY,
          createdAt: '2026-10-13T10:00:00.000Z',
        }),
        goalFixture({
          id: 'earlier',
          date: TODAY,
          createdAt: '2026-10-13T07:00:00.000Z',
        }),
      ],
      TODAY,
    )
    expect(days[0].goals.map((goal) => goal.id)).toEqual(['earlier', 'later'])
  })

  it('skips soft-deleted goals and drops a day left with none', () => {
    const days = recentGoalDays(
      [
        goalFixture({
          id: 'gone',
          date: '2026-10-12',
          deletedAt: '2026-10-12T10:00:00.000Z',
        }),
        goalFixture({ id: 'live', date: '2026-10-11' }),
      ],
      TODAY,
    )
    expect(days.map((day) => day.dateKey)).toEqual(['2026-10-11'])
  })

  it('ignores goals dated after today', () => {
    const days = recentGoalDays(
      [
        goalFixture({ id: 'today', date: TODAY }),
        goalFixture({ id: 'tomorrow', date: '2026-10-14' }),
      ],
      TODAY,
    )
    expect(days.map((day) => day.dateKey)).toEqual([TODAY])
  })

  it('keeps only the most recent days up to the limit', () => {
    const goals = Array.from({ length: RECENT_GOAL_DAYS + 3 }, (_, index) =>
      goalFixture({ id: `g${index}`, date: `2026-09-${10 + index}` }),
    )
    const days = recentGoalDays(goals, '2026-10-13')
    expect(days).toHaveLength(RECENT_GOAL_DAYS)
    expect(days[0].dateKey).toBe('2026-09-26')
    expect(days[days.length - 1].dateKey).toBe('2026-09-13')
  })

  it('returns no days when there are no goals', () => {
    expect(recentGoalDays([], TODAY)).toEqual([])
  })
})
