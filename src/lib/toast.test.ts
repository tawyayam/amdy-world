// The single achievement message a counter quest action produces: milestone,
// completion, and level-ups merged in order, Arabic titles kept intact. Also a
// guard that toast durations stay in the one place they belong.

import { describe, expect, it } from 'vitest'
import { achievementMessage } from './toast'
import type { LevelUp } from './progress'
import { rankForLevel, type RankScope } from './ranks'

const levelUp = (
  skillId: string | undefined,
  toLevel: number,
  fromLevel = toLevel - 1,
): LevelUp => {
  const scope = (skillId ?? 'overall') as RankScope
  const rank = (level: number) => rankForLevel(scope, level).name
  return skillId
    ? {
        kind: 'skill',
        skillId: skillId as never,
        fromLevel,
        toLevel,
        fromRank: rank(fromLevel),
        toRank: rank(toLevel),
      }
    : {
        kind: 'overall',
        fromLevel,
        toLevel,
        fromRank: rank(fromLevel),
        toRank: rank(toLevel),
      }
}

describe('achievementMessage', () => {
  it('reports a single milestone with the XP and skill it granted', () => {
    expect(
      achievementMessage({
        characterName: 'Amdy',
        milestonesReached: [8],
        milestoneXp: 25,
        skillId: 'learning',
        levelUps: [],
      }),
    ).toBe('Milestone reached: 8 · +25 XP · Learning')
  })

  it('folds a level-up into the milestone toast', () => {
    expect(
      achievementMessage({
        characterName: 'Amdy',
        milestonesReached: [8],
        milestoneXp: 25,
        skillId: 'learning',
        levelUps: [levelUp('learning', 3)],
      }),
    ).toBe(
      'Milestone reached: 8 · +25 XP · Learning · Learning reached level 3 · now Student',
    )
  })

  it('merges completion, milestone, and level-up into one message', () => {
    expect(
      achievementMessage({
        characterName: 'Amdy',
        completedQuest: { title: 'Learn Spanish', xp: 175 },
        milestonesReached: [12],
        milestoneXp: 25,
        skillId: 'programming',
        levelUps: [levelUp('programming', 3)],
      }),
    ).toBe(
      'Quest complete: \u2068Learn Spanish\u2069 · +175 XP · Milestone reached: 12 · Programming reached level 3 · now Apprentice',
    )
  })

  it('lists two skill level-ups in order, after an overall one', () => {
    expect(
      achievementMessage({
        characterName: 'Amdy',
        levelUps: [levelUp(undefined, 5), levelUp('programming', 3)],
      }),
    ).toBe(
      'Amdy reached level 5 · now Adventurer · Programming reached level 3 · now Apprentice',
    )
  })

  it('does not announce a rank while the level stays inside one', () => {
    expect(
      achievementMessage({
        characterName: 'Amdy',
        levelUps: [levelUp('programming', 4)],
      }),
    ).toBe('Programming reached level 4')
  })

  it('announces the new rank once when a level-up crosses it', () => {
    expect(
      achievementMessage({
        characterName: 'Amdy',
        levelUps: [levelUp('programming', 5)],
      }),
    ).toBe('Programming reached level 5 · now Builder')
  })

  it('announces both rank changes across overall and skill level-ups', () => {
    expect(
      achievementMessage({
        characterName: 'Amdy',
        levelUps: [levelUp(undefined, 10), levelUp('learning', 5)],
      }),
    ).toBe(
      'Amdy reached level 10 · now Trailblazer · Learning reached level 5 · now Explorer',
    )
  })

  it('keeps completion and a rank change in the same toast', () => {
    expect(
      achievementMessage({
        characterName: 'Amdy',
        completedQuest: { title: 'Learn Spanish', xp: 150 },
        levelUps: [levelUp('programming', 5)],
      }),
    ).toBe(
      'Quest complete: \u2068Learn Spanish\u2069 · +150 XP · Programming reached level 5 · now Builder',
    )
  })

  it('keeps an Arabic quest title in the completion line', () => {
    expect(
      achievementMessage({
        characterName: 'Amdy',
        completedQuest: { title: 'أكملت الدورة', xp: 200 },
        levelUps: [],
      }),
    ).toBe('Quest complete: \u2068أكملت الدورة\u2069 · +200 XP')
  })

  it('returns null when the action granted nothing worth toasting', () => {
    expect(
      achievementMessage({ characterName: 'Amdy', levelUps: [] }),
    ).toBeNull()
  })
})

describe('toast duration guard', () => {
  it('has no hardcoded duration literals outside src/lib/toast.ts', () => {
    const sources = import.meta.glob('/src/**/*.{ts,tsx}', {
      query: '?raw',
      import: 'default',
      eager: true,
    }) as Record<string, string>
    const offenders: string[] = []
    for (const [path, source] of Object.entries(sources)) {
      if (path.endsWith('src/lib/toast.ts')) continue
      source.split('\n').forEach((line, index) => {
        if (/\bduration\s*:\s*\d/.test(line)) {
          offenders.push(`${path}:${index + 1}`)
        }
      })
    }
    expect(offenders).toEqual([])
  })
})
