import { Link } from 'react-router-dom'
import { EntryMenu } from '@/components/entry/entry-menu'
import { EntryRow } from '@/components/entry/entry-row'
import { Card, CardAction, CardContent, CardHeader } from '@/components/ui/card'
import { HOME_COPY } from '@/lib/copy'
import { entriesForDay } from '@/lib/entries'
import type { Entry } from '@/lib/types'

/** How many of today's logs the Home card shows before linking to the timeline. */
const VISIBLE_TODAY_ENTRIES = 7

interface TodayEntriesProps {
  entries: Entry[]
  todayKey: string
  timeZone: string
}

/** Today's logs, newest first, or an invitation when the day is still empty. */
export function TodayEntries({
  entries,
  todayKey,
  timeZone,
}: TodayEntriesProps) {
  const todaysEntries = entriesForDay(entries, todayKey, timeZone)
  const visibleEntries = todaysEntries.slice(0, VISIBLE_TODAY_ENTRIES)
  const hasMore = todaysEntries.length > VISIBLE_TODAY_ENTRIES

  return (
    <Card>
      <CardHeader>
        <h2 className="leading-none font-semibold">
          {HOME_COPY.todayEntriesTitle}
        </h2>
        {hasMore ? (
          <CardAction>
            <Link
              to="/timeline"
              className="text-xs font-medium text-muted-foreground hover:text-primary focus-visible:underline"
            >
              {HOME_COPY.todayEntriesSeeAll}
            </Link>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>
        {todaysEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {HOME_COPY.todayEntriesEmpty}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {visibleEntries.map((entry) => (
              <EntryRow
                key={entry.id}
                entry={entry}
                actions={<EntryMenu entry={entry} />}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
