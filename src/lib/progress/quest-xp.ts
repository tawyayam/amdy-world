// XP awarded by quests. Quest progress is derived from data: completed steps,
// reached counter milestones, and the quest status, so unticking a step,
// reopening a quest, or lowering a counter removes the XP it gave.

import {
  counterCurrentValue,
  counterMilestoneXp,
  questCounter,
} from './counter'
import {
  QUEST_COMPLETE_XP,
  QUEST_FROM_IDEA_BONUS_XP,
  QUEST_STEP_XP,
} from './rules'
import type { XpAward } from './types'
import type { Quest, QuestStep } from '@/lib/types'

/** XP a single quest step grants, once it is done. */
export function xpForQuestStep(step: QuestStep): number {
  return step.done ? QUEST_STEP_XP : 0
}

/**
 * True when a `done` quest's own data still backs its completion XP. Steps
 * quests always do; a counter quest must sit at or above its total, so a stale
 * `done` state (a lowered total, a removed update) grants nothing while the
 * count is short. The count itself never stores XP — only this rule decides.
 */
function completionBackedByData(quest: Quest): boolean {
  if (quest.kind !== 'counter') return true
  const counter = questCounter(quest)
  if (!counter) return false
  return counterCurrentValue(quest) >= counter.total
}

/**
 * Everything a quest grants. Steps or counter milestones and the completion XP
 * go to the quest's own skill; a quest that came from an idea also awards a
 * bonus to ideas. Changing the quest's skill moves the XP with it, since it is
 * derived.
 */
export function xpAwardsForQuest(quest: Quest): XpAward[] {
  const awards: XpAward[] = []
  const progressXp =
    quest.kind === 'counter'
      ? counterMilestoneXp(quest)
      : quest.steps.reduce((total, step) => total + xpForQuestStep(step), 0)
  if (progressXp > 0) {
    awards.push({ skillId: quest.skillId, amount: progressXp })
  }
  if (quest.status === 'done' && completionBackedByData(quest)) {
    awards.push({ skillId: quest.skillId, amount: QUEST_COMPLETE_XP })
    if (quest.originIdeaId !== undefined) {
      awards.push({ skillId: 'ideas', amount: QUEST_FROM_IDEA_BONUS_XP })
    }
  }
  return awards
}
