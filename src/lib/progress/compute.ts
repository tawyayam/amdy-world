// Aggregates entries, quests, and goals into the XP, levels, and streak the UI
// renders. Pure: it reads only the records and the explicit day context in
// `ProgressInput`, and never the clock.

import { goalBonusForDay, xpForGoal } from './goal-xp'
import { xpForEntry } from './entry-xp'
import { xpAwardsForQuest } from './quest-xp'
import { SKILL_IDS, levelProgress } from './rules'
import { computeStreak } from './streak'
import type { LevelProgress, Progress, ProgressInput } from './types'
import { isDateKeyAfter } from '@/lib/day'
import type { SkillId } from '@/lib/skills'
import type { DailyGoal } from '@/lib/types'

function mapSkills<T>(build: (skillId: SkillId) => T): Record<SkillId, T> {
  const result = {} as Record<SkillId, T>
  for (const skillId of SKILL_IDS) {
    result[skillId] = build(skillId)
  }
  return result
}

function sumGoalBonuses(goals: readonly DailyGoal[]): number {
  const goalsByDate = new Map<string, DailyGoal[]>()
  for (const goal of goals) {
    const bucket = goalsByDate.get(goal.date)
    if (bucket) {
      bucket.push(goal)
    } else {
      goalsByDate.set(goal.date, [goal])
    }
  }

  let bonus = 0
  for (const bucket of goalsByDate.values()) {
    bonus += goalBonusForDay(bucket)
  }
  return bonus
}

/** Full derived progress for the given records. Soft-deleted records are ignored. */
export function computeProgress(input: ProgressInput): Progress {
  const skillXp = mapSkills(() => 0)

  for (const entry of input.entries) {
    if (entry.deletedAt !== null || entry.skillId === null) continue
    skillXp[entry.skillId] += xpForEntry(entry)
  }

  for (const quest of input.quests) {
    if (quest.deletedAt !== null) continue
    for (const award of xpAwardsForQuest(quest)) {
      skillXp[award.skillId] += award.amount
    }
  }

  // Goals dated after today are ignored, so a goal ticked early (or a template
  // dated ahead) cannot award XP before its day arrives.
  const liveGoals = input.goals.filter(
    (goal) =>
      goal.deletedAt === null && !isDateKeyAfter(goal.date, input.todayKey),
  )
  for (const goal of liveGoals) {
    skillXp[goal.skillId] += xpForGoal(goal)
  }

  const bonusXp = sumGoalBonuses(liveGoals)
  const totalSkillXp = SKILL_IDS.reduce(
    (total, skillId) => total + skillXp[skillId],
    0,
  )
  const totalXp = totalSkillXp + bonusXp
  const skillLevels = mapSkills<LevelProgress>((skillId) =>
    levelProgress(skillXp[skillId]),
  )

  return {
    skillXp,
    skillLevels,
    totalSkillXp,
    bonusXp,
    totalXp,
    overall: levelProgress(totalXp),
    streak: computeStreak(input),
  }
}
