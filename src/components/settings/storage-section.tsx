import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useStoragePersistence } from '@/hooks/use-storage-persistence'
import { SETTINGS_COPY } from '@/lib/copy'
import { TOAST_DURATION, TOAST_ID } from '@/lib/toast'

/**
 * The storage-protection block shown inside the Backup card, under a divider. It
 * reports whether the browser keeps this data and, when it does not, offers to
 * ask again. Rendering it here keeps the whole "keep your data" story in one
 * card instead of a separate Settings card.
 */
export function StorageSection() {
  const { state, protect } = useStoragePersistence()

  const statusLabel =
    state === 'protected'
      ? SETTINGS_COPY.storageProtected
      : state === 'unsupported'
        ? SETTINGS_COPY.storageStatusUnknown
        : SETTINGS_COPY.storageNotGuaranteed

  const handleProtect = async () => {
    const outcome = await protect()
    // The status line above updates with the result, so only a hard failure
    // needs a toast.
    if (outcome === 'error') {
      toast.error(SETTINGS_COPY.storagePersistError, {
        id: TOAST_ID.error,
        duration: TOAST_DURATION.error,
      })
    }
  }

  return (
    <section className="border-t border-border px-5 pt-5">
      <h3 className="text-sm font-semibold">{SETTINGS_COPY.storageTitle}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {SETTINGS_COPY.storageDescription}
      </p>
      <p className="mt-3 text-sm" role="status">
        {statusLabel}
      </p>
      {state === 'not-guaranteed' ? (
        <Button
          type="button"
          variant="outline"
          className="mt-3 min-h-11"
          onClick={() => {
            void handleProtect()
          }}
        >
          {SETTINGS_COPY.storageProtect}
        </Button>
      ) : null}
    </section>
  )
}
