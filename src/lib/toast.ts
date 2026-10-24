// One place for toast policy: how long each kind of toast stays up, the stable
// id that makes a new toast of the same kind replace the old one, and the pure
// builder that merges an action's achievements into a single message. Nothing
// here imports sonner — components own the showing side.

import { QUEST_COPY, RANK_COPY, XP_COPY } from '@/lib/copy'
import { isolate } from '@/lib/bidi'
import type { LevelUp } from '@/lib/progress'
import { SKILL_BY_ID, type SkillId } from '@/lib/skills'

/** How long each kind of toast stays up, in milliseconds. */
export const TOAST_DURATION = {
  achievement: 6000,
  undo: 6000,
  error: 6000,
  info: 4000,
} as const

/** Stable per-kind ids: a new toast of the same kind replaces the old one. */
export const TOAST_ID = {
  achievement: 'achievement',
  undo: 'undo',
  error: 'error',
  info: 'info',
} as const

/** Everything one action can celebrate, merged into a single message. */
export interface AchievementMessageInput {
  /** The character, for the overall level-up line. */
  characterName: string
  /** Quest completion: its title (may be Arabic) and the XP the action granted. */
  completedQuest?: { title: string; xp: number } | null
  /** Counter milestone values this action crossed, ascending. */
  milestonesReached?: readonly number[]
  /** XP granted by each milestone reached. */
  milestoneXp?: number
  /** Which skill the milestone XP went to, when there is one. */
  skillId?: SkillId | null
  /** A named non-quest result with its own XP, such as promoting an entry. */
  headline?: { text: string; xp: number } | null
  /** Level-ups caused by the same action. */
  levelUps: readonly LevelUp[]
}

/**
 * The one toast line for an action's achievements — completion, milestone,
 * headline, and every level-up joined by " · " — or null when there is nothing
 * the user cannot already see on screen.
 */
export function achievementMessage({
  characterName,
  completedQuest = null,
  milestonesReached = [],
  milestoneXp = 0,
  skillId = null,
  headline = null,
  levelUps,
}: AchievementMessageInput): string | null {
  const parts: string[] = []
  if (completedQuest) {
    parts.push(
      QUEST_COPY.counterCompleted(
        isolate(completedQuest.title),
        completedQuest.xp,
      ),
    )
  }
  if (milestonesReached.length > 0) {
    const highest = milestonesReached[milestonesReached.length - 1] ?? 0
    parts.push(QUEST_COPY.counterMilestone(highest))
    // The completion line already carries the whole XP total.
    if (!completedQuest && skillId && milestoneXp > 0) {
      parts.push(
        XP_COPY.gained(
          milestonesReached.length * milestoneXp,
          SKILL_BY_ID[skillId].name,
        ),
      )
    }
  }
  if (headline) {
    parts.push(headline.text)
    if (headline.xp > 0 && skillId) {
      parts.push(XP_COPY.gained(headline.xp, SKILL_BY_ID[skillId].name))
    }
  }
  for (const levelUp of levelUps) {
    parts.push(
      levelUp.kind === 'skill' && levelUp.skillId
        ? XP_COPY.skillLevelUp(
            SKILL_BY_ID[levelUp.skillId].name,
            levelUp.toLevel,
          )
        : XP_COPY.overallLevelUp(characterName, levelUp.toLevel),
    )
    if (levelUp.fromRank !== levelUp.toRank) {
      parts.push(RANK_COPY.nowRank(levelUp.toRank))
    }
  }
  // A headline on its own restates what the screen already shows.
  if (
    parts.length === 1 &&
    headline &&
    headline.xp === 0 &&
    levelUps.length === 0
  ) {
    return null
  }
  if (parts.length === 0) return null
  return parts.join(' · ')
}
