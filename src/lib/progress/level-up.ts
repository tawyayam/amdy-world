// Detects level-ups by comparing progress before and after an action, so the UI
// can celebrate without computing anything itself. Only increases are reported:
// reopening a quest or unticking a step lowers XP without a "level-up".

import { rankForLevel } from '@/lib/ranks'
import { SKILL_IDS } from './rules'
import type { LevelUp, Progress } from './types'

/**
 * The overall level-up first (it is the headline), then any skill level-ups in
 * canonical skill order. Returns an empty array when no level increased.
 */
export function detectLevelUps(before: Progress, after: Progress): LevelUp[] {
  const levelUps: LevelUp[] = []

  if (after.overall.level > before.overall.level) {
    const fromLevel = before.overall.level
    const toLevel = after.overall.level
    levelUps.push({
      kind: 'overall',
      fromLevel,
      toLevel,
      fromRank: rankForLevel('overall', fromLevel).name,
      toRank: rankForLevel('overall', toLevel).name,
    })
  }

  for (const skillId of SKILL_IDS) {
    const fromLevel = before.skillLevels[skillId].level
    const toLevel = after.skillLevels[skillId].level
    if (toLevel > fromLevel) {
      levelUps.push({
        kind: 'skill',
        skillId,
        fromLevel,
        toLevel,
        fromRank: rankForLevel(skillId, fromLevel).name,
        toRank: rankForLevel(skillId, toLevel).name,
      })
    }
  }

  return levelUps
}
