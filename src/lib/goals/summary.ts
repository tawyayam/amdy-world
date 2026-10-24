// How many of a day's goals are done, keyed by the local `YYYY-MM-DD` day. Used
// by the timeline to annotate a day and by the Home card to show "2/4". Pure, so
// it never touches the clock.

import { isDateKeyAfter, type DateKey } from '@/lib/day'
import type { DailyGoal } from '@/lib/types'

/** Done versus total goals for one day. */
export interface GoalDaySummary {
  done: number
  total: number
}

/**
 * Counts live goals per day up to `todayKey`. Soft-deleted goals are skipped, so
 * deleting a goal lowers that day's total instead of leaving a stale count
 * behind; goals dated after today are skipped too, so a future day never shows a
 * count. (Future-dated goals are ignored everywhere progress is derived.)
 */
export function summarizeGoalsByDay(
  goals: readonly DailyGoal[],
  todayKey: DateKey,
): Map<DateKey, GoalDaySummary> {
  const summaries = new Map<DateKey, GoalDaySummary>()
  for (const goal of goals) {
    if (goal.deletedAt !== null) continue
    if (isDateKeyAfter(goal.date, todayKey)) continue
    const summary = summaries.get(goal.date) ?? { done: 0, total: 0 }
    summary.total += 1
    if (goal.done) summary.done += 1
    summaries.set(goal.date, summary)
  }
  return summaries
}
