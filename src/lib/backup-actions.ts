// Storage orchestration for the Settings "data" actions. These take a
// `StorageAdapter` so the same code runs against Dexie in the app and the
// in-memory adapter in tests; business logic stays in `src/lib/`, out of the UI.
// The React hook only wires these to the shared adapter and refreshes state.

import { backupFileName, serializeBackup } from './backup'
import { buildSampleData, type SampleData } from './sample-data'
import type { StorageAdapter } from './storage/types'
import type { ExportData } from './types'

/** A backup ready to download: the file name and its JSON contents. */
export interface BackupDownload {
  fileName: string
  contents: string
}

/**
 * Exports everything, stamps `lastExportedAt` on both the saved settings and the
 * downloaded snapshot (so the file records when it was taken), and returns the
 * bytes for the caller to save.
 */
export async function createBackupDownload(
  adapter: StorageAdapter,
  timestamp: string,
  timeZone: string,
): Promise<BackupDownload> {
  const snapshot = await adapter.exportAll()
  const stamped: ExportData = {
    ...snapshot,
    settings: { ...snapshot.settings, lastExportedAt: timestamp },
  }
  await adapter.saveSettings(stamped.settings)
  return {
    fileName: backupFileName(timestamp, timeZone),
    contents: serializeBackup(stamped),
  }
}

/** Replaces all stored data with a validated snapshot. */
export async function importBackupInto(
  adapter: StorageAdapter,
  snapshot: ExportData,
): Promise<void> {
  await adapter.importAll(snapshot)
}

/** Hard-deletes every record, including settings. */
export async function resetAllData(adapter: StorageAdapter): Promise<void> {
  await adapter.clearAll()
}

/** Saves the demo records, daily goals and templates before the rest. */
export async function saveSampleData(
  adapter: StorageAdapter,
  sample: SampleData,
): Promise<void> {
  for (const goal of sample.dailyGoals) {
    await adapter.saveDailyGoal(goal)
  }
  for (const template of sample.goalTemplates) {
    await adapter.saveGoalTemplate(template)
  }
  await Promise.all([
    ...sample.entries.map((entry) => adapter.saveEntry(entry)),
    ...sample.quests.map((quest) => adapter.saveQuest(quest)),
    ...sample.tags.map((tag) => adapter.saveTag(tag)),
  ])
}

/**
 * Replaces any existing sample records with a fresh demo history. It removes the
 * old samples first, so loading twice never duplicates them.
 */
export async function loadSampleDataInto(
  adapter: StorageAdapter,
  timestamp: string,
  todayKey: string,
): Promise<void> {
  const sample = buildSampleData(timestamp, todayKey)
  await adapter.removeSampleData()
  await saveSampleData(adapter, sample)
}

/** Removes only the records flagged `isSample`, leaving real data intact. */
export async function removeSampleDataFrom(
  adapter: StorageAdapter,
): Promise<void> {
  await adapter.removeSampleData()
}
