// Pure helpers for the backup feature: the download file name, the record
// counts shown in the import confirmation, JSON serialization, and parsing an
// untrusted backup file into a validated `ExportData`. Nothing here touches the
// DOM or storage, so the whole flow is unit tested.

import { toLocalDateKey } from '@/lib/day'
import { SCHEMA_VERSION, parseExportData } from '@/lib/schema'
import type {
  DailyGoal,
  Entry,
  ExportData,
  GoalTemplate,
  Quest,
  Tag,
} from '@/lib/types'

/** The slices of an export the counts are derived from. */
export interface BackupCountable {
  entries: readonly Entry[]
  quests: readonly Quest[]
  tags: readonly Tag[]
  goalTemplates: readonly GoalTemplate[]
  dailyGoals: readonly DailyGoal[]
}

/** How many of each record type a backup (or the current data) holds. */
export interface BackupCounts {
  entries: number
  quests: number
  tags: number
  /** Goal templates plus daily goals, i.e. every goal record. */
  goals: number
}

/**
 * `amdy-world-backup-YYYY-MM-DD.json` named for the **local** day the backup was
 * taken (activity is grouped by the device's local day everywhere). The timestamp is
 * an ISO value and the time zone an IANA name, so a backup at 23:30 local does
 * not jump to the next or previous day.
 */
export function backupFileName(timestamp: string, timeZone: string): string {
  return `amdy-world-backup-${toLocalDateKey(timestamp, timeZone)}.json`
}

/** Counts the records in a backup payload or in the loaded live data. */
export function countBackupRecords(data: BackupCountable): BackupCounts {
  return {
    entries: data.entries.length,
    quests: data.quests.length,
    tags: data.tags.length,
    goals: data.goalTemplates.length + data.dailyGoals.length,
  }
}

/** Pretty-prints a snapshot so a downloaded backup stays human readable. */
export function serializeBackup(data: ExportData): string {
  return JSON.stringify(data, null, 2)
}

/** Why a chosen file could not be used as a backup. */
export type BackupParseFailure =
  'invalid-json' | 'invalid-format' | 'unsupported-version'

/** The result of reading a chosen file: a validated snapshot or a reason. */
export type BackupParseResult =
  { ok: true; data: ExportData } | { ok: false; reason: BackupParseFailure }

/** Reads a numeric `schemaVersion` off an unknown payload, or null if absent. */
function readSchemaVersion(value: unknown): number | null {
  if (typeof value !== 'object' || value === null) return null
  const { schemaVersion } = value as { schemaVersion?: unknown }
  return typeof schemaVersion === 'number' ? schemaVersion : null
}

/**
 * Turns the text of a chosen file into a validated snapshot. Malformed JSON,
 * files that do not match the export schema, and files written by a newer app
 * version all come back as `ok: false` with a reason, so the caller can show one
 * clear message and change nothing. Older files still import because
 * `parseExportData` normalizes legacy fields first.
 */
export function parseBackupFile(contents: string): BackupParseResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(contents)
  } catch {
    return { ok: false, reason: 'invalid-json' }
  }

  const version = readSchemaVersion(parsed)
  if (version !== null && version > SCHEMA_VERSION) {
    return { ok: false, reason: 'unsupported-version' }
  }

  try {
    return { ok: true, data: parseExportData(parsed) }
  } catch {
    return { ok: false, reason: 'invalid-format' }
  }
}
