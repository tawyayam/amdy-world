// Whole-dataset actions for Settings: download a backup, import one, reset
// everything, and load or remove the sample history. The rules live in
// `src/lib/backup-actions.ts`; this hook only wires them to the shared adapter
// and refreshes React state so screens update without a manual reload.

import { useCallback } from 'react'
import {
  createBackupDownload,
  importBackupInto,
  loadSampleDataInto,
  removeSampleDataFrom,
  resetAllData,
} from '@/lib/backup-actions'
import { downloadTextFile } from '@/lib/download'
import { nowIso, storage } from '@/lib/storage'
import { settingsForOnboarding } from '@/lib/welcome'
import type { ExportData, Settings } from '@/lib/types'
import type { LoadedData } from './app-data-context'

interface UseDataActionsOptions {
  todayKey: string
  timeZone: string
  settings: Settings
  refresh: () => Promise<LoadedData>
}

export interface DataActions {
  /** Downloads the full snapshot and stamps `lastExportedAt`. */
  exportBackup: () => Promise<void>
  /** Replaces all data with a validated snapshot. */
  importBackup: (snapshot: ExportData) => Promise<void>
  /** Clears every record, including settings. */
  resetAll: () => Promise<void>
  /** Replaces any existing sample records with a fresh sample history. */
  loadSampleData: () => Promise<void>
  /** Removes only the records flagged `isSample`. */
  removeSampleData: () => Promise<void>
  /** First run: saves the name, marks onboarding done, and enters the app. */
  startFresh: (name: string) => Promise<void>
  /** First run: saves the name, marks onboarding done, and loads sample data. */
  startWithSampleData: (name: string) => Promise<void>
  /** Marks onboarding done on the current settings, e.g. after an import. */
  finishOnboarding: () => Promise<void>
}

export function useDataActions({
  todayKey,
  timeZone,
  settings,
  refresh,
}: UseDataActionsOptions): DataActions {
  const exportBackup = useCallback(async (): Promise<void> => {
    const backup = await createBackupDownload(storage, nowIso(), timeZone)
    downloadTextFile(backup.fileName, backup.contents)
    await refresh()
  }, [refresh, timeZone])

  const importBackup = useCallback(
    async (snapshot: ExportData): Promise<void> => {
      await importBackupInto(storage, snapshot)
      await refresh()
    },
    [refresh],
  )

  const resetAll = useCallback(async (): Promise<void> => {
    await resetAllData(storage)
    await refresh()
  }, [refresh])

  const loadSampleData = useCallback(async (): Promise<void> => {
    await loadSampleDataInto(storage, nowIso(), todayKey)
    await refresh()
  }, [refresh, todayKey])

  const removeSampleData = useCallback(async (): Promise<void> => {
    await removeSampleDataFrom(storage)
    await refresh()
  }, [refresh])

  const startFresh = useCallback(
    async (name: string): Promise<void> => {
      await storage.saveSettings(
        settingsForOnboarding(settings, name, nowIso()),
      )
      await refresh()
    },
    [refresh, settings],
  )

  const startWithSampleData = useCallback(
    async (name: string): Promise<void> => {
      await storage.saveSettings(
        settingsForOnboarding(settings, name, nowIso()),
      )
      await loadSampleDataInto(storage, nowIso(), todayKey)
      await refresh()
    },
    [refresh, settings, todayKey],
  )

  const finishOnboarding = useCallback(async (): Promise<void> => {
    if (settings.onboardedAt) return
    await storage.saveSettings(
      settingsForOnboarding(settings, settings.characterName, nowIso()),
    )
    await refresh()
  }, [refresh, settings])

  return {
    exportBackup,
    importBackup,
    resetAll,
    loadSampleData,
    removeSampleData,
    startFresh,
    startWithSampleData,
    finishOnboarding,
  }
}
