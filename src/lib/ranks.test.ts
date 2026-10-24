// Rank boundaries for skills and the character, plus the ladder states the
// Skills cards render.

import { describe, expect, it } from 'vitest'
import {
  OVERALL_RANK_LEVELS,
  SKILL_RANK_LEVELS,
  nextRank,
  rankForLevel,
  rankLadder,
} from './ranks'
import { RANK_NAMES } from './copy'

describe('rank thresholds', () => {
  it('uses 1, 3, 5, 8, 12 for every skill', () => {
    expect(SKILL_RANK_LEVELS).toEqual([1, 3, 5, 8, 12])
  })

  it('uses 1, 5, 10, 15, 25 for the overall character', () => {
    expect(OVERALL_RANK_LEVELS).toEqual([1, 5, 10, 15, 25])
  })
})

describe('rankForLevel (skills)', () => {
  const cases: Array<[number, string, number]> = [
    [1, 'Novice', 1],
    [2, 'Novice', 1],
    [3, 'Apprentice', 3],
    [4, 'Apprentice', 3],
    [5, 'Builder', 5],
    [7, 'Builder', 5],
    [8, 'Craftsman', 8],
    [11, 'Craftsman', 8],
    [12, 'Architect', 12],
    [100, 'Architect', 12],
  ]

  it.each(cases)(
    'programming at level %i is %s (from level %i)',
    (level, name, rankLevel) => {
      expect(rankForLevel('programming', level)).toEqual({
        name,
        level: rankLevel,
      })
    },
  )

  it('gives every skill its own names at the same thresholds', () => {
    expect(rankLadder('reading', 1).map((rank) => rank.name)).toEqual([
      ...RANK_NAMES.reading,
    ])
    expect(rankLadder('learning', 1).map((rank) => rank.name)).toEqual([
      ...RANK_NAMES.learning,
    ])
    expect(rankLadder('ideas', 1).map((rank) => rank.name)).toEqual([
      ...RANK_NAMES.ideas,
    ])
  })
})

describe('nextRank (skills)', () => {
  it('points at the next threshold with the distance to it', () => {
    expect(nextRank('programming', 1)).toEqual({
      name: 'Apprentice',
      level: 3,
      levelsAway: 2,
    })
    expect(nextRank('programming', 3)).toEqual({
      name: 'Builder',
      level: 5,
      levelsAway: 2,
    })
    expect(nextRank('programming', 7)).toEqual({
      name: 'Craftsman',
      level: 8,
      levelsAway: 1,
    })
    expect(nextRank('programming', 8)).toEqual({
      name: 'Architect',
      level: 12,
      levelsAway: 4,
    })
  })

  it('returns null at the top rank and beyond', () => {
    expect(nextRank('programming', 12)).toBeNull()
    expect(nextRank('programming', 40)).toBeNull()
  })
})

describe('rankForLevel and nextRank (overall)', () => {
  const cases: Array<[number, string]> = [
    [1, 'Newcomer'],
    [4, 'Newcomer'],
    [5, 'Adventurer'],
    [9, 'Adventurer'],
    [10, 'Trailblazer'],
    [24, 'Veteran'],
    [25, 'Legend'],
  ]

  it.each(cases)('the character at level %i is %s', (level, name) => {
    expect(rankForLevel('overall', level).name).toBe(name)
  })

  it('measures levels away from the current level', () => {
    expect(nextRank('overall', 1)).toEqual({
      name: 'Adventurer',
      level: 5,
      levelsAway: 4,
    })
    expect(nextRank('overall', 9)).toEqual({
      name: 'Trailblazer',
      level: 10,
      levelsAway: 1,
    })
    expect(nextRank('overall', 24)).toEqual({
      name: 'Legend',
      level: 25,
      levelsAway: 1,
    })
    expect(nextRank('overall', 25)).toBeNull()
  })
})

describe('rankLadder', () => {
  it('marks earlier, current, next, and later ranks', () => {
    expect(rankLadder('programming', 4).map((rank) => rank.state)).toEqual([
      'earlier',
      'current',
      'next',
      'later',
      'later',
    ])
  })

  it('marks the first rank as current at level 1', () => {
    expect(rankLadder('programming', 1).map((rank) => rank.state)).toEqual([
      'current',
      'next',
      'later',
      'later',
      'later',
    ])
  })

  it('marks only the top rank as current at the top', () => {
    expect(rankLadder('programming', 12).map((rank) => rank.state)).toEqual([
      'earlier',
      'earlier',
      'earlier',
      'earlier',
      'current',
    ])
    expect(rankLadder('overall', 25).map((rank) => rank.state)).toEqual([
      'earlier',
      'earlier',
      'earlier',
      'earlier',
      'current',
    ])
  })

  it('keeps the ladder complete when the level sits between ranks', () => {
    expect(rankLadder('overall', 24).map((rank) => rank.state)).toEqual([
      'earlier',
      'earlier',
      'earlier',
      'current',
      'next',
    ])
  })

  it('treats levels below 1 as level 1', () => {
    expect(rankForLevel('learning', 0)).toEqual({ name: 'Beginner', level: 1 })
    expect(rankForLevel('overall', -3)).toEqual({
      name: 'Newcomer',
      level: 1,
    })
  })
})
