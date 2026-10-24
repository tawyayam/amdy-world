// The pure part of `ensureTodayGoals()`: it decides which daily goals are
// missing for today but does not create records (no ids or timestamps), so the
// caller owns the clock and ids; the storage-bound wrapper does the writing.

import { dateKeyWeekday } from '@/lib/day'
import type { SkillId } from '@/lib/skills'
import type { DailyGoal, GoalTemplate } from '@/lib/types'

/** A daily goal that still needs to be created for the given day. */
export interface NewDailyGoalDraft {
  date: string
  title: string
  skillId: SkillId
  templateId: string
}

/**
 * Drafts one goal for each active template scheduled for `todayKey` that does
 * not already have a goal for that day. It is idempotent, because a template
 * with an existing goal for the day (even a soft-deleted one, so a goal the
 * user deleted does not reappear) is skipped. It never backfills past days.
 */
export function ensureTodayGoals(
  templates: readonly GoalTemplate[],
  goals: readonly DailyGoal[],
  todayKey: string,
): NewDailyGoalDraft[] {
  const weekday = dateKeyWeekday(todayKey)
  const scheduledTemplateIds = new Set(
    goals
      .filter((goal) => goal.date === todayKey && goal.templateId !== null)
      .map((goal) => goal.templateId),
  )

  const drafts: NewDailyGoalDraft[] = []
  for (const template of templates) {
    if (template.deletedAt !== null) continue
    if (!template.active) continue
    if (!template.days.includes(weekday)) continue
    if (scheduledTemplateIds.has(template.id)) continue
    drafts.push({
      date: todayKey,
      title: template.title,
      skillId: template.skillId,
      templateId: template.id,
    })
  }
  return drafts
}
