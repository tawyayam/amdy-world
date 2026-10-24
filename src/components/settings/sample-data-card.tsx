import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { CardDescription, CardTitle } from '@/components/ui/card'
import { useAppData } from '@/hooks/use-app-data'
import { SETTINGS_COPY } from '@/lib/copy'
import { countSampleRecords } from '@/lib/sample-data'
import { TOAST_DURATION, TOAST_ID } from '@/lib/toast'
import {
  SettingsCard,
  SettingsCardContent,
  SettingsCardHeader,
} from './settings-card'

/** Loads or removes the demo history, showing how many sample records exist. */
export function SampleDataCard() {
  const {
    entries,
    quests,
    tags,
    templates,
    allGoals,
    loadSampleData,
    removeSampleData,
  } = useAppData()
  const [busy, setBusy] = useState<'load' | 'remove' | null>(null)

  const sampleCount = countSampleRecords({
    entries,
    quests,
    tags,
    goalTemplates: templates,
    dailyGoals: allGoals,
  })

  const handleLoad = async () => {
    setBusy('load')
    try {
      // The count line above updates in place, so success needs no toast.
      await loadSampleData()
    } catch {
      toast.error(SETTINGS_COPY.sampleDataLoadFailed, {
        id: TOAST_ID.error,
        duration: TOAST_DURATION.error,
      })
    } finally {
      setBusy(null)
    }
  }

  const handleRemove = async () => {
    setBusy('remove')
    try {
      // The count line above updates in place, so success needs no toast.
      await removeSampleData()
    } catch {
      toast.error(SETTINGS_COPY.sampleDataRemoveFailed, {
        id: TOAST_ID.error,
        duration: TOAST_DURATION.error,
      })
    } finally {
      setBusy(null)
    }
  }

  return (
    <SettingsCard>
      <SettingsCardHeader>
        <CardTitle>{SETTINGS_COPY.sampleDataTitle}</CardTitle>
        <CardDescription>{SETTINGS_COPY.sampleDataDescription}</CardDescription>
      </SettingsCardHeader>
      <SettingsCardContent className="space-y-4">
        <p className="text-sm tabular-nums" role="status">
          {SETTINGS_COPY.sampleDataCount(sampleCount)}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            disabled={busy !== null}
            onClick={() => {
              void handleLoad()
            }}
          >
            {SETTINGS_COPY.loadSampleData}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            disabled={busy !== null || sampleCount === 0}
            onClick={() => {
              void handleRemove()
            }}
          >
            {SETTINGS_COPY.removeSampleData}
          </Button>
        </div>
      </SettingsCardContent>
    </SettingsCard>
  )
}
