import { useState } from 'react'
import { TimelineFilters } from '@/components/timeline/timeline-filters'
import { TimelineGroupSection } from '@/components/timeline/timeline-group'
import { TimelineViewMenu } from '@/components/timeline/timeline-view-menu'
import { useAppData } from '@/hooks/use-app-data'
import { NAV_LABELS, TIMELINE_COPY } from '@/lib/copy'
import {
  DEFAULT_TIMELINE_FILTERS,
  filterEntries,
  normalizeTimelineView,
  shapeTimeline,
} from '@/lib/timeline'

/** Everything ever logged, grouped, sorted, and filtered the way the person likes. */
export function TimelinePage() {
  const { entries, goals, todayKey, timeZone, settings, saveSettings } =
    useAppData()
  const [filters, setFilters] = useState(DEFAULT_TIMELINE_FILTERS)
  const view = normalizeTimelineView(settings.timelineView)

  const filtered = filterEntries(entries, filters)
  const groups = shapeTimeline(filtered, view, timeZone, todayKey, goals)
  const hasEntries = entries.length > 0

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {NAV_LABELS.timeline}
        </h1>
        <TimelineViewMenu
          value={view}
          onChange={(next) => {
            void saveSettings({ ...settings, timelineView: next })
          }}
        />
      </header>

      {!hasEntries ? (
        <p className="text-muted-foreground">{TIMELINE_COPY.empty}</p>
      ) : (
        <div className="space-y-6">
          {hasEntries ? (
            <TimelineFilters
              value={filters}
              onChange={setFilters}
              count={filtered.length}
            />
          ) : null}

          {groups.length === 0 ? (
            <p className="text-muted-foreground">{TIMELINE_COPY.noMatches}</p>
          ) : (
            <div className="space-y-6">
              {groups.map((group) => (
                <TimelineGroupSection
                  key={group.key}
                  group={group}
                  layout={view.layout}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
