import type { SkillId } from '@/lib/skills'
import type { DailyGoal, Entry, Quest } from '@/lib/types'

/** Where a total XP value sits on the level curve. */
export interface LevelProgress {
  /** Current level, starting at 1 for 0 XP. */
  level: number
  /** XP earned inside the current level. */
  xpIntoLevel: number
  /** XP required to advance from the current level to the next. */
  xpForLevel: number
  /** XP still needed to reach the next level. */
  xpToNextLevel: number
}

/** XP granted to a single skill by one record. */
export interface XpAward {
  skillId: SkillId
  amount: number
}

/** Everything the UI needs to render levels, bars, and the streak. */
export interface Progress {
  /** XP per skill, from entries, quests, and completed goals. */
  skillXp: Record<SkillId, number>
  /** Level information per skill. */
  skillLevels: Record<SkillId, LevelProgress>
  /** Sum of all skill XP, before overall-only bonuses. */
  totalSkillXp: number
  /** Overall-only bonus XP (all-goals bonuses). */
  bonusXp: number
  /** Overall XP, the sum of all skill XP plus bonuses. */
  totalXp: number
  /** Overall character level, computed from `totalXp`. */
  overall: LevelProgress
  /** Consecutive active days ending today. */
  streak: number
}

/** A skill or the character reaching a higher level. */
export interface LevelUp {
  kind: 'skill' | 'overall'
  /** Present only when `kind` is `'skill'`. */
  skillId?: SkillId
  fromLevel: number
  toLevel: number
  /** Rank name before the change; equal to `toRank` inside one rank. */
  fromRank: string
  /** Rank name after the change. */
  toRank: string
}

/** Records progress functions read from, plus the day context they need. */
export interface ProgressInput {
  entries: readonly Entry[]
  quests: readonly Quest[]
  goals: readonly DailyGoal[]
  /** Local `YYYY-MM-DD` day key for "today", supplied by the caller. */
  todayKey: string
  /** IANA time zone used to group timestamps into local days. */
  timeZone: string
}
