// Pure shape changes for daily goals and their recurring templates. The hooks
// own the clock and ids; these functions only transform records, so they are easy
// to test and reused by every write action.

import type { NewDailyGoalDraft } from './ensure-today'
import type { SkillId } from '@/lib/skills'
import type { DailyGoal, GoalTemplate, SyncFields, Weekday } from '@/lib/types'

/** Editable fields of a daily goal. */
export interface GoalDetails {
  title: string
  skillId: SkillId
}

/** Editable fields of a recurring goal template. */
export interface GoalTemplateDetails {
  title: string
  skillId: SkillId
  days: Weekday[]
  active: boolean
}

/** Turns a missing-template draft into a fresh, not-yet-done daily goal. */
export function dailyGoalFromDraft(
  draft: NewDailyGoalDraft,
  fields: SyncFields,
): DailyGoal {
  return {
    ...fields,
    date: draft.date,
    title: draft.title,
    skillId: draft.skillId,
    templateId: draft.templateId,
    done: false,
    doneAt: null,
  }
}

/** Ticking a goal stamps `doneAt`; unticking clears it so the streak follows. */
export function withGoalDone(
  goal: DailyGoal,
  done: boolean,
  now: string,
): DailyGoal {
  return { ...goal, done, doneAt: done ? now : null, updatedAt: now }
}

/** Renames a goal or moves it to another skill without touching its done state. */
export function withGoalDetails(
  goal: DailyGoal,
  details: GoalDetails,
  now: string,
): DailyGoal {
  return {
    ...goal,
    title: details.title,
    skillId: details.skillId,
    updatedAt: now,
  }
}

/**
 * Updates a template in place. Goals created from it before the change keep the
 * title and skill they were made with, so past days never change retroactively.
 */
export function withTemplateDetails(
  template: GoalTemplate,
  details: GoalTemplateDetails,
  now: string,
): GoalTemplate {
  return {
    ...template,
    title: details.title,
    skillId: details.skillId,
    days: details.days,
    active: details.active,
    updatedAt: now,
  }
}
