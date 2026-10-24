import { CheckSquare } from 'lucide-react'
import { EntryCard } from '@/components/entry/entry-card'
import { EntryMenu } from '@/components/entry/entry-menu'
import { EntryRow } from '@/components/entry/entry-row'
import { UserText } from '@/components/common/user-text'
import { TIMELINE_COPY } from '@/lib/copy'
import type { TimelineGroup as TimelineGroupModel } from '@/lib/timeline'
import type { TimelineLayout } from '@/lib/types'

interface TimelineGroupSectionProps {
  group: TimelineGroupModel
  layout: TimelineLayout
}

/** One timeline section: a heading, an optional goals line, and its entries. */
export function TimelineGroupSection({
  group,
  layout,
}: TimelineGroupSectionProps) {
  return (
    <section className="space-y-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h2 dir="auto" className="text-sm font-medium text-muted-foreground">
          <UserText>{group.heading}</UserText>
        </h2>
        {group.goals ? (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <CheckSquare className="size-3.5" aria-hidden="true" />
            {TIMELINE_COPY.goalsSummary(group.goals.done, group.goals.total)}
          </p>
        ) : null}
      </div>
      {layout === 'grid' ? (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {group.entries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              actions={<EntryMenu entry={entry} />}
            />
          ))}
        </ul>
      ) : (
        <ul className="divide-y divide-border">
          {group.entries.map((entry) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              actions={<EntryMenu entry={entry} />}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
