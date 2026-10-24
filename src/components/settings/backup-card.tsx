import { useState } from 'react'
import { Download, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { CardDescription, CardTitle } from '@/components/ui/card'
import { useAppData } from '@/hooks/use-app-data'
import { useBackupImport } from '@/hooks/use-backup-import'
import { SETTINGS_COPY } from '@/lib/copy'
import { formatDateTime } from '@/lib/format'
import { TOAST_DURATION, TOAST_ID } from '@/lib/toast'
import { ImportConfirmDialog } from './import-confirm-dialog'
import {
  SettingsCard,
  SettingsCardContent,
  SettingsCardHeader,
} from './settings-card'
import { StorageSection } from './storage-section'

/**
 * The "keep your data" card: download a backup, import one, and (under a
 * divider) the storage-protection section. The file is chosen through a hidden
 * input opened by the visible "Import backup" button, so the control matches the
 * app's buttons and the native file input never shows.
 */
export function BackupCard() {
  const { settings, exportBackup } = useAppData()
  const [exporting, setExporting] = useState(false)
  const { fileInput, pending, handleFileChange, importing, confirm, cancel } =
    useBackupImport()

  const lastBackup = settings.lastExportedAt
    ? SETTINGS_COPY.lastBackup(formatDateTime(settings.lastExportedAt))
    : SETTINGS_COPY.lastBackupNever

  const handleExport = async () => {
    setExporting(true)
    try {
      // The browser's download bar is the confirmation; no toast needed.
      await exportBackup()
    } catch {
      toast.error(SETTINGS_COPY.exportFailed, {
        id: TOAST_ID.error,
        duration: TOAST_DURATION.error,
      })
    } finally {
      setExporting(false)
    }
  }

  return (
    <SettingsCard>
      <SettingsCardHeader>
        <CardTitle>{SETTINGS_COPY.backupTitle}</CardTitle>
        <CardDescription>{lastBackup}</CardDescription>
      </SettingsCardHeader>
      <SettingsCardContent className="space-y-4">
        <Button
          type="button"
          className="min-h-11"
          disabled={exporting}
          onClick={() => {
            void handleExport()
          }}
        >
          <Download className="size-4" aria-hidden="true" />
          {SETTINGS_COPY.downloadBackup}
        </Button>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">{SETTINGS_COPY.importTitle}</h3>
          <div className="space-y-1.5">
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              aria-describedby="settings-import-hint"
              onClick={() => fileInput.current?.click()}
            >
              <Upload className="size-4" aria-hidden="true" />
              {SETTINGS_COPY.importButton}
            </Button>
            <input
              ref={fileInput}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(event) => {
                void handleFileChange(event)
              }}
            />
            <p
              id="settings-import-hint"
              className="text-xs text-muted-foreground"
            >
              {SETTINGS_COPY.importHint}
            </p>
          </div>
        </div>
      </SettingsCardContent>

      <StorageSection />

      {pending ? (
        <ImportConfirmDialog
          snapshot={pending}
          importing={importing}
          onConfirm={confirm}
          onClose={cancel}
        />
      ) : null}
    </SettingsCard>
  )
}
