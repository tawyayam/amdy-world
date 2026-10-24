// Derived values of a counter quest: the current value, its milestones, and the
// XP they grant. Pure — the current value is never stored, it is replayed from
// `startValue` plus the update log, so lowering the value later removes XP.

import { toLocalDateKey } from '@/lib/day'
import { COUNTER_MILESTONE_XP } from './rules'
import type { Quest, QuestCounter } from '@/lib/types'

/** The counter settings of a quest, or null when it is not a counter quest. */
export function questCounter(quest: Quest): QuestCounter | null {
  return quest.kind === 'counter' && quest.counter ? quest.counter : null
}

/**
 * The value a counter quest is at: `startValue` plus every delta, clamped to
 * `[0, total]`. Negative corrections therefore pull the value back down.
 */
export function counterCurrentValue(quest: Quest): number {
  const counter = questCounter(quest)
  if (!counter) return 0
  const raw = counter.updates.reduce(
    (sum, update) => sum + update.delta,
    counter.startValue,
  )
  return Math.min(counter.total, Math.max(0, raw))
}

/**
 * True when a counter quest cannot go any higher, i.e. its value has reached the
 * total. False for a steps quest or a quest below its total. Drives the +1/+5
 * controls, which stop making sense at the top while "Set to…" and Undo stay
 * available.
 */
export function counterAtTotal(quest: Quest): boolean {
  const counter = questCounter(quest)
  if (!counter) return false
  return counterCurrentValue(quest) >= counter.total
}

/**
 * The values that grant milestone XP, strictly increasing and all below 100%:
 * the end of each section when sections exist, otherwise 25%, 50%, and 75% of
 * the total (rounded up). Duplicates are merged and the total itself never
 * counts as a milestone — finishing the quest is its own reward.
 */
export function counterMilestones(quest: Quest): number[] {
  const counter = questCounter(quest)
  if (!counter) return []
  const candidates = counter.sections
    ? counter.sections.map((section) => section.endAt)
    : [0.25, 0.5, 0.75].map((share) => Math.ceil(counter.total * share))
  return [...new Set(candidates)]
    .filter((value) => value < counter.total)
    .sort((first, second) => first - second)
}

/** The first milestone above the current value, or null when none remain. */
export function counterNextMilestone(quest: Quest): number | null {
  const value = counterCurrentValue(quest)
  return counterMilestones(quest).find((milestone) => milestone > value) ?? null
}

/** XP the quest's milestones currently grant. Falls away when the value drops. */
export function counterMilestoneXp(quest: Quest): number {
  const value = counterCurrentValue(quest)
  const reached = counterMilestones(quest).filter(
    (milestone) => value >= milestone,
  ).length
  return reached * COUNTER_MILESTONE_XP
}

/**
 * The local day a milestone was crossed, by replaying the updates in order.
 * Returns null when the milestone was already met by the starting value (no
 * update recorded it) or when it has not been reached yet.
 */
export function counterMilestoneReachedOn(
  quest: Quest,
  milestone: number,
  timeZone: string,
): string | null {
  const counter = questCounter(quest)
  if (!counter) return null
  let value = counter.startValue
  if (value >= milestone) return null
  const ordered = [...counter.updates].sort((first, second) =>
    first.at.localeCompare(second.at),
  )
  for (const update of ordered) {
    value += update.delta
    if (value >= milestone) {
      return toLocalDateKey(update.at, timeZone)
    }
  }
  return null
}

/** Where inside its sections a counter sits, for the "Section 2 · 3 of 8" line. */
export interface CounterSectionPosition {
  title: string
  /** 1-based position of the section, for "Section 2". */
  number: number
  /** Progress inside this section. */
  value: number
  /** Size of this section. */
  size: number
}

/** The section the current value sits in, or null when there are no sections. */
export function counterCurrentSection(
  quest: Quest,
): CounterSectionPosition | null {
  const counter = questCounter(quest)
  if (!counter || !counter.sections || counter.sections.length === 0) {
    return null
  }
  const value = counterCurrentValue(quest)
  let previousEnd = 0
  for (const [index, section] of counter.sections.entries()) {
    if (value <= section.endAt) {
      return {
        title: section.title,
        number: index + 1,
        value: value - previousEnd,
        size: section.endAt - previousEnd,
      }
    }
    previousEnd = section.endAt
  }
  return null
}
