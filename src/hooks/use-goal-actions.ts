// Write actions for daily goals and their recurring templates, kept out of the
// provider component so each file stays small. `ensureTodayGoals` materializes a
// day's goals from active templates; it is idempotent because the pure planner
// skips templates that already have a goal (even a soft-deleted one) for the day.

import { useCallback, useRef } from 'react'
import {
  ensureTodayGoalsInto,
  summarizeGoalsByDay,
  withGoalDetails,
  withGoalDone,
  withTemplateDetails,
  type GoalDetails,
  type GoalTemplateDetails,
} from '@/lib/goals'
import { computeProgress, detectLevelUps, xpForGoal } from '@/lib/progress'
import { createSyncFields, nowIso, storage } from '@/lib/storage'
import type { Progress } from '@/lib/progress'
import type { DailyGoal, GoalTemplate } from '@/lib/types'
import type {
  GoalDetailsInput,
  GoalTemplateInput,
  GoalToggleResult,
  LoadedData,
} from './app-data-context'

interface UseGoalActionsOptions {
  data: LoadedData
  progress: Progress
  todayKey: string
  timeZone: string
  refresh: () => Promise<LoadedData>
}

export interface GoalActions {
  addDailyGoal: (input: GoalDetailsInput) => Promise<DailyGoal>
  updateDailyGoal: (goalId: string, input: GoalDetailsInput) => Promise<void>
  toggleDailyGoal: (goalId: string) => Promise<GoalToggleResult | null>
  deleteDailyGoal: (goalId: string) => Promise<void>
  restoreDailyGoal: (goal: DailyGoal) => Promise<void>
  createTemplate: (input: GoalTemplateInput) => Promise<GoalTemplate>
  updateTemplate: (
    templateId: string,
    input: GoalTemplateInput,
  ) => Promise<void>
  deleteTemplate: (templateId: string) => Promise<void>
  restoreTemplate: (template: GoalTemplate) => Promise<void>
  ensureTodayGoals: () => Promise<void>
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

export function useGoalActions({
  data,
  progress,
  todayKey,
  timeZone,
  refresh,
}: UseGoalActionsOptions): GoalActions {
  // Guards against two ensure runs (mount plus visibility) racing to create the
  // same goals before the first refresh lands.
  const ensuring = useRef(false)

  const materializeTodayGoals = useCallback(async (): Promise<void> => {
    const created = await ensureTodayGoalsInto(storage, todayKey)
    if (created.length > 0) {
      await refresh()
    }
  }, [refresh, todayKey])

  const ensureTodayGoals = useCallback(async (): Promise<void> => {
    if (ensuring.current) return
    ensuring.current = true
    try {
      await materializeTodayGoals()
    } finally {
      ensuring.current = false
    }
  }, [materializeTodayGoals])

  const addDailyGoal = useCallback(
    async (input: GoalDetailsInput): Promise<DailyGoal> => {
      const goal: DailyGoal = {
        ...createSyncFields(),
        date: todayKey,
        title: input.title.trim(),
        skillId: input.skillId,
        templateId: null,
        done: false,
        doneAt: null,
      }
      await storage.saveDailyGoal(goal)
      await refresh()
      return goal
    },
    [refresh, todayKey],
  )

  const updateDailyGoal = useCallback(
    async (goalId: string, input: GoalDetailsInput): Promise<void> => {
      const goal = data.goals.find((candidate) => candidate.id === goalId)
      if (!goal) return
      const details: GoalDetails = {
        title: input.title.trim(),
        skillId: input.skillId,
      }
      await storage.saveDailyGoal(withGoalDetails(goal, details, nowIso()))
      await refresh()
    },
    [data.goals, refresh],
  )

  const toggleDailyGoal = useCallback(
    async (goalId: string): Promise<GoalToggleResult | null> => {
      const goal = data.goals.find((candidate) => candidate.id === goalId)
      if (!goal) return null
      const before = progress
      const timestamp = nowIso()
      const updated = withGoalDone(goal, !goal.done, timestamp)
      await storage.saveDailyGoal(updated)
      const loaded = await refresh()
      const summary = summarizeGoalsByDay(
        loaded.goals.filter((candidate) => candidate.date === updated.date),
        todayKey,
      ).get(updated.date)
      return {
        goal: updated,
        xp: xpForGoal(updated),
        skillId: updated.skillId,
        levelUps: detectLevelUps(
          before,
          progressFor(loaded, todayKey, timeZone),
        ),
        completedAllGoals:
          updated.done &&
          summary !== undefined &&
          summary.done === summary.total,
      }
    },
    [data.goals, progress, refresh, timeZone, todayKey],
  )

  const deleteDailyGoal = useCallback(
    async (goalId: string): Promise<void> => {
      await storage.deleteDailyGoal(goalId)
      await refresh()
    },
    [refresh],
  )

  const restoreDailyGoal = useCallback(
    async (goal: DailyGoal): Promise<void> => {
      await storage.saveDailyGoal({
        ...goal,
        deletedAt: null,
        updatedAt: nowIso(),
      })
      await refresh()
    },
    [refresh],
  )

  const createTemplate = useCallback(
    async (input: GoalTemplateInput): Promise<GoalTemplate> => {
      const template: GoalTemplate = {
        ...createSyncFields(),
        title: input.title.trim(),
        skillId: input.skillId,
        days: input.days,
        active: input.active,
      }
      await storage.saveGoalTemplate(template)
      await refresh()
      // A template scheduled for today should show up right away on the Home card.
      await materializeTodayGoals()
      return template
    },
    [refresh, materializeTodayGoals],
  )

  const updateTemplate = useCallback(
    async (templateId: string, input: GoalTemplateInput): Promise<void> => {
      const template = data.templates.find(
        (candidate) => candidate.id === templateId,
      )
      if (!template) return
      const details: GoalTemplateDetails = {
        title: input.title.trim(),
        skillId: input.skillId,
        days: input.days,
        active: input.active,
      }
      await storage.saveGoalTemplate(
        withTemplateDetails(template, details, nowIso()),
      )
      await refresh()
      await materializeTodayGoals()
    },
    [data.templates, refresh, materializeTodayGoals],
  )

  const deleteTemplate = useCallback(
    async (templateId: string): Promise<void> => {
      await storage.deleteGoalTemplate(templateId)
      await refresh()
    },
    [refresh],
  )

  const restoreTemplate = useCallback(
    async (template: GoalTemplate): Promise<void> => {
      await storage.saveGoalTemplate({
        ...template,
        deletedAt: null,
        updatedAt: nowIso(),
      })
      await refresh()
    },
    [refresh],
  )

  return {
    addDailyGoal,
    updateDailyGoal,
    toggleDailyGoal,
    deleteDailyGoal,
    restoreDailyGoal,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    restoreTemplate,
    ensureTodayGoals,
  }
}
