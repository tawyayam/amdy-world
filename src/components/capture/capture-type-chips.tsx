import { useRef, type KeyboardEvent } from 'react'
import { CAPTURE_COPY } from '@/lib/copy'
import type { CaptureType } from '@/lib/types'
import { cn } from '@/lib/utils'

const CAPTURE_TYPES: readonly CaptureType[] = [
  'learned',
  'idea',
  'reading',
  'session',
]

interface CaptureTypeChipsProps {
  value: CaptureType
  onChange: (type: CaptureType) => void
}

/**
 * A keyboard-friendly single-choice group for the capture type. Arrow keys move
 * between options and keep focus on the selected chip.
 */
export function CaptureTypeChips({ value, onChange }: CaptureTypeChipsProps) {
  const buttons = useRef<Array<HTMLButtonElement | null>>([])

  const select = (type: CaptureType) => {
    onChange(type)
    buttons.current[CAPTURE_TYPES.indexOf(type)]?.focus()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = CAPTURE_TYPES.indexOf(value)
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      select(CAPTURE_TYPES[(index + 1) % CAPTURE_TYPES.length])
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      select(
        CAPTURE_TYPES[
          (index - 1 + CAPTURE_TYPES.length) % CAPTURE_TYPES.length
        ],
      )
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label={CAPTURE_COPY.typeGroupLabel}
      onKeyDown={handleKeyDown}
      className="flex flex-wrap gap-2"
    >
      {CAPTURE_TYPES.map((type, index) => {
        const selected = type === value
        return (
          <button
            key={type}
            ref={(element) => {
              buttons.current[index] = element
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(type)}
            className={cn(
              'min-h-11 rounded-full border px-4 text-sm font-medium transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
              selected
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:text-foreground',
            )}
          >
            {CAPTURE_COPY.typeLabels[type]}
          </button>
        )
      })}
    </div>
  )
}
