import { useState } from 'react'
import { toast } from 'sonner'
import { FormDialog } from '@/components/common/form-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { COMMON_COPY, SETTINGS_COPY } from '@/lib/copy'
import { TOAST_DURATION, TOAST_ID } from '@/lib/toast'
import { useAppData } from '@/hooks/use-app-data'

const RESET_CONFIRM_TEXT = 'RESET'

interface ResetDialogProps {
  onClose: () => void
}
export function ResetDialog({ onClose }: ResetDialogProps) {
  const { exportBackup, resetAll } = useAppData()
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState<'download' | 'reset' | null>(null)
  const canReset = confirm === RESET_CONFIRM_TEXT

  const handleDownloadFirst = async () => {
    setBusy('download')
    try {
      // The browser's download bar is the confirmation; no toast needed.
      await exportBackup()
    } catch {
      toast.error(SETTINGS_COPY.exportFailed, {
        id: TOAST_ID.error,
        duration: TOAST_DURATION.error,
      })
    } finally {
      setBusy(null)
    }
  }

  const handleReset = async () => {
    if (!canReset) return
    setBusy('reset')
    try {
      await resetAll()
      toast.success(SETTINGS_COPY.resetSuccess, {
        id: TOAST_ID.info,
        duration: TOAST_DURATION.info,
      })
      onClose()
    } catch {
      toast.error(SETTINGS_COPY.resetFailed, {
        id: TOAST_ID.error,
        duration: TOAST_DURATION.error,
      })
    } finally {
      setBusy(null)
    }
  }

  return (
    <FormDialog
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      title={SETTINGS_COPY.resetDialogTitle}
      description={SETTINGS_COPY.resetDialogBody}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            {COMMON_COPY.cancel}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!canReset || busy !== null}
            onClick={() => {
              void handleReset()
            }}
          >
            {SETTINGS_COPY.resetButton}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          disabled={busy !== null}
          onClick={() => {
            void handleDownloadFirst()
          }}
        >
          {SETTINGS_COPY.resetDownloadFirst}
        </Button>

        <div className="space-y-1.5">
          <label
            htmlFor="settings-reset-confirm"
            className="text-xs text-muted-foreground"
          >
            {SETTINGS_COPY.resetConfirmLabel}
          </label>
          <Input
            id="settings-reset-confirm"
            value={confirm}
            placeholder={SETTINGS_COPY.resetConfirmPlaceholder}
            className="min-h-11"
            autoComplete="off"
            onChange={(event) => setConfirm(event.target.value)}
          />
        </div>
      </div>
    </FormDialog>
  )
}
