import { QuestCard } from '@/components/quests/quest-card'
import type { Quest } from '@/lib/types'

interface QuestListProps {
  quests: Quest[]
}

/** The quest list; callers pass quests already ordered for display. */
export function QuestList({ quests }: QuestListProps) {
  return (
    <ul className="space-y-3">
      {quests.map((quest) => (
        <QuestCard key={quest.id} quest={quest} />
      ))}
    </ul>
  )
}
