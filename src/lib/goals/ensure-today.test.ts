import { describe, expect, it } from 'vitest'
import { ensureTodayGoals } from '@/lib/goals'
import { goalFixture, templateFixture } from '@/lib/progress/test-fixtures'

// 2026-10-12 is a Monday, so `dateKeyWeekday` returns 1.
const MONDAY = '2026-10-12'

describe('ensureTodayGoals', () => {
  it('drafts a goal for an active template scheduled today', () => {
    const drafts = ensureTodayGoals(
      [
        templateFixture({
          id: 't1',
          title: 'Read 30 pages',
          skillId: 'reading',
          days: [1],
        }),
      ],
      [],
      MONDAY,
    )
    expect(drafts).toEqual([
      {
        date: MONDAY,
        title: 'Read 30 pages',
        skillId: 'reading',
        templateId: 't1',
      },
    ])
  })

  it('skips a template not scheduled for today', () => {
    const drafts = ensureTodayGoals(
      [templateFixture({ days: [0, 6] })],
      [],
      MONDAY,
    )
    expect(drafts).toEqual([])
  })

  it('skips inactive and soft-deleted templates', () => {
    const templates = [
      templateFixture({ id: 'paused', active: false }),
      templateFixture({ id: 'gone', deletedAt: '2026-10-12T08:00:00.000Z' }),
    ]
    expect(ensureTodayGoals(templates, [], MONDAY)).toEqual([])
  })

  it('skips a template that already has a goal today', () => {
    const templates = [templateFixture({ id: 't1' })]
    const goals = [goalFixture({ templateId: 't1', date: MONDAY })]
    expect(ensureTodayGoals(templates, goals, MONDAY)).toEqual([])
  })

  it('does not recreate a goal the user deleted today', () => {
    const templates = [templateFixture({ id: 't1' })]
    const goals = [
      goalFixture({
        templateId: 't1',
        date: MONDAY,
        deletedAt: '2026-10-12T09:00:00.000Z',
      }),
    ]
    expect(ensureTodayGoals(templates, goals, MONDAY)).toEqual([])
  })

  it('ignores goals from other days', () => {
    const templates = [templateFixture({ id: 't1' })]
    const goals = [goalFixture({ templateId: 't1', date: '2026-10-11' })]
    expect(ensureTodayGoals(templates, goals, MONDAY)).toHaveLength(1)
  })

  it('is not blocked by a one-off goal for today', () => {
    const templates = [templateFixture({ id: 't1' })]
    const goals = [goalFixture({ templateId: null, date: MONDAY })]
    expect(ensureTodayGoals(templates, goals, MONDAY)).toHaveLength(1)
  })

  it('is idempotent: running again after applying the drafts yields nothing', () => {
    const templates = [
      templateFixture({ id: 't1', days: [1] }),
      templateFixture({ id: 't2', days: [1], skillId: 'programming' }),
    ]
    const drafts = ensureTodayGoals(templates, [], MONDAY)
    const applied = drafts.map((draft, index) =>
      goalFixture({ id: `g${index}`, ...draft, date: MONDAY }),
    )
    expect(drafts).toHaveLength(2)
    expect(ensureTodayGoals(templates, applied, MONDAY)).toEqual([])
  })
})
