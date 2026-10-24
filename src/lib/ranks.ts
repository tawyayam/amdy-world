// Ranks are display-only names for level bands. The thresholds live here so
// Amdy can tune them in one place; the names live in copy.ts because they are
// user-facing strings. No rank is ever stored — it is always derived from the
// current level.

import { RANK_NAMES } from '@/lib/copy'
import type { SkillId } from '@/lib/skills'

/** The four skills plus the character's overall level. */
export type RankScope = SkillId | 'overall'

/** Minimum level for each skill rank, lowest first. */
export const SKILL_RANK_LEVELS = [1, 3, 5, 8, 12] as const

/** Minimum level for each overall rank, lowest first. */
export const OVERALL_RANK_LEVELS = [1, 5, 10, 15, 25] as const

/** Minimum level per rank, keyed by scope. */
export const RANK_LEVELS: Record<RankScope, readonly number[]> = {
  programming: SKILL_RANK_LEVELS,
  reading: SKILL_RANK_LEVELS,
  learning: SKILL_RANK_LEVELS,
  ideas: SKILL_RANK_LEVELS,
  overall: OVERALL_RANK_LEVELS,
}

/** A rank and the level where it starts. */
export interface Rank {
  name: string
  level: number
}

/** The rank after the current one, with how many levels are still missing. */
export interface NextRank {
  name: string
  level: number
  levelsAway: number
}

/** Where a rank sits relative to the current level. */
export type RankState = 'earlier' | 'current' | 'next' | 'later'

/** One rung of a scope's rank ladder. */
export interface RankLadderEntry extends Rank {
  state: RankState
}

function clampedLevel(level: number): number {
  return Math.max(1, Math.floor(level))
}

function rankIndexForLevel(scope: RankScope, level: number): number {
  const safeLevel = clampedLevel(level)
  const thresholds = RANK_LEVELS[scope]
  let index = 0
  for (let candidate = 0; candidate < thresholds.length; candidate += 1) {
    if (safeLevel >= (thresholds[candidate] ?? 1)) index = candidate
  }
  return index
}

/**
 * The rank a scope sits in at `level`: the highest rank whose minimum level is
 * at or below it. Levels below 1 count as 1.
 */
export function rankForLevel(scope: RankScope, level: number): Rank {
  const index = rankIndexForLevel(scope, level)
  return {
    name: RANK_NAMES[scope][index] ?? '',
    level: RANK_LEVELS[scope][index] ?? 1,
  }
}

/**
 * The next rank up, or null at the top rank. `levelsAway` counts from the
 * current level to the next rank's starting level.
 */
export function nextRank(scope: RankScope, level: number): NextRank | null {
  const thresholds = RANK_LEVELS[scope]
  const nextIndex = rankIndexForLevel(scope, level) + 1
  const nextLevel = thresholds[nextIndex]
  if (nextLevel === undefined) return null
  return {
    name: RANK_NAMES[scope][nextIndex] ?? '',
    level: nextLevel,
    levelsAway: nextLevel - clampedLevel(level),
  }
}

/**
 * Every rank for the scope in order, tagged `earlier`, `current`, `next`, or
 * `later` so the UI can render the whole ladder without extra math.
 */
export function rankLadder(scope: RankScope, level: number): RankLadderEntry[] {
  const thresholds = RANK_LEVELS[scope]
  const names = RANK_NAMES[scope]
  const current = rankIndexForLevel(scope, level)
  const upcoming = current + 1
  return thresholds.map((threshold, index) => {
    let state: RankState = 'later'
    if (index < current) state = 'earlier'
    else if (index === current) state = 'current'
    else if (index === upcoming) state = 'next'
    return { name: names[index] ?? '', level: threshold, state }
  })
}
