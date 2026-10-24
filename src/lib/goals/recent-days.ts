// Goal history for the Goals screen: the last few days that actually have
// goals, newest first. Pure, so the page only maps over the result. Goals dated
// after today are ignored, matching the rest of the derived progress rules.

import { isDateKeyAfter, type DateKey } from '@/lib/day'
import type { DailyGoal } from '@/lib/types'

/** How many past days the Recent days list shows. */
export const RECENT_GOAL_DAYS = 14

/** One day of goal history: its progress and its goals, oldest goal first. */
export interface RecentGoalDay {
  dateKey: DateKey
  done: number
  total: number
  goals: DailyGoal[]
}

/**
 * The most recent `limit` days that have at least one live goal, newest first.
 * Soft-deleted goals and goals dated after `todayKey` are skipped; a day is only
 * listed when a remaining goal exists, so empty sections never appear.
 */
export function recentGoalDays(
  goals: readonly DailyGoal[],
  todayKey: DateKey,
  limit: number = RECENT_GOAL_DAYS,
): RecentGoalDay[] {
  const goalsByDay = new Map<DateKey, DailyGoal[]>()
  for (const goal of goals) {
    if (goal.deletedAt !== null) continue
    if (isDateKeyAfter(goal.date, todayKey)) continue
    const bucket = goalsByDay.get(goal.date)
    if (bucket) bucket.push(goal)
    else goalsByDay.set(goal.date, [goal])
  }

  return [...goalsByDay.entries()]
    .sort(([first], [second]) => second.localeCompare(first))
    .slice(0, limit)
    .map(([dateKey, dayGoals]) => {
      const ordered = [...dayGoals].sort((first, second) =>
        first.createdAt.localeCompare(second.createdAt),
      )
      return {
        dateKey,
        done: ordered.filter((goal) => goal.done).length,
        total: ordered.length,
        goals: ordered,
      }
    })
}
