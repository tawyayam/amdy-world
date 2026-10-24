// Builds the celebration line shown after a rewarding action, for example
// "+15 XP · Learning" or a level-up notice. Kept in lib so quick capture and the
// promote-to-quest action phrase their feedback the same way.

import { XP_COPY } from '@/lib/copy'
import type { LevelUp } from '@/lib/progress'
import { SKILL_BY_ID, type SkillId } from '@/lib/skills'

export interface ProgressMessageInput {
  xp: number
  skillId: SkillId | null
  levelUps: readonly LevelUp[]
  characterName: string
}

/** XP gained first, then any level-ups, joined for a single toast or line. */
export function progressMessage({
  xp,
  skillId,
  levelUps,
  characterName,
}: ProgressMessageInput): string {
  const messages = levelUps.map((levelUp) =>
    levelUp.kind === 'skill' && levelUp.skillId
      ? XP_COPY.skillLevelUp(SKILL_BY_ID[levelUp.skillId].name, levelUp.toLevel)
      : XP_COPY.overallLevelUp(characterName, levelUp.toLevel),
  )
  if (skillId && xp > 0) {
    messages.unshift(XP_COPY.gained(xp, SKILL_BY_ID[skillId].name))
  }
  return messages.join(' · ')
}
