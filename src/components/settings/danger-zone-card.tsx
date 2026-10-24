import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CardDescription, CardTitle } from '@/components/ui/card'
import { SETTINGS_COPY } from '@/lib/copy'
import { ResetDialog } from './reset-dialog'
import {
  SettingsCard,
  SettingsCardContent,
  SettingsCardHeader,
} from './settings-card'

/** Danger zone: wipes everything after typing RESET. */
export function DangerZoneCard() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <SettingsCard>
        <SettingsCardHeader>
          <CardTitle className="text-destructive">
            {SETTINGS_COPY.dangerTitle}
          </CardTitle>
          <CardDescription>{SETTINGS_COPY.resetDescription}</CardDescription>
        </SettingsCardHeader>
        <SettingsCardContent>
          <Button
            type="button"
            variant="destructive"
            className="min-h-11"
            onClick={() => setOpen(true)}
          >
            <AlertTriangle className="size-4" aria-hidden="true" />
            {SETTINGS_COPY.resetButton}
          </Button>
        </SettingsCardContent>
      </SettingsCard>
      {open ? <ResetDialog onClose={() => setOpen(false)} /> : null}
    </>
  )
}
