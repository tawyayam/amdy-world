// Write actions for quests: create, edit, counter updates, steps, status, and
// soft delete. The actual shape changes live in `@/lib/quests`; this hook finds
// the record, applies a pure transform, saves, and refreshes. Counter updates
// also report what changed so the screen can toast XP without computing it.

import { useCallback } from 'react'
import {
  counterCurrentValue,
  counterMilestones,
  detectLevelUps,
  computeProgress,
  xpAwardsForQuest,
  type Progress,
} from '@/lib/progress'
import {
  withCounterDetails,
  withCounterStatusFollowUp,
  withCounterUpdate,
  withRemovedLastUpdate,
  withAddedStep,
  withMovedStep,
  withQuestDetails,
  withQuestStatus,
  withToggledStep,
  type CounterChange,
  type StepDirection,
} from '@/lib/quests'
import { createSyncFields, newId, nowIso, storage } from '@/lib/storage'
import type { Quest, QuestKind, QuestStatus, QuestStep } from '@/lib/types'
import type {
  CounterUpdateResult,
  LoadedData,
  QuestDetailsInput,
} from './app-data-context'

interface UseQuestActionsOptions {
  data: LoadedData
  progress: Progress
  todayKey: string
  timeZone: string
  refresh: () => Promise<LoadedData>
}

export interface QuestActions {
  createQuest: (input: QuestDetailsInput) => Promise<Quest>
  updateQuestDetails: (
    questId: string,
    input: QuestDetailsInput,
  ) => Promise<void>
  updateCounter: (
    questId: string,
    change: CounterChange,
  ) => Promise<CounterUpdateResult | null>
  undoCounterUpdate: (questId: string) => Promise<CounterUpdateResult | null>
  addQuestStep: (questId: string, title: string) => Promise<void>
  toggleQuestStep: (questId: string, stepId: string) => Promise<void>
  moveQuestStep: (
    questId: string,
    stepId: string,
    direction: StepDirection,
  ) => Promise<void>
  setQuestStatus: (questId: string, status: QuestStatus) => Promise<void>
  deleteQuest: (questId: string) => Promise<void>
  restoreQuest: (quest: Quest) => Promise<void>
}

function progressFor(loaded: LoadedData, todayKey: string, timeZone: string) {
  return computeProgress({
    entries: loaded.entries,
    quests: loaded.quests,
    goals: loaded.goals,
    todayKey,
    timeZone,
  })
}

function awardXp(quest: Quest): number {
  return xpAwardsForQuest(quest).reduce(
    (total, award) => total + award.amount,
    0,
  )
}

function counterResult(
  beforeQuest: Quest,
  afterQuest: Quest,
  beforeProgress: Progress,
  afterProgress: Progress,
): CounterUpdateResult {
  const beforeValue = counterCurrentValue(beforeQuest)
  const afterValue = counterCurrentValue(afterQuest)
  const milestonesReached = counterMilestones(beforeQuest).filter(
    (milestone) => milestone > beforeValue && milestone <= afterValue,
  )
  return {
    quest: afterQuest,
    value: afterValue,
    milestonesReached,
    xpDelta: awardXp(afterQuest) - awardXp(beforeQuest),
    completed: afterQuest.status === 'done' && beforeQuest.status !== 'done',
    levelUps: detectLevelUps(beforeProgress, afterProgress),
  }
}

export function useQuestActions({
  data,
  progress,
  todayKey,
  timeZone,
  refresh,
}: UseQuestActionsOptions): QuestActions {
  const mutateQuest = useCallback(
    async (
      questId: string,
      transform: (quest: Quest, now: string) => Quest,
    ): Promise<void> => {
      const quest = data.quests.find((candidate) => candidate.id === questId)
      if (!quest) return
      await storage.saveQuest(transform(quest, nowIso()))
      await refresh()
    },
    [data, refresh],
  )

  const createQuest = useCallback(
    async (input: QuestDetailsInput): Promise<Quest> => {
      const kind: QuestKind = input.kind ?? 'steps'
      const counter =
        kind === 'counter' && input.counter
          ? {
              unit: input.counter.unit,
              total: input.counter.total,
              startValue: input.counter.startValue ?? 0,
              ...(input.counter.sections && input.counter.sections.length > 0
                ? { sections: input.counter.sections }
                : {}),
              updates: [],
            }
          : undefined
      const quest: Quest = {
        ...createSyncFields(),
        title: input.title,
        description: input.description,
        status: 'active',
        skillId: input.skillId,
        tagIds: input.tagIds,
        kind,
        steps: [],
        ...(counter ? { counter } : {}),
      }
      await storage.saveQuest(quest)
      await refresh()
      return quest
    },
    [refresh],
  )

  const updateQuestDetails = useCallback(
    (questId: string, input: QuestDetailsInput) =>
      mutateQuest(questId, (quest, now) => {
        const detailed = withQuestDetails(quest, input, now)
        if (input.counter) {
          return withCounterStatusFollowUp(
            withCounterDetails(
              detailed,
              {
                unit: input.counter.unit,
                total: input.counter.total,
                sections: input.counter.sections ?? [],
              },
              now,
            ),
            now,
          )
        }
        return detailed
      }),
    [mutateQuest],
  )

  const updateCounter = useCallback(
    async (
      questId: string,
      change: CounterChange,
    ): Promise<CounterUpdateResult | null> => {
      const quest = data.quests.find((candidate) => candidate.id === questId)
      if (!quest || !quest.counter) return null
      const current = counterCurrentValue(quest)
      const delta =
        change.kind === 'delta' ? change.delta : change.value - current
      if (delta === 0) return null
      const before = progress
      const timestamp = nowIso()
      const updated = withCounterStatusFollowUp(
        withCounterUpdate(
          quest,
          { id: newId(), at: timestamp, delta },
          timestamp,
        ),
        timestamp,
      )
      await storage.saveQuest(updated)
      const loaded = await refresh()
      return counterResult(
        quest,
        updated,
        before,
        progressFor(loaded, todayKey, timeZone),
      )
    },
    [data, progress, refresh, todayKey, timeZone],
  )

  const undoCounterUpdate = useCallback(
    async (questId: string): Promise<CounterUpdateResult | null> => {
      const quest = data.quests.find((candidate) => candidate.id === questId)
      if (!quest || !quest.counter) return null
      const before = progress
      const timestamp = nowIso()
      const removed = withRemovedLastUpdate(quest, timestamp)
      if (removed === quest) return null
      const updated = withCounterStatusFollowUp(removed, timestamp)
      await storage.saveQuest(updated)
      const loaded = await refresh()
      return counterResult(
        quest,
        updated,
        before,
        progressFor(loaded, todayKey, timeZone),
      )
    },
    [data, progress, refresh, todayKey, timeZone],
  )

  const addQuestStep = useCallback(
    (questId: string, title: string) => {
      const step: QuestStep = {
        id: newId(),
        title,
        done: false,
        doneAt: null,
      }
      return mutateQuest(questId, (quest, now) =>
        withAddedStep(quest, step, now),
      )
    },
    [mutateQuest],
  )

  const toggleQuestStep = useCallback(
    (questId: string, stepId: string) =>
      mutateQuest(questId, (quest, now) => withToggledStep(quest, stepId, now)),
    [mutateQuest],
  )

  const moveQuestStep = useCallback(
    (questId: string, stepId: string, direction: StepDirection) =>
      mutateQuest(questId, (quest, now) =>
        withMovedStep(quest, stepId, direction, now),
      ),
    [mutateQuest],
  )

  const setQuestStatus = useCallback(
    (questId: string, status: QuestStatus) =>
      mutateQuest(questId, (quest, now) =>
        withCounterStatusFollowUp(withQuestStatus(quest, status, now), now),
      ),
    [mutateQuest],
  )

  const deleteQuest = useCallback(
    async (questId: string): Promise<void> => {
      await storage.deleteQuest(questId)
      await refresh()
    },
    [refresh],
  )

  const restoreQuest = useCallback(
    async (quest: Quest): Promise<void> => {
      await storage.saveQuest({
        ...quest,
        deletedAt: null,
        updatedAt: nowIso(),
      })
      await refresh()
    },
    [refresh],
  )

  return {
    createQuest,
    updateQuestDetails,
    updateCounter,
    undoCounterUpdate,
    addQuestStep,
    toggleQuestStep,
    moveQuestStep,
    setQuestStatus,
    deleteQuest,
    restoreQuest,
  }
}
