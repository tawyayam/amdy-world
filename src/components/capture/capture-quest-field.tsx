// Quest selector used by quick capture and the entry edit dialog. The caller
// decides which quests to offer (active ones, plus the entry's own link when
// editing); this component only renders the choice.

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CAPTURE_COPY } from '@/lib/copy'
import type { Quest } from '@/lib/types'

/** Radix Select cannot carry an empty-string value, so "none" is a sentinel. */
const NONE_VALUE = 'none'

interface CaptureQuestFieldProps {
  /** The quests to offer; the caller filters them (e.g. active only). */
  quests: readonly Quest[]
  value: string | null
  onChange: (questId: string | null) => void
  /** Namespaces the field id so two forms on screen never collide. */
  idPrefix?: string
  /** Hides the visible label but keeps it for screen readers, for inline rows. */
  labelHidden?: boolean
}

/** Compact select that links an entry to the quest it belongs to. */
export function CaptureQuestField({
  quests,
  value,
  onChange,
  idPrefix = 'capture',
  labelHidden = false,
}: CaptureQuestFieldProps) {
  const id = `${idPrefix}-quest`
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className={labelHidden ? 'sr-only' : 'text-xs text-muted-foreground'}
      >
        {CAPTURE_COPY.questLabel}
      </label>
      <Select
        value={value ?? NONE_VALUE}
        onValueChange={(next) => onChange(next === NONE_VALUE ? null : next)}
      >
        <SelectTrigger id={id} className="min-h-11 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE_VALUE}>{CAPTURE_COPY.questNone}</SelectItem>
          {quests.map((quest) => (
            <SelectItem key={quest.id} value={quest.id}>
              <span dir="auto">{quest.title}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
