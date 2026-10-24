import { describe, expect, it } from 'vitest'
import {
  dailyGoalFromDraft,
  withGoalDetails,
  withGoalDone,
  withTemplateDetails,
} from '@/lib/goals'
import { goalFixture, templateFixture } from '@/lib/progress/test-fixtures'
import type { SyncFields } from '@/lib/types'

const FIELDS: SyncFields = {
  id: 'new-goal',
  createdAt: '2026-10-12T08:00:00.000Z',
  updatedAt: '2026-10-12T08:00:00.000Z',
  deletedAt: null,
}

describe('dailyGoalFromDraft', () => {
  it('turns a template draft into a fresh, not-yet-done goal', () => {
    expect(
      dailyGoalFromDraft(
        {
          date: '2026-10-12',
          title: 'Read 30 pages',
          skillId: 'reading',
          templateId: 't1',
        },
        FIELDS,
      ),
    ).toEqual({
      ...FIELDS,
      date: '2026-10-12',
      title: 'Read 30 pages',
      skillId: 'reading',
      templateId: 't1',
      done: false,
      doneAt: null,
    })
  })
})

describe('withGoalDone', () => {
  it('stamps doneAt when ticking', () => {
    const goal = goalFixture({ done: false, doneAt: null })
    const now = '2026-10-12T09:00:00.000Z'
    expect(withGoalDone(goal, true, now)).toMatchObject({
      done: true,
      doneAt: now,
      updatedAt: now,
    })
  })

  it('clears doneAt when unticking so the streak no longer counts the day', () => {
    const goal = goalFixture({ done: true, doneAt: '2026-10-12T09:00:00.000Z' })
    const now = '2026-10-12T10:00:00.000Z'
    expect(withGoalDone(goal, false, now)).toMatchObject({
      done: false,
      doneAt: null,
      updatedAt: now,
    })
  })
})

describe('withGoalDetails', () => {
  it('renames a goal and moves it to another skill', () => {
    const goal = goalFixture({ title: 'Old', skillId: 'reading' })
    const now = '2026-10-12T11:00:00.000Z'
    expect(
      withGoalDetails(
        goal,
        { title: 'Read 50 pages', skillId: 'learning' },
        now,
      ),
    ).toMatchObject({
      title: 'Read 50 pages',
      skillId: 'learning',
      updatedAt: now,
    })
  })
})

describe('withTemplateDetails', () => {
  it('updates title, skill, days, and active, leaving ids and dates alone', () => {
    const template = templateFixture({ title: 'Old', days: [1] })
    const now = '2026-10-12T12:00:00.000Z'
    const updated = withTemplateDetails(
      template,
      {
        title: 'Read 30 pages',
        skillId: 'learning',
        days: [0, 6],
        active: false,
      },
      now,
    )
    expect(updated).toMatchObject({
      id: template.id,
      createdAt: template.createdAt,
      title: 'Read 30 pages',
      skillId: 'learning',
      days: [0, 6],
      active: false,
      updatedAt: now,
    })
  })
})
