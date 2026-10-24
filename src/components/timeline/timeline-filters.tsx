import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TIMELINE_COPY } from '@/lib/copy'
import { SKILLS, type SkillId } from '@/lib/skills'
import {
  DEFAULT_TIMELINE_FILTERS,
  hasActiveTimelineFilters,
  type TimelineFilters as Filters,
} from '@/lib/timeline'
import { cn } from '@/lib/utils'

interface FilterOption<T extends string> {
  value: T
  label: string
}

const SKILL_OPTIONS: readonly FilterOption<SkillId | 'all'>[] = [
  { value: 'all', label: TIMELINE_COPY.allSkills },
  ...SKILLS.map((skill) => ({ value: skill.id, label: skill.name })),
]

interface SkillChipsProps {
  value: SkillId | 'all'
  onChange: (value: SkillId | 'all') => void
}

/** Single row of skill chips; native radios keep arrow-key support for free. */
function SkillChips({ value, onChange }: SkillChipsProps) {
  return (
    <fieldset className="min-w-0 basis-full sm:flex-1">
      <legend className="sr-only">{TIMELINE_COPY.filterSkillLabel}</legend>
      {/* `relative` keeps the visually hidden radios inside this scroll box; without a
          positioned ancestor they escape `overflow-x-auto` and widen the page. */}
      <div className="relative flex items-center gap-2 overflow-x-auto pb-1">
        {SKILL_OPTIONS.map((option) => {
          const id = `timeline-skill-${option.value}`
          const selected = option.value === value
          return (
            <label key={option.value} htmlFor={id} className="shrink-0">
              <input
                id={id}
                type="radio"
                name="timeline-skill"
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="peer sr-only"
              />
              <span
                className={cn(
                  'inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors sm:min-h-9 sm:px-3',
                  'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring',
                  selected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground',
                )}
              >
                {option.label}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

interface TimelineFiltersProps {
  value: Filters
  onChange: (value: Filters) => void
  /** How many entries survive the current filters, shown as a small count. */
  count: number
}

/**
 * The timeline toolbar: a search box, one row of skill chips, a "Clear filters"
 * button (only while something is active), and a log count.
 */
export function TimelineFilters({
  value,
  onChange,
  count,
}: TimelineFiltersProps) {
  const active = hasActiveTimelineFilters(value)

  return (
    <div className="space-y-3">
      <div className="relative">
        <label htmlFor="timeline-search" className="sr-only">
          {TIMELINE_COPY.searchLabel}
        </label>
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id="timeline-search"
          type="search"
          dir="auto"
          autoComplete="off"
          value={value.query}
          placeholder={TIMELINE_COPY.searchPlaceholder}
          onChange={(event) =>
            onChange({ ...value, query: event.target.value })
          }
          className="min-h-11 pr-12 pl-9 sm:min-h-9 [&::-webkit-search-cancel-button]:hidden"
        />
        {value.query ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={TIMELINE_COPY.clearSearch}
            className="absolute top-1/2 right-1 size-11 -translate-y-1/2 sm:size-8"
            onClick={() => onChange({ ...value, query: '' })}
          >
            <X />
          </Button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <SkillChips
          value={value.skillId}
          onChange={(skillId) => onChange({ ...value, skillId })}
        />

        {active ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="min-h-11 sm:min-h-8"
            onClick={() => onChange(DEFAULT_TIMELINE_FILTERS)}
          >
            <X />
            {TIMELINE_COPY.clearFilters}
          </Button>
        ) : null}

        <p className="text-xs text-muted-foreground sm:ml-auto">
          {TIMELINE_COPY.logCount(count)}
        </p>
      </div>
    </div>
  )
}
