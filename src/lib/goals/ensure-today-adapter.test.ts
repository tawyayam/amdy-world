import { describe, expect, it } from 'vitest'
import { ensureTodayGoalsInto } from './ensure-today-adapter'
import { dateKeyWeekday } from '@/lib/day'
import { InMemoryAdapter } from '@/lib/storage/in-memory-adapter'
import { goalFixture, templateFixture } from '@/lib/storage/test-records'
import type { SyncFields } from '@/lib/types'

const TODAY = '2026-10-13'
const TODAY_WEEKDAY = dateKeyWeekday(TODAY)

/** Deterministic sync fields so the ids and timestamps are predictable. */
function counter(start = 1): () => SyncFields {
  let next = start
  return () => {
    const id = `00000000-0000-4000-8000-${String(next).padStart(12, '0')}`
    const timestamp = '2026-10-13T12:00:00.000Z'
    next += 1
    return { id, createdAt: timestamp, updatedAt: timestamp, deletedAt: null }
  }
}

describe('ensureTodayGoalsInto', () => {
  it('creates a goal for each active template scheduled today', async () => {
    const adapter = new InMemoryAdapter()
    await adapter.saveGoalTemplate(
      templateFixture({ title: 'Read', days: [TODAY_WEEKDAY] }),
    )

    const created = await ensureTodayGoalsInto(adapter, TODAY, counter())

    expect(created).toHaveLength(1)
    const stored = await adapter.listDailyGoals()
    expect(stored).toHaveLength(1)
    expect(stored[0]).toMatchObject({
      date: TODAY,
      title: 'Read',
      done: false,
      doneAt: null,
      templateId: (await adapter.listGoalTemplates())[0]?.id,
    })
  })

  it('is idempotent: a second run creates nothing', async () => {
    const adapter = new InMemoryAdapter()
    await adapter.saveGoalTemplate(templateFixture({ days: [TODAY_WEEKDAY] }))

    await ensureTodayGoalsInto(adapter, TODAY, counter())
    const created = await ensureTodayGoalsInto(adapter, TODAY, counter(50))

    expect(created).toEqual([])
    expect(await adapter.listDailyGoals()).toHaveLength(1)
  })

  it('skips inactive and soft-deleted templates', async () => {
    const adapter = new InMemoryAdapter()
    await adapter.saveGoalTemplate(
      templateFixture({ active: false, days: [TODAY_WEEKDAY] }),
    )
    await adapter.saveGoalTemplate(
      templateFixture({ deletedAt: '2026-10-12T12:00:00.000Z' }),
    )

    const created = await ensureTodayGoalsInto(adapter, TODAY, counter())

    expect(created).toEqual([])
    expect(await adapter.listDailyGoals()).toEqual([])
  })

  it("keeps today's goal and creates no duplicate after its template is restored", async () => {
    const adapter = new InMemoryAdapter()
    const template = templateFixture({ days: [TODAY_WEEKDAY] })
    await adapter.saveGoalTemplate(template)
    const [goal] = await ensureTodayGoalsInto(adapter, TODAY, counter())

    await adapter.deleteGoalTemplate(template.id)
    expect((await adapter.listDailyGoals()).map((stored) => stored.id)).toEqual(
      [goal?.id],
    )

    await adapter.saveGoalTemplate({ ...template, deletedAt: null })
    const created = await ensureTodayGoalsInto(adapter, TODAY, counter(50))

    expect(created).toEqual([])
    const goals = await adapter.listDailyGoals()
    expect(goals).toHaveLength(1)
    expect(goals[0]?.id).toBe(goal?.id)
  })

  it('does not recreate a goal the user soft-deleted for today', async () => {
    const adapter = new InMemoryAdapter()
    const template = templateFixture({ days: [TODAY_WEEKDAY] })
    await adapter.saveGoalTemplate(template)
    await adapter.saveDailyGoal(
      goalFixture({
        date: TODAY,
        templateId: template.id,
        deletedAt: '2026-10-13T09:00:00.000Z',
      }),
    )

    const created = await ensureTodayGoalsInto(adapter, TODAY, counter())

    expect(created).toEqual([])
    expect(await adapter.listDailyGoals()).toEqual([])
  })
})
