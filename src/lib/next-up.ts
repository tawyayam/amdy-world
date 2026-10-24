// "Next up in plain actions": how much XP is left to the next level and what
// that means in the actions Amdy actually logs. Every equivalent is derived from
// the XP constants in rules.ts, rounded up, so the two can never drift apart.

import {
  IDEA_XP,
  LEARNED_XP,
  QUEST_STEP_XP,
  READING_PAGES_PER_XP,
  SESSION_MINUTES_PER_XP,
} from '@/lib/progress/rules'
import type { Progress } from '@/lib/progress/types'
import type { RankScope } from '@/lib/ranks'

/** One action equivalent of the remaining XP. */
export type NextUpEquivalentKind =
  'questSteps' | 'codingHours' | 'pages' | 'learnedNotes' | 'ideas'

export interface NextUpEquivalent {
  kind: NextUpEquivalentKind
  amount: number
}

/** What it takes to reach the next level of one scope. */
export interface NextUp {
  /** XP still missing for the next level. */
  xpRemaining: number
  /** The level the equivalents lead to. */
  nextLevel: number
  /** Up to two ways to earn that XP; empty for the overall character. */
  equivalents: NextUpEquivalent[]
}

/** Minutes in an hour, for turning session XP into coding hours. */
const MINUTES_PER_HOUR = 60

function equivalentsFor(
  scope: RankScope,
  xpRemaining: number,
): NextUpEquivalent[] {
  switch (scope) {
    case 'programming':
      return [
        {
          kind: 'questSteps',
          amount: Math.ceil(xpRemaining / QUEST_STEP_XP),
        },
        {
          kind: 'codingHours',
          amount: Math.ceil(
            (xpRemaining * SESSION_MINUTES_PER_XP) / MINUTES_PER_HOUR,
          ),
        },
      ]
    case 'reading':
      return [
        {
          kind: 'pages',
          amount: Math.ceil(xpRemaining * READING_PAGES_PER_XP),
        },
      ]
    case 'learning':
      return [
        {
          kind: 'learnedNotes',
          amount: Math.ceil(xpRemaining / LEARNED_XP),
        },
      ]
    case 'ideas':
      return [{ kind: 'ideas', amount: Math.ceil(xpRemaining / IDEA_XP) }]
    case 'overall':
      return []
  }
}

/**
 * The XP left to the next level and up to two action equivalents. The overall
 * character has no equivalents because it grows from every skill at once.
 */
export function nextUp(scope: RankScope, progress: Progress): NextUp {
  const level =
    scope === 'overall' ? progress.overall : progress.skillLevels[scope]
  return {
    xpRemaining: level.xpToNextLevel,
    nextLevel: level.level + 1,
    equivalents: equivalentsFor(scope, level.xpToNextLevel),
  }
}
