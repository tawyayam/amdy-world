import { Plus } from 'lucide-react'
import { useState } from 'react'
import { QuestFiltersBar } from '@/components/quests/quest-filters'
import { QuestFormDialog } from '@/components/quests/quest-form-dialog'
import { QuestList } from '@/components/quests/quest-list'
import { QuestStatusSection } from '@/components/quests/quest-status-section'
import { Button } from '@/components/ui/button'
import { useAppData } from '@/hooks/use-app-data'
import { COMMON_COPY, NAV_LABELS, QUEST_COPY } from '@/lib/copy'
import {
  filterQuests,
  groupQuestsByStatus,
  orderQuestsForList,
  QUEST_STATUS_ORDER,
  type QuestFilters,
} from '@/lib/quests'
import type { QuestStatus } from '@/lib/types'

const NO_FILTERS: QuestFilters = {
  status: 'all',
  skillId: 'all',
  tagId: 'all',
}

const SECTION_HEADINGS: Record<QuestStatus, string> = {
  active: QUEST_COPY.sectionActive,
  paused: QUEST_COPY.sectionPaused,
  done: QUEST_COPY.sectionCompleted,
}

/** All quests, in-progress first, with filters and a button to start a new one. */
export function QuestsPage() {
  const { quests, createQuest } = useAppData()
  const [creating, setCreating] = useState(false)
  const [filters, setFilters] = useState<QuestFilters>(NO_FILTERS)
  const visible = filterQuests(quests, filters)
  // "All statuses" reads as three sections; a specific status stays one flat list.
  const grouped = filters.status === 'all' ? groupQuestsByStatus(visible) : null

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {NAV_LABELS.quests}
        </h1>
        <Button onClick={() => setCreating(true)}>
          <Plus />
          {QUEST_COPY.newQuest}
        </Button>
      </header>

      <QuestFiltersBar value={filters} onChange={setFilters} />

      {quests.length === 0 ? (
        <p className="text-muted-foreground">{QUEST_COPY.empty}</p>
      ) : visible.length === 0 ? (
        <p className="text-muted-foreground">{QUEST_COPY.noMatches}</p>
      ) : grouped ? (
        <div className="space-y-6">
          {QUEST_STATUS_ORDER.map((status) => {
            const statusQuests = grouped[status]
            if (statusQuests.length === 0) return null
            const heading =
              status === 'done'
                ? QUEST_COPY.sectionCompletedCount(statusQuests.length)
                : SECTION_HEADINGS[status]
            return (
              <QuestStatusSection
                key={status}
                heading={heading}
                quests={statusQuests}
                collapsible={status === 'done'}
              />
            )
          })}
        </div>
      ) : (
        <QuestList quests={orderQuestsForList(visible)} />
      )}

      {creating ? (
        <QuestFormDialog
          title={QUEST_COPY.createTitle}
          submitLabel={COMMON_COPY.add}
          onSubmit={async (input) => {
            await createQuest(input)
          }}
          onClose={() => setCreating(false)}
        />
      ) : null}
    </div>
  )
}
