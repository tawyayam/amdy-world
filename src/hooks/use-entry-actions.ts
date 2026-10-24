// Write actions for entries (log entries and ideas), kept out of the provider
// component so each file stays small. The provider composes these into context.

import { useCallback } from 'react'
import {
  SKILL_FOR_ENTRY_TYPE,
  computeProgress,
  detectLevelUps,
  xpForEntry,
} from '@/lib/progress'
import { createSyncFields, nowIso, storage } from '@/lib/storage'
import { isPromotedToLiveQuest } from '@/lib/quests'
import type { Progress } from '@/lib/progress'
import type { SkillId } from '@/lib/skills'
import type { Entry, Quest } from '@/lib/types'
import type {
  CaptureResult,
  EntryChanges,
  LoadedData,
  NewEntryInput,
  PromotionResult,
  QuestDetailsInput,
} from './app-data-context'

interface UseEntryActionsOptions {
  data: LoadedData
  progress: Progress
  todayKey: string
  timeZone: string
  refresh: () => Promise<LoadedData>
}

export interface EntryActions {
  addEntry: (input: NewEntryInput) => Promise<CaptureResult>
  updateEntry: (entryId: string, changes: EntryChanges) => Promise<void>
  deleteEntry: (entryId: string) => Promise<void>
  restoreEntry: (entry: Entry) => Promise<void>
  promoteEntryToQuest: (
    entryId: string,
    input: QuestDetailsInput,
  ) => Promise<PromotionResult>
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

export function useEntryActions({
  data,
  progress,
  todayKey,
  timeZone,
  refresh,
}: UseEntryActionsOptions): EntryActions {
  const addEntry = useCallback(
    async (input: NewEntryInput): Promise<CaptureResult> => {
      const before = progress
      const entry: Entry = {
        ...createSyncFields(),
        type: input.type,
        text: input.text,
        skillId: input.skillId ?? SKILL_FOR_ENTRY_TYPE[input.type],
        ...(input.meta ? { meta: input.meta } : {}),
      }
      await storage.saveEntry(entry)
      const loaded = await refresh()
      return {
        entry,
        xp: xpForEntry(entry),
        skillId: entry.skillId,
        levelUps: detectLevelUps(
          before,
          progressFor(loaded, todayKey, timeZone),
        ),
      }
    },
    [progress, refresh, todayKey, timeZone],
  )

  const updateEntry = useCallback(
    async (entryId: string, changes: EntryChanges): Promise<void> => {
      const existing = data.entries.find((entry) => entry.id === entryId)
      if (!existing) return
      const updated: Entry = {
        ...existing,
        text: changes.text,
        skillId:
          changes.skillId === undefined ? existing.skillId : changes.skillId,
        updatedAt: nowIso(),
      }
      if (changes.meta === undefined) delete updated.meta
      else updated.meta = changes.meta
      await storage.saveEntry(updated)
      await refresh()
    },
    [data, refresh],
  )

  const deleteEntry = useCallback(
    async (entryId: string): Promise<void> => {
      await storage.deleteEntry(entryId)
      await refresh()
    },
    [refresh],
  )

  const restoreEntry = useCallback(
    async (entry: Entry): Promise<void> => {
      await storage.saveEntry({
        ...entry,
        deletedAt: null,
        updatedAt: nowIso(),
      })
      await refresh()
    },
    [refresh],
  )

  const promoteEntryToQuest = useCallback(
    async (
      entryId: string,
      input: QuestDetailsInput,
    ): Promise<PromotionResult> => {
      const entry = data.entries.find((candidate) => candidate.id === entryId)
      if (!entry || isPromotedToLiveQuest(entry, data.quests)) {
        throw new Error('Entry cannot be turned into a quest.')
      }
      const before = progress
      const timestamp = nowIso()
      const quest: Quest = {
        ...createSyncFields(),
        title: input.title,
        description: input.description,
        status: 'active',
        skillId: input.skillId,
        tagIds: input.tagIds,
        kind: 'steps',
        steps: [],
        ...(entry.type === 'idea' ? { originIdeaId: entry.id } : {}),
      }
      await storage.saveQuest(quest)
      const updatedEntry: Entry = {
        ...entry,
        meta: { ...entry.meta, promotedToQuestId: quest.id },
        updatedAt: timestamp,
      }
      await storage.saveEntry(updatedEntry)
      const loaded = await refresh()
      // Only ideas gain XP from promotion, and that bonus belongs to ideas.
      const skillId: SkillId = entry.type === 'idea' ? 'ideas' : input.skillId
      return {
        quest,
        xp: xpForEntry(updatedEntry) - xpForEntry(entry),
        skillId,
        levelUps: detectLevelUps(
          before,
          progressFor(loaded, todayKey, timeZone),
        ),
      }
    },
    [data, progress, refresh, todayKey, timeZone],
  )

  return {
    addEntry,
    updateEntry,
    deleteEntry,
    restoreEntry,
    promoteEntryToQuest,
  }
}
