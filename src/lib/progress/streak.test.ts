import { describe, expect, it } from 'vitest'
import { computeStreak } from '@/lib/progress'
import type { StreakInput } from '@/lib/progress'
import {
  counterQuestFixture,
  entryFixture,
  goalFixture,
  questFixture,
  stepFixture,
} from './test-fixtures'

const TODAY = '2026-10-13'
const UTC = 'UTC'

function input(overrides: Partial<StreakInput> = {}): StreakInput {
  return {
    entries: [],
    quests: [],
    goals: [],
    todayKey: TODAY,
    timeZone: UTC,
    ...overrides,
  }
}

function entryOn(
  day: string,
  extra: Partial<StreakInput['entries'][number]> = {},
) {
  return entryFixture({ createdAt: `${day}T08:00:00.000Z`, ...extra })
}

describe('computeStreak', () => {
  it('is zero with no activity', () => {
    expect(computeStreak(input())).toBe(0)
  })

  it('counts today when there is an entry', () => {
    expect(computeStreak(input({ entries: [entryOn('2026-10-13')] }))).toBe(1)
  })

  it('counts consecutive days with entries', () => {
    const entries = [
      entryOn('2026-10-11', { id: 'a' }),
      entryOn('2026-10-12', { id: 'b' }),
      entryOn('2026-10-13', { id: 'c' }),
    ]
    expect(computeStreak(input({ entries }))).toBe(3)
  })

  it('stops at the first gap', () => {
    const entries = [
      entryOn('2026-10-11', { id: 'a' }),
      entryOn('2026-10-13', { id: 'c' }),
    ]
    expect(computeStreak(input({ entries }))).toBe(1)
  })

  it('keeps an unbroken streak when today is still empty', () => {
    const entries = [
      entryOn('2026-10-11', { id: 'a' }),
      entryOn('2026-10-12', { id: 'b' }),
    ]
    expect(computeStreak(input({ entries }))).toBe(2)
  })

  it('is zero when neither today nor yesterday has activity', () => {
    expect(computeStreak(input({ entries: [entryOn('2026-10-11')] }))).toBe(0)
  })

  it('counts a completed quest step', () => {
    const quests = [
      questFixture({
        steps: [
          stepFixture({ done: true, doneAt: '2026-10-13T10:00:00.000Z' }),
        ],
      }),
    ]
    expect(computeStreak(input({ quests }))).toBe(1)
  })

  it('ignores an unfinished step', () => {
    const quests = [questFixture({ steps: [stepFixture({ done: false })] })]
    expect(computeStreak(input({ quests }))).toBe(0)
  })

  it('counts a positive counter update', () => {
    const quests = [
      counterQuestFixture({
        updates: [{ id: 'u1', at: '2026-10-13T10:00:00.000Z', delta: 1 }],
      }),
    ]
    expect(computeStreak(input({ quests }))).toBe(1)
  })

  it('ignores a counter correction that only lowers the value', () => {
    const quests = [
      counterQuestFixture({
        updates: [{ id: 'u1', at: '2026-10-13T10:00:00.000Z', delta: -1 }],
      }),
    ]
    expect(computeStreak(input({ quests }))).toBe(0)
  })

  it('counts a completed goal', () => {
    const goals = [
      goalFixture({ done: true, doneAt: '2026-10-13T18:00:00.000Z' }),
    ]
    expect(computeStreak(input({ goals }))).toBe(1)
  })

  it('ignores a completed goal dated after today', () => {
    // A goal ticked today but dated tomorrow does not count: the day has not
    // arrived yet.
    const goals = [
      goalFixture({
        date: '2026-10-14',
        done: true,
        doneAt: '2026-10-13T18:00:00.000Z',
      }),
    ]
    expect(computeStreak(input({ goals }))).toBe(0)
  })

  it('ignores soft-deleted records', () => {
    const entries = [
      entryOn('2026-10-13', { deletedAt: '2026-10-13T09:00:00.000Z' }),
    ]
    const quests = [questFixture({ deletedAt: '2026-10-13T09:00:00.000Z' })]
    const goals = [
      goalFixture({
        done: true,
        doneAt: '2026-10-13T18:00:00.000Z',
        deletedAt: '2026-10-13T19:00:00.000Z',
      }),
    ]
    expect(computeStreak(input({ entries, quests, goals }))).toBe(0)
  })

  it('groups days in the given time zone', () => {
    // 02:00 UTC is the previous day in New York (UTC-4 in October).
    const entries = [
      entryOn('2026-10-13', { createdAt: '2026-10-13T02:00:00.000Z' }),
    ]
    expect(
      computeStreak(
        input({
          entries,
          todayKey: '2026-10-12',
          timeZone: 'America/New_York',
        }),
      ),
    ).toBe(1)
  })
})
