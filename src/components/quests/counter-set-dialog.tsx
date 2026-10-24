import { useState, type FormEvent } from 'react'
import { FormDialog } from '@/components/common/form-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { COMMON_COPY, QUEST_COPY } from '@/lib/copy'
import type { QuestCounter } from '@/lib/types'

interface CounterSetDialogProps {
  counter: QuestCounter
  /** The value the counter is at now, to pre-fill and bound the input. */
  currentValue: number
  /** True on a done quest: lowering the count reopens it. */
  reopensWhenLowered: boolean
  onSubmit: (value: number) => Promise<void>
  onClose: () => void
}

/**
 * "Set to…" for a counter: an absolute target, stored as the difference from
 * the current value so the update log stays honest.
 */
export function CounterSetDialog({
  counter,
  currentValue,
  reopensWhenLowered,
  onSubmit,
  onClose,
}: CounterSetDialogProps) {
  const [value, setValue] = useState(String(currentValue))
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const parsed = Number(value)
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > counter.total) {
      setError(QUEST_COPY.counterSetInvalid)
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSubmit(parsed)
      onClose()
    } catch {
      setError(COMMON_COPY.actionFailed)
    } finally {
      setSaving(false)
    }
  }

  return (
    <FormDialog
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      title={QUEST_COPY.counterSetDialogTitle}
      contentClassName="max-w-sm"
      onSubmit={handleSubmit}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            {COMMON_COPY.cancel}
          </Button>
          <Button type="submit" disabled={saving}>
            {COMMON_COPY.save}
          </Button>
        </>
      }
    >
      <div className="space-y-1.5">
        <label
          htmlFor="counter-set-value"
          className="text-xs text-muted-foreground"
        >
          {QUEST_COPY.counterSetDialogLabel}
        </label>
        <Input
          id="counter-set-value"
          type="number"
          inputMode="numeric"
          min={0}
          max={counter.total}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="h-11"
          autoFocus
        />
        <p className="text-xs text-muted-foreground">
          {QUEST_COPY.counterSetDialogHelp}
        </p>
        {reopensWhenLowered ? (
          <p className="text-xs text-muted-foreground">
            {QUEST_COPY.counterSetDialogReopenHint}
          </p>
        ) : null}
      </div>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </FormDialog>
  )
}
