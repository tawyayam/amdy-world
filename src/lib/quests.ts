// Pure helpers for quests: presentation (progress, next up, stalled) and the
// small mutations the quest screens need. Keeping the mutations here means
// components never rebuild a quest by hand; they call a hook that uses these
// functions.

import { daysBetweenDateKeys, isDateKeyAfter, toLocalDateKey } from '@/lib/day'
import { counterCurrentValue, questCounter } from '@/lib/progress/counter'
import type { SkillId } from '@/lib/skills'
import type {
  Entry,
  Quest,
  QuestCounterSection,
  QuestCounterUpdate,
  QuestStatus,
  QuestStep,
} from '@/lib/types'

/** How far a quest has come, for a "2/4 steps" label. */
export interface QuestStepProgress {
  done: number
  total: number
}

/** Where a step should move when reordered. */
export type StepDirection = 'up' | 'down'

/** The skill and tag facets the Quests list can filter by. */
export interface QuestFilters {
  status: QuestStatus | 'all'
  skillId: SkillId | 'all'
  tagId: string | 'all'
}

/** A change to a counter quest's value: a delta, or an absolute target. */
export type CounterChange =
  { kind: 'delta'; delta: number } | { kind: 'set'; value: number }

/** The next thing to do on a quest, for the "Next: …" line on cards. */
export type QuestNextUp =
  | { kind: 'counter'; nextValue: number; unit: string }
  | { kind: 'step'; title: string }
  | null

/**
 * A quest has stalled when it has had no progress at all for this many local
 * days. Shown as a quiet line, never as an error.
 */
export const STALLED_AFTER_DAYS = 7

/**
 * True when an entry is already linked to a quest that still exists. A link to
 * a soft-deleted quest does not count, so such an entry can be promoted again.
 */
export function isPromotedToLiveQuest(
  entry: Entry,
  quests: readonly Quest[],
): boolean {
  const questId = entry.meta?.promotedToQuestId
  return questId !== undefined && quests.some((quest) => quest.id === questId)
}

/**
 * The skill a promoted quest starts with: ideas become programming quests (the
 * usual follow-through), everything else keeps the entry's own skill.
 */
export function defaultSkillForPromotion(entry: Entry): SkillId {
  if (entry.type === 'idea') {
    return 'programming'
  }
  return entry.skillId ?? 'programming'
}

/** Quests still in progress, newest first. */
export function activeQuests(quests: readonly Quest[]): Quest[] {
  return sortQuestsNewestFirst(
    quests.filter((quest) => quest.status === 'active'),
  )
}

/** Newest first, so the most recently started quest sits on top. Returns a copy. */
function sortQuestsNewestFirst(quests: readonly Quest[]): Quest[] {
  return [...quests].sort((first, second) =>
    second.createdAt.localeCompare(first.createdAt),
  )
}

/** The order the grouped Quests list shows its sections in. */
export const QUEST_STATUS_ORDER: readonly QuestStatus[] = [
  'active',
  'paused',
  'done',
]

/** Quests bucketed by status, each bucket newest first, ready for the list. */
export type QuestsByStatus = Record<QuestStatus, Quest[]>

/**
 * Splits quests into their status sections, each ordered newest first. Every
 * status is always present (possibly with an empty list) so the screen can
 * decide which sections to render.
 */
export function groupQuestsByStatus(quests: readonly Quest[]): QuestsByStatus {
  const groups: QuestsByStatus = { active: [], paused: [], done: [] }
  for (const quest of quests) {
    groups[quest.status].push(quest)
  }
  for (const status of QUEST_STATUS_ORDER) {
    groups[status] = sortQuestsNewestFirst(groups[status])
  }
  return groups
}

/** Completed versus total steps of a quest. */
export function questStepProgress(quest: Quest): QuestStepProgress {
  return {
    done: quest.steps.filter((step) => step.done).length,
    total: quest.steps.length,
  }
}

/** Live quests ordered for the list: newest first by when they were created. */
export function orderQuestsForList(quests: readonly Quest[]): Quest[] {
  return sortQuestsNewestFirst(quests)
}

/** Keeps the quests matching every active filter facet. */
export function filterQuests(
  quests: readonly Quest[],
  filters: QuestFilters,
): Quest[] {
  return quests.filter((quest) => {
    if (filters.status !== 'all' && quest.status !== filters.status) {
      return false
    }
    if (filters.skillId !== 'all' && quest.skillId !== filters.skillId) {
      return false
    }
    if (filters.tagId !== 'all' && !quest.tagIds.includes(filters.tagId)) {
      return false
    }
    return true
  })
}

/** A quest with `step` appended. `now` stamps `updatedAt`. */
export function withAddedStep(
  quest: Quest,
  step: QuestStep,
  now: string,
): Quest {
  return { ...quest, steps: [...quest.steps, step], updatedAt: now }
}

/** Flips a step's done flag, stamping `doneAt` when it becomes done. */
export function withToggledStep(
  quest: Quest,
  stepId: string,
  now: string,
): Quest {
  return {
    ...quest,
    steps: quest.steps.map((step) =>
      step.id === stepId
        ? { ...step, done: !step.done, doneAt: step.done ? null : now }
        : step,
    ),
    updatedAt: now,
  }
}

/** Moves a step one place up or down; a no-op at the ends. */
export function withMovedStep(
  quest: Quest,
  stepId: string,
  direction: StepDirection,
  now: string,
): Quest {
  const index = quest.steps.findIndex((step) => step.id === stepId)
  const target = direction === 'up' ? index - 1 : index + 1
  if (index === -1 || target < 0 || target >= quest.steps.length) {
    return quest
  }
  const steps = [...quest.steps]
  const [moved] = steps.splice(index, 1)
  steps.splice(target, 0, moved)
  return { ...quest, steps, updatedAt: now }
}

/** Changes quest status, setting or clearing `completedAt` with it. */
export function withQuestStatus(
  quest: Quest,
  status: QuestStatus,
  now: string,
): Quest {
  return {
    ...quest,
    status,
    completedAt: status === 'done' ? now : null,
    updatedAt: now,
  }
}

/** Updates the fields the quest form edits: title, description, skill, tags. */
export function withQuestDetails(
  quest: Quest,
  details: {
    title: string
    description: string
    skillId: SkillId
    tagIds: string[]
  },
  now: string,
): Quest {
  return {
    ...quest,
    title: details.title,
    description: details.description,
    skillId: details.skillId,
    tagIds: details.tagIds,
    updatedAt: now,
  }
}

/** A counter quest with `update` appended to its log. Stamps `updatedAt`. */
export function withCounterUpdate(
  quest: Quest,
  update: QuestCounterUpdate,
  now: string,
): Quest {
  const counter = questCounter(quest)
  if (!counter) return quest
  return {
    ...quest,
    counter: { ...counter, updates: [...counter.updates, update] },
    updatedAt: now,
  }
}

/**
 * A counter quest with its most recent update removed (the Undo action). When
 * several updates share the same timestamp the last one in the array goes, so
 * undo always reverses what was just recorded.
 */
export function withRemovedLastUpdate(quest: Quest, now: string): Quest {
  const counter = questCounter(quest)
  if (!counter || counter.updates.length === 0) return quest
  return {
    ...quest,
    counter: {
      ...counter,
      updates: counter.updates.slice(0, -1),
    },
    updatedAt: now,
  }
}

/**
 * Keeps a counter quest's status following its count: at or above the total the
 * quest is `done`, below it `active`, and `paused` always wins over both.
 * Reaching the total therefore completes the quest and dropping below reopens
 * it with `completedAt` cleared.
 */
export function withCounterStatusFollowUp(quest: Quest, now: string): Quest {
  const counter = questCounter(quest)
  if (!counter || quest.status === 'paused') return quest
  const reachedTotal = counterCurrentValue(quest) >= counter.total
  if (reachedTotal && quest.status !== 'done') {
    return withQuestStatus(quest, 'done', now)
  }
  if (!reachedTotal && quest.status === 'done') {
    return withQuestStatus(quest, 'active', now)
  }
  return quest
}

/**
 * Updates the counter fields the quest form can change after creation: unit,
 * total, and sections. The starting value and the kind never change, so the
 * derived value keeps its history honest.
 */
export function withCounterDetails(
  quest: Quest,
  details: {
    unit: string
    total: number
    sections: QuestCounterSection[]
  },
  now: string,
): Quest {
  const counter = questCounter(quest)
  if (!counter) return quest
  return {
    ...quest,
    counter: {
      ...counter,
      unit: details.unit,
      total: details.total,
      sections: details.sections.length > 0 ? details.sections : undefined,
    },
    updatedAt: now,
  }
}

/** The next thing to do: the next unit value, or the first unfinished step. */
export function questNextUp(quest: Quest): QuestNextUp {
  if (quest.status === 'done') return null
  const counter = questCounter(quest)
  if (counter) {
    const value = counterCurrentValue(quest)
    if (value >= counter.total) return null
    return { kind: 'counter', nextValue: value + 1, unit: counter.unit }
  }
  const nextStep = quest.steps.find((step) => !step.done)
  return nextStep ? { kind: 'step', title: nextStep.title } : null
}

/**
 * The most recent sign of life on a quest: a counter update, a completed step,
 * or a log linked to it (journey notes or a promotion). Null when there is none.
 */
export function questLastProgressAt(
  quest: Quest,
  entries: readonly Entry[],
): string | null {
  let latest: string | null = null
  const consider = (timestamp: string | null | undefined) => {
    if (timestamp && (latest === null || timestamp > latest)) {
      latest = timestamp
    }
  }

  const counter = questCounter(quest)
  if (counter) {
    for (const update of counter.updates) consider(update.at)
  }
  for (const step of quest.steps) {
    if (step.done) consider(step.doneAt)
  }
  for (const entry of entries) {
    if (entry.deletedAt !== null) continue
    const linked =
      entry.meta?.questId === quest.id ||
      entry.meta?.promotedToQuestId === quest.id
    if (linked) consider(entry.createdAt)
  }
  return latest
}

/**
 * Whole local days since the quest last progressed, or null when it has never
 * progressed. The UI shows the quiet "No progress" line once this reaches
 * `STALLED_AFTER_DAYS`.
 */
export function questStalledDays(
  lastProgressAt: string | null,
  todayKey: string,
  timeZone: string,
): number | null {
  if (lastProgressAt === null) return null
  const lastKey = toLocalDateKey(lastProgressAt, timeZone)
  if (isDateKeyAfter(lastKey, todayKey)) return 0
  return Math.max(0, daysBetweenDateKeys(lastKey, todayKey))
}
