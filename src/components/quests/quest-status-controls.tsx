import { Check, Pause, Pencil, Play, RotateCcw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppData } from '@/hooks/use-app-data'
import { COMMON_COPY, QUEST_COPY } from '@/lib/copy'
import { counterCurrentValue, questCounter } from '@/lib/progress'
import { cn } from '@/lib/utils'
import type { Quest, QuestStatus } from '@/lib/types'

interface QuestStatusControlsProps {
  quest: Quest
  onEdit: () => void
  onDelete: () => void
}

const STATUS_CLASS: Record<QuestStatus, string> = {
  active: 'border-primary/50 text-primary',
  paused: 'border-border text-muted-foreground',
  done: 'border-border text-foreground',
}

const STATUS_LABEL: Record<QuestStatus, string> = {
  active: QUEST_COPY.statusActive,
  paused: QUEST_COPY.statusPaused,
  done: QUEST_COPY.statusDone,
}

/** Status badge plus the actions that move a quest through its life cycle. */
export function QuestStatusControls({
  quest,
  onEdit,
  onDelete,
}: QuestStatusControlsProps) {
  const { setQuestStatus } = useAppData()
  const isDone = quest.status === 'done'
  // A counter's status follows its count, so it has no manual Complete, and a
  // finished counter only offers Reopen while the count sits below the total.
  const counter = questCounter(quest)
  const belowTotal =
    quest.kind === 'counter' &&
    (counter === null || counterCurrentValue(quest) < counter.total)
  const showComplete = !isDone && quest.kind !== 'counter'
  const showReopen = isDone && (quest.kind !== 'counter' || belowTotal)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        aria-live="polite"
        className={cn(
          'rounded-full border px-2.5 py-1 text-xs',
          STATUS_CLASS[quest.status],
        )}
      >
        {STATUS_LABEL[quest.status]}
      </span>

      {showReopen ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            void setQuestStatus(quest.id, 'active')
          }}
        >
          <RotateCcw />
          {QUEST_COPY.reopen}
        </Button>
      ) : null}

      {!isDone ? (
        <>
          {showComplete ? (
            <Button
              type="button"
              onClick={() => {
                void setQuestStatus(quest.id, 'done')
              }}
            >
              <Check />
              {QUEST_COPY.complete}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void setQuestStatus(
                quest.id,
                quest.status === 'paused' ? 'active' : 'paused',
              )
            }}
          >
            {quest.status === 'paused' ? <Play /> : <Pause />}
            {quest.status === 'paused' ? QUEST_COPY.resume : QUEST_COPY.pause}
          </Button>
        </>
      ) : null}

      <Button type="button" variant="outline" onClick={onEdit}>
        <Pencil />
        {COMMON_COPY.edit}
      </Button>
      <Button type="button" variant="outline" onClick={onDelete}>
        <Trash2 />
        {COMMON_COPY.delete}
      </Button>
    </div>
  )
}
