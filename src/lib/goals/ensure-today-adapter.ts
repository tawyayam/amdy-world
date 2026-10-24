// The storage half of `ensureTodayGoals()`: it reads the templates and every
// goal from an adapter, plans the missing goals for the day, and saves them. It
// takes the adapter (and a field factory, for deterministic tests) so the whole
// flow is testable without React.

import { ensureTodayGoals } from './ensure-today'
import { dailyGoalFromDraft } from './mutations'
import { createSyncFields } from '@/lib/storage/records'
import type { StorageAdapter } from '@/lib/storage/types'
import type { DailyGoal, SyncFields } from '@/lib/types'

/**
 * Creates any daily goals missing for `todayKey` from active templates and
 * returns the created goals. Idempotent: a template that already has a goal for
 * the day (even a soft-deleted one) is skipped by the pure planner.
 */
export async function ensureTodayGoalsInto(
  adapter: StorageAdapter,
  todayKey: string,
  createFields: () => SyncFields = createSyncFields,
): Promise<DailyGoal[]> {
  const [templates, goals] = await Promise.all([
    adapter.listGoalTemplates(),
    adapter.listDailyGoalsIncludingDeleted(),
  ])
  const drafts = ensureTodayGoals(templates, goals, todayKey)
  const created: DailyGoal[] = []
  for (const draft of drafts) {
    const goal = dailyGoalFromDraft(draft, createFields())
    await adapter.saveDailyGoal(goal)
    created.push(goal)
  }
  return created
}
