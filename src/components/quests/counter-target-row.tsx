import { Input } from '@/components/ui/input'
import { QUEST_COPY } from '@/lib/copy'

interface CounterTargetRowProps {
  unit: string
  total: string
  /** Validation messages shown inline under their own input, if any. */
  unitError: string | null
  totalError: string | null
  onUnitChange: (unit: string) => void
  onTotalChange: (total: string) => void
  idPrefix: string
}

/**
 * The always-visible counter fields: Unit and Total side by side, each with
 * its short inline error. Pure input handling — validation happens in the
 * dialog with `validateCounterForm`.
 */
export function CounterTargetRow({
  unit,
  total,
  unitError,
  totalError,
  onUnitChange,
  onTotalChange,
  idPrefix,
}: CounterTargetRowProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="space-y-1.5">
        <label
          htmlFor={`${idPrefix}-counter-unit`}
          className="text-xs text-muted-foreground"
        >
          {QUEST_COPY.counterUnitLabel}
        </label>
        <Input
          id={`${idPrefix}-counter-unit`}
          dir="auto"
          value={unit}
          placeholder={QUEST_COPY.counterUnitPlaceholder}
          onChange={(event) => onUnitChange(event.target.value)}
          className="h-11"
          autoComplete="off"
        />
        {unitError ? (
          <p role="alert" className="text-xs text-destructive">
            {unitError}
          </p>
        ) : null}
      </div>
      <div className="space-y-1.5">
        <label
          htmlFor={`${idPrefix}-counter-total`}
          className="text-xs text-muted-foreground"
        >
          {QUEST_COPY.counterTotalLabel}
        </label>
        <Input
          id={`${idPrefix}-counter-total`}
          type="number"
          inputMode="numeric"
          min={1}
          value={total}
          onChange={(event) => onTotalChange(event.target.value)}
          className="h-11"
        />
        {totalError ? (
          <p role="alert" className="text-xs text-destructive mt-1.5">
            {totalError}
          </p>
        ) : null}
      </div>
    </div>
  )
}
