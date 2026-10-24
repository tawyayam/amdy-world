// Streak: consecutive active days ending today, in the user's local time zone.
// A day counts when it has an entry, a completed quest step, a positive counter
// update, or a completed goal. Pure: the caller passes `todayKey` and the time
// zone, so nothing here reads the clock.

import { isDateKeyAfter, previousDateKey, toLocalDateKey } from '@/lib/day'
import { questCounter } from './counter'
import type { DailyGoal, Entry, Quest } from '@/lib/types'

/** Input for `computeStreak`. */
export interface StreakInput {
  entries: readonly Entry[]
  quests: readonly Quest[]
  goals: readonly DailyGoal[]
  /** Local `YYYY-MM-DD` day key for "today". */
  todayKey: string
  /** IANA time zone used to group timestamps into local days. */
  timeZone: string
}

function activeDayKeys(input: StreakInput): Set<string> {
  const days = new Set<string>()

  for (const entry of input.entries) {
    if (entry.deletedAt !== null) continue
    days.add(toLocalDateKey(entry.createdAt, input.timeZone))
  }

  for (const quest of input.quests) {
    if (quest.deletedAt !== null) continue
    for (const step of quest.steps) {
      if (step.done && step.doneAt !== null) {
        days.add(toLocalDateKey(step.doneAt, input.timeZone))
      }
    }
    // Only positive updates count: a correction that lowers the value is not
    // new progress, so it cannot keep a streak alive on its own.
    const counter = questCounter(quest)
    if (counter) {
      for (const update of counter.updates) {
        if (update.delta > 0) {
          days.add(toLocalDateKey(update.at, input.timeZone))
        }
      }
    }
  }

  for (const goal of input.goals) {
    if (goal.deletedAt !== null) continue
    // A completed goal dated after today (ticked ahead of its day) does not
    // count, so the streak only reflects days that have actually arrived.
    if (isDateKeyAfter(goal.date, input.todayKey)) continue
    if (goal.done && goal.doneAt !== null) {
      days.add(toLocalDateKey(goal.doneAt, input.timeZone))
    }
  }

  return days
}

/**
 * Number of consecutive active days ending today. When today has no activity
 * yet the run is counted from yesterday, so an unbroken streak is not shown as
 * zero before the day is over.
 */
export function computeStreak(input: StreakInput): number {
  const activeDays = activeDayKeys(input)
  let day = input.todayKey
  if (!activeDays.has(day)) {
    day = previousDateKey(day)
  }

  let streak = 0
  while (activeDays.has(day)) {
    streak += 1
    day = previousDateKey(day)
  }
  return streak
}
