// XP awarded by daily goals. A completed goal grants XP to its skill; a day
// where every goal is completed grants an overall-only bonus.

import { ALL_GOALS_BONUS_XP, GOAL_XP } from './rules'
import type { DailyGoal } from '@/lib/types'

/** XP a single daily goal grants its skill, once it is done. */
export function xpForGoal(goal: DailyGoal): number {
  return goal.done ? GOAL_XP : 0
}

/**
 * Overall-only bonus for one day's goals: granted only when the day has at
 * least one goal and all of them are done. It counts toward the character's
 * overall level, never toward a single skill.
 */
export function goalBonusForDay(goalsOfDay: readonly DailyGoal[]): number {
  if (goalsOfDay.length === 0) return 0
  return goalsOfDay.every((goal) => goal.done) ? ALL_GOALS_BONUS_XP : 0
}
