import { GOALS_COPY, WEEKDAY_LABELS, WEEKDAY_NAMES } from '@/lib/copy'
import { cn } from '@/lib/utils'
import type { Weekday } from '@/lib/types'

interface WeekdayPickerProps {
  value: Weekday[]
  onChange: (days: Weekday[]) => void
}

/** Seven toggle buttons for the days a recurring goal repeats on. */
export function WeekdayPicker({ value, onChange }: WeekdayPickerProps) {
  const toggle = (day: Weekday) => {
    const next = value.includes(day)
      ? value.filter((candidate) => candidate !== day)
      : [...value, day].sort((first, second) => first - second)
    onChange(next)
  }

  return (
    <div role="group" aria-label={GOALS_COPY.daysLabel} className="space-y-1.5">
      <p className="text-xs text-muted-foreground">{GOALS_COPY.daysLabel}</p>
      <div className="flex flex-wrap gap-1.5">
        {WEEKDAY_LABELS.map((label, index) => {
          const day = index as Weekday
          const selected = value.includes(day)
          return (
            <button
              key={day}
              type="button"
              aria-pressed={selected}
              aria-label={WEEKDAY_NAMES[day]}
              onClick={() => toggle(day)}
              className={cn(
                'min-h-11 min-w-11 rounded-md border px-2 text-xs font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                selected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground',
              )}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
