import { describe, expect, it } from 'vitest'
import {
  LEVEL_BASE_XP,
  LEVEL_STEP_XP,
  SKILL_FOR_ENTRY_TYPE,
  SKILL_IDS,
  levelProgress,
  xpToAdvanceFromLevel,
} from '@/lib/progress'

describe('level curve', () => {
  it('needs 100 XP for level 1 to 2, then 50 more each level', () => {
    expect(LEVEL_BASE_XP).toBe(100)
    expect(LEVEL_STEP_XP).toBe(50)
    expect(xpToAdvanceFromLevel(1)).toBe(100)
    expect(xpToAdvanceFromLevel(2)).toBe(150)
    expect(xpToAdvanceFromLevel(3)).toBe(200)
  })
})

describe('levelProgress', () => {
  it('starts at level 1 with no XP', () => {
    expect(levelProgress(0)).toEqual({
      level: 1,
      xpIntoLevel: 0,
      xpForLevel: 100,
      xpToNextLevel: 100,
    })
  })

  it('stays on level 1 just below the threshold', () => {
    const progress = levelProgress(99)
    expect(progress.level).toBe(1)
    expect(progress.xpIntoLevel).toBe(99)
    expect(progress.xpToNextLevel).toBe(1)
  })

  it('reaches level 2 exactly at 100 XP', () => {
    const progress = levelProgress(100)
    expect(progress.level).toBe(2)
    expect(progress.xpIntoLevel).toBe(0)
    expect(progress.xpForLevel).toBe(150)
  })

  it('reaches level 3 at 250 XP (100 + 150 cumulative)', () => {
    expect(levelProgress(249).level).toBe(2)
    expect(levelProgress(250).level).toBe(3)
    expect(levelProgress(250).xpIntoLevel).toBe(0)
  })

  it('clamps negative XP to level 1 with no progress', () => {
    const progress = levelProgress(-40)
    expect(progress.level).toBe(1)
    expect(progress.xpIntoLevel).toBe(0)
  })

  it('rounds fractional XP down', () => {
    expect(levelProgress(99.9).xpIntoLevel).toBe(99)
  })
})

describe('skill configuration', () => {
  it('lists the four skills in canonical order', () => {
    expect(SKILL_IDS).toEqual(['programming', 'reading', 'learning', 'ideas'])
  })

  it('maps each entry type to its default skill, with notes mapping to none', () => {
    expect(SKILL_FOR_ENTRY_TYPE).toEqual({
      learned: 'learning',
      idea: 'ideas',
      reading: 'reading',
      session: 'programming',
      note: null,
    })
  })
})
