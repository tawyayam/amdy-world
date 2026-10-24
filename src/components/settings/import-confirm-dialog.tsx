import { FormDialog } from '@/components/common/form-dialog'
import { Button } from '@/components/ui/button'
import { useAppData } from '@/hooks/use-app-data'
import { countBackupRecords, type BackupCounts } from '@/lib/backup'
import { COMMON_COPY, SETTINGS_COPY } from '@/lib/copy'
import type { ExportData } from '@/lib/types'

interface ImportConfirmDialogProps {
  snapshot: ExportData
  /** True while the confirmed import runs, so the button shows busy. */
  importing: boolean
  onConfirm: () => Promise<void>
  onClose: () => void
}

const COUNT_ROWS: readonly { key: keyof BackupCounts; label: string }[] = [
  { key: 'entries', label: SETTINGS_COPY.importCountEntries },
  { key: 'quests', label: SETTINGS_COPY.importCountQuests },
  { key: 'tags', label: SETTINGS_COPY.importCountTags },
  { key: 'goals', label: SETTINGS_COPY.importCountGoals },
]

function CountColumn({
  label,
  counts,
}: {
  label: string
  counts: BackupCounts
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="mb-2 text-sm font-medium">{label}</p>
      <dl className="space-y-1 text-sm">
        {COUNT_ROWS.map((row) => (
          <div key={row.key} className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="font-medium tabular-nums">{counts[row.key]}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/** Confirms importing a backup, showing what the file holds versus today. */
export function ImportConfirmDialog({
  snapshot,
  importing,
  onConfirm,
  onClose,
}: ImportConfirmDialogProps) {
  const { entries, quests, tags, templates, allGoals } = useAppData()

  const fileCounts = countBackupRecords(snapshot)
  const currentCounts = countBackupRecords({
    entries,
    quests,
    tags,
    goalTemplates: templates,
    dailyGoals: allGoals,
  })

  return (
    <FormDialog
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      title={SETTINGS_COPY.importDialogTitle}
      description={SETTINGS_COPY.importDialogBody}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            {COMMON_COPY.cancel}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={importing}
            onClick={() => {
              void onConfirm()
            }}
          >
            {SETTINGS_COPY.importButton}
          </Button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <CountColumn
          label={SETTINGS_COPY.importCurrentLabel}
          counts={currentCounts}
        />
        <CountColumn
          label={SETTINGS_COPY.importFileLabel}
          counts={fileCounts}
        />
      </div>
    </FormDialog>
  )
}
