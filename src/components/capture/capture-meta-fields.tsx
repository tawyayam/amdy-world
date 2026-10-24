import { Input } from '@/components/ui/input'
import { CAPTURE_COPY } from '@/lib/copy'
import type { EntryType } from '@/lib/types'

interface CaptureMetaFieldsProps {
  type: EntryType
  pages: string
  bookTitle: string
  minutes: string
  onPagesChange: (value: string) => void
  onBookTitleChange: (value: string) => void
  onMinutesChange: (value: string) => void
  /** Namespaces the field ids so two forms on screen never collide. */
  idPrefix?: string
}

const FIELD_CLASS = 'h-11'

/** Extra fields a capture type needs: pages and book for reading, minutes for a session. */
export function CaptureMetaFields({
  type,
  pages,
  bookTitle,
  minutes,
  onPagesChange,
  onBookTitleChange,
  onMinutesChange,
  idPrefix = 'capture',
}: CaptureMetaFieldsProps) {
  if (type === 'reading') {
    return (
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label
            htmlFor={`${idPrefix}-pages`}
            className="text-xs text-muted-foreground"
          >
            {CAPTURE_COPY.pagesLabel}
          </label>
          <Input
            id={`${idPrefix}-pages`}
            type="number"
            inputMode="numeric"
            min={0}
            value={pages}
            onChange={(event) => onPagesChange(event.target.value)}
            className={FIELD_CLASS}
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor={`${idPrefix}-book`}
            className="text-xs text-muted-foreground"
          >
            {CAPTURE_COPY.bookTitleLabel}
          </label>
          <Input
            id={`${idPrefix}-book`}
            dir="auto"
            value={bookTitle}
            placeholder={CAPTURE_COPY.bookTitlePlaceholder}
            onChange={(event) => onBookTitleChange(event.target.value)}
            className={FIELD_CLASS}
          />
        </div>
      </div>
    )
  }

  if (type === 'session') {
    return (
      <div className="space-y-1.5">
        <label
          htmlFor={`${idPrefix}-minutes`}
          className="text-xs text-muted-foreground"
        >
          {CAPTURE_COPY.minutesLabel}
        </label>
        <Input
          id={`${idPrefix}-minutes`}
          type="number"
          inputMode="numeric"
          min={0}
          value={minutes}
          onChange={(event) => onMinutesChange(event.target.value)}
          className={FIELD_CLASS}
        />
      </div>
    )
  }

  return null
}
