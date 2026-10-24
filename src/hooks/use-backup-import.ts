// Shared logic for importing a backup file: the hidden file input, parsing the
// chosen file, the error toast for a rejected file, and the pending snapshot that
// drives the confirmation dialog. Both Settings and the first-run welcome screen
// use this, so the import flow behaves the same in both places.

import { useRef, useState, type ChangeEvent, type RefObject } from 'react'
import { toast } from 'sonner'
import { useAppData } from '@/hooks/use-app-data'
import { parseBackupFile, type BackupParseFailure } from '@/lib/backup'
import { SETTINGS_COPY } from '@/lib/copy'
import { TOAST_DURATION, TOAST_ID } from '@/lib/toast'
import type { ExportData } from '@/lib/types'

/** Toast copy for a rejected file, one message per failure kind. */
function invalidBackupCopy(reason: BackupParseFailure) {
  if (reason === 'unsupported-version') {
    return {
      title: SETTINGS_COPY.importUnsupportedVersionTitle,
      description: SETTINGS_COPY.importUnsupportedVersionBody,
    }
  }
  return {
    title: SETTINGS_COPY.importInvalidTitle,
    description: SETTINGS_COPY.importInvalidBody,
  }
}

export interface BackupImport {
  /** The hidden file input; open it with `fileInput.current?.click()`. */
  fileInput: RefObject<HTMLInputElement | null>
  /** A parsed snapshot awaiting confirmation, or null. */
  pending: ExportData | null
  /** Handles a file input change (parse and either toast or stage it). */
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>
  /** True while the confirmed import is running. */
  importing: boolean
  /** Imports the pending snapshot and runs `onImported` on success. */
  confirm: () => Promise<void>
  /** Clears the pending snapshot, closing the confirmation dialog. */
  cancel: () => void
}

/** Wires a backup file choice to parsing, confirmation, and the import action. */
export function useBackupImport(
  onImported?: () => void | Promise<void>,
): BackupImport {
  const { importBackup } = useAppData()
  const [pending, setPending] = useState<ExportData | null>(null)
  const [importing, setImporting] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    // Reset so picking the same file again still fires a change event.
    event.target.value = ''
    if (!file) return
    const result = parseBackupFile(await file.text())
    if (!result.ok) {
      const { title, description } = invalidBackupCopy(result.reason)
      toast.error(title, {
        id: TOAST_ID.error,
        duration: TOAST_DURATION.error,
        description,
      })
      return
    }
    setPending(result.data)
  }

  const confirm = async () => {
    if (!pending) return
    setImporting(true)
    try {
      await importBackup(pending)
      toast.success(SETTINGS_COPY.importSuccess, {
        id: TOAST_ID.info,
        duration: TOAST_DURATION.info,
      })
      setPending(null)
      await onImported?.()
    } catch {
      toast.error(SETTINGS_COPY.importFailed, {
        id: TOAST_ID.error,
        duration: TOAST_DURATION.error,
      })
    } finally {
      setImporting(false)
    }
  }

  return {
    fileInput,
    pending,
    handleFileChange,
    importing,
    confirm,
    cancel: () => setPending(null),
  }
}
