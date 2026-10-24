// The crash screen's emergency backup. Unlike `createBackupDownload` it only
// reads from storage and never writes settings, because on a crash the adapter
// itself may be what failed — the backup must not depend on writes succeeding.

import { backupFileName, serializeBackup } from './backup'
import type { BackupDownload } from './backup-actions'
import type { StorageAdapter } from './storage/types'

/**
 * Exports everything and returns it as a ready-to-download backup, named for
 * the local day of `timestamp` in `timeZone`. Reads only: stored settings are
 * left untouched.
 */
export async function createEmergencyBackup(
  adapter: StorageAdapter,
  timestamp: string,
  timeZone: string,
): Promise<BackupDownload> {
  const snapshot = await adapter.exportAll()
  return {
    fileName: backupFileName(timestamp, timeZone),
    contents: serializeBackup(snapshot),
  }
}
