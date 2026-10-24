// Every XP value and the level curve live here so Amdy can tune them in one
// place. Nothing else in the codebase should hard-code an XP number or a level
// threshold.

import { SKILL_NAMES } from '@/lib/copy'
import type { SkillId } from '@/lib/skills'
import type { EntryType } from '@/lib/types'
import type { LevelProgress } from './types'

/** The four skills in their canonical order. */
export const SKILL_IDS = Object.keys(SKILL_NAMES) as SkillId[]

/** Which skill an entry type belongs to by default; notes belong to no skill. */
export const SKILL_FOR_ENTRY_TYPE: Record<EntryType, SkillId | null> = {
  learned: 'learning',
  idea: 'ideas',
  reading: 'reading',
  session: 'programming',
  note: null,
}

/** XP for logging something learned. */
export const LEARNED_XP = 15
/** XP for logging an idea. */
export const IDEA_XP = 10
/** Extra XP for promoting an idea to a quest. */
export const PROMOTE_IDEA_XP = 25
/** Pages of reading that earn a single XP. */
export const READING_PAGES_PER_XP = 2
/** Most XP a single reading entry can grant. */
export const READING_MAX_XP = 40
/** Minutes of a coding session that earn a single XP. */
export const SESSION_MINUTES_PER_XP = 5
/** Most XP a single coding session can grant. */
export const SESSION_MAX_XP = 60
/** XP for completing a single quest step. */
export const QUEST_STEP_XP = 20
/** XP for each counter-quest milestone reached below 100%. */
export const COUNTER_MILESTONE_XP = 25
/** XP for completing a quest. */
export const QUEST_COMPLETE_XP = 150
/** Extra XP for completing a quest that came from an idea. */
export const QUEST_FROM_IDEA_BONUS_XP = 50
/** XP for completing a single daily goal. */
export const GOAL_XP = 10
/** Overall-only bonus for completing every goal of a day. */
export const ALL_GOALS_BONUS_XP = 20

/** XP needed to advance from level 1 to level 2. */
export const LEVEL_BASE_XP = 100
/** XP added to the requirement of each successive level. */
export const LEVEL_STEP_XP = 50

/** XP required to advance from `level` to `level + 1`. */
export function xpToAdvanceFromLevel(level: number): number {
  return LEVEL_BASE_XP + (level - 1) * LEVEL_STEP_XP
}

/**
 * Where `totalXp` sits on the level curve. Levels start at 1, and negative or
 * fractional XP is clamped to the nearest lower whole number.
 */
export function levelProgress(totalXp: number): LevelProgress {
  let level = 1
  let xpIntoLevel = Math.max(0, Math.floor(totalXp))
  while (xpIntoLevel >= xpToAdvanceFromLevel(level)) {
    xpIntoLevel -= xpToAdvanceFromLevel(level)
    level += 1
  }
  const xpForLevel = xpToAdvanceFromLevel(level)
  return {
    level,
    xpIntoLevel,
    xpForLevel,
    xpToNextLevel: xpForLevel - xpIntoLevel,
  }
}
