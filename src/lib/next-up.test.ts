// "Next up" equivalents: the numbers must follow the XP constants in rules.ts
// and always round up, never down.

import { describe, expect, it } from 'vitest'
import { nextUp } from './next-up'
import {
  IDEA_XP,
  LEARNED_XP,
  QUEST_STEP_XP,
  READING_PAGES_PER_XP,
  SESSION_MINUTES_PER_XP,
} from './progress/rules'
import type { LevelProgress, Progress } from './progress/types'

const START: LevelProgress = {
  level: 1,
  xpIntoLevel: 0,
  xpForLevel: 100,
  xpToNextLevel: 100,
}

function levelWith(xpToNextLevel: number): LevelProgress {
  return {
    level: 3,
    xpIntoLevel: 200 - xpToNextLevel,
    xpForLevel: 200,
    xpToNextLevel,
  }
}

function progressWith(
  overall: LevelProgress,
  skillLevels: Partial<
    Record<'programming' | 'reading' | 'learning' | 'ideas', LevelProgress>
  > = {},
): Progress {
  return {
    skillXp: { programming: 0, reading: 0, learning: 0, ideas: 0 },
    skillLevels: {
      programming: skillLevels.programming ?? START,
      reading: skillLevels.reading ?? START,
      learning: skillLevels.learning ?? START,
      ideas: skillLevels.ideas ?? START,
    },
    totalSkillXp: 0,
    bonusXp: 0,
    totalXp: 0,
    overall,
    streak: 0,
  }
}

describe('nextUp', () => {
  const xp = 75

  it('turns programming XP into quest steps and coding hours', () => {
    const result = nextUp(
      'programming',
      progressWith(START, { programming: levelWith(xp) }),
    )
    expect(result.xpRemaining).toBe(xp)
    expect(result.nextLevel).toBe(4)
    expect(result.equivalents).toEqual([
      { kind: 'questSteps', amount: Math.ceil(xp / QUEST_STEP_XP) },
      {
        kind: 'codingHours',
        amount: Math.ceil((xp * SESSION_MINUTES_PER_XP) / 60),
      },
    ])
    // 75 XP is 4 steps (20 each) and 7 hours (12 XP each), both rounded up.
    expect(result.equivalents).toEqual([
      { kind: 'questSteps', amount: 4 },
      { kind: 'codingHours', amount: 7 },
    ])
  })

  it('turns reading XP into pages', () => {
    const result = nextUp(
      'reading',
      progressWith(START, { reading: levelWith(xp) }),
    )
    expect(result.equivalents).toEqual([
      { kind: 'pages', amount: Math.ceil(xp * READING_PAGES_PER_XP) },
    ])
    expect(result.equivalents[0]?.amount).toBe(150)
  })

  it('turns learning XP into learned notes', () => {
    const result = nextUp(
      'learning',
      progressWith(START, { learning: levelWith(xp) }),
    )
    expect(result.equivalents).toEqual([
      { kind: 'learnedNotes', amount: Math.ceil(xp / LEARNED_XP) },
    ])
    expect(result.equivalents[0]?.amount).toBe(5)
  })

  it('turns idea XP into ideas', () => {
    const result = nextUp(
      'ideas',
      progressWith(START, { ideas: levelWith(xp) }),
    )
    expect(result.equivalents).toEqual([
      { kind: 'ideas', amount: Math.ceil(xp / IDEA_XP) },
    ])
    expect(result.equivalents[0]?.amount).toBe(8)
  })

  it('gives the overall character no equivalents', () => {
    const result = nextUp('overall', progressWith(levelWith(xp)))
    expect(result).toEqual({ xpRemaining: xp, nextLevel: 4, equivalents: [] })
  })

  it('rounds every equivalent up, never down', () => {
    const programming = nextUp(
      'programming',
      progressWith(START, { programming: levelWith(1) }),
    )
    expect(programming.equivalents).toEqual([
      { kind: 'questSteps', amount: 1 },
      { kind: 'codingHours', amount: 1 },
    ])

    expect(
      nextUp('reading', progressWith(START, { reading: levelWith(1) }))
        .equivalents,
    ).toEqual([{ kind: 'pages', amount: READING_PAGES_PER_XP }])
    expect(
      nextUp('learning', progressWith(START, { learning: levelWith(1) }))
        .equivalents,
    ).toEqual([{ kind: 'learnedNotes', amount: 1 }])
    expect(
      nextUp('ideas', progressWith(START, { ideas: levelWith(1) })).equivalents,
    ).toEqual([{ kind: 'ideas', amount: 1 }])
  })

  it('reads the scope it was asked for, not another skill', () => {
    const result = nextUp(
      'reading',
      progressWith(START, {
        programming: levelWith(300),
        reading: levelWith(40),
      }),
    )
    expect(result.xpRemaining).toBe(40)
    expect(result.equivalents[0]?.amount).toBe(
      Math.ceil(40 * READING_PAGES_PER_XP),
    )
  })
})
