import { SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TIMELINE_COPY } from '@/lib/copy'
import type {
  TimelineGroupBy,
  TimelineLayout,
  TimelineSort,
  TimelineViewOptions,
} from '@/lib/types'

interface TimelineViewMenuProps {
  value: TimelineViewOptions
  onChange: (value: TimelineViewOptions) => void
}

/** Compact control that groups, sorts, and sets the layout of the timeline. */
export function TimelineViewMenu({ value, onChange }: TimelineViewMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <SlidersHorizontal />
          {TIMELINE_COPY.viewLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>{TIMELINE_COPY.groupByLabel}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={value.groupBy}
          onValueChange={(groupBy) =>
            onChange({ ...value, groupBy: groupBy as TimelineGroupBy })
          }
        >
          <DropdownMenuRadioItem value="day">
            {TIMELINE_COPY.groupByDay}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="week">
            {TIMELINE_COPY.groupByWeek}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="skill">
            {TIMELINE_COPY.groupBySkill}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>{TIMELINE_COPY.sortLabel}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={value.sort}
          onValueChange={(sort) =>
            onChange({ ...value, sort: sort as TimelineSort })
          }
        >
          <DropdownMenuRadioItem value="newest">
            {TIMELINE_COPY.sortNewest}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="oldest">
            {TIMELINE_COPY.sortOldest}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>{TIMELINE_COPY.layoutLabel}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={value.layout}
          onValueChange={(layout) =>
            onChange({ ...value, layout: layout as TimelineLayout })
          }
        >
          <DropdownMenuRadioItem value="list">
            {TIMELINE_COPY.layoutList}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="grid">
            {TIMELINE_COPY.layoutGrid}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
