import { Link } from 'react-router-dom'
import { QuestCardActions } from '@/components/quests/quest-card-actions'
import { QuestMeta } from '@/components/quests/quest-meta'
import { UserText } from '@/components/common/user-text'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useAppData } from '@/hooks/use-app-data'
import { QUEST_COPY } from '@/lib/copy'
import { counterCurrentValue, questCounter } from '@/lib/progress'
import {
  questLastProgressAt,
  questNextUp,
  questStepProgress,
  questStalledDays,
  STALLED_AFTER_DAYS,
} from '@/lib/quests'
import { cn } from '@/lib/utils'
import type { Quest, QuestStatus } from '@/lib/types'

interface QuestCardProps {
  quest: Quest
}

const STATUS_LABEL: Record<QuestStatus, string> = {
  active: QUEST_COPY.statusActive,
  paused: QUEST_COPY.statusPaused,
  done: QUEST_COPY.statusDone,
}

const STATUS_CLASS: Record<QuestStatus, string> = {
  active: 'border-primary/50 text-primary',
  paused: 'border-border text-muted-foreground',
  done: 'border-border text-foreground',
}

/**
 * One quest in the list: a linked title, a status badge, quick actions, and how
 * far it has come — a bar over steps or over a counter's value, with a quiet
 * "Next" and "No progress" line when either applies. The title is the link;
 * the actions sit beside it so no control is nested inside the link.
 */
export function QuestCard({ quest }: QuestCardProps) {
  const { entries, todayKey, timeZone } = useAppData()
  const counter = questCounter(quest)

  let progressLine: string
  let percent: number
  let valueNow: number
  let valueMax: number
  if (counter) {
    const value = counterCurrentValue(quest)
    progressLine = QUEST_COPY.counterValue(value, counter.total, counter.unit)
    percent = counter.total > 0 ? Math.round((value / counter.total) * 100) : 0
    valueNow = value
    valueMax = counter.total
  } else {
    const { done, total } = questStepProgress(quest)
    progressLine = QUEST_COPY.stepProgress(done, total)
    percent = total > 0 ? Math.round((done / total) * 100) : 0
    valueNow = done
    valueMax = total
  }

  const nextUp = questNextUp(quest)
  const stalledDays =
    quest.status === 'active'
      ? questStalledDays(
          questLastProgressAt(quest, entries),
          todayKey,
          timeZone,
        )
      : null
  const stalled = stalledDays !== null && stalledDays >= STALLED_AFTER_DAYS

  return (
    <li>
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <h2 dir="auto" className="min-w-0 font-medium break-words">
              <Link
                to={`/quests/${quest.id}`}
                className="rounded-sm hover:text-primary focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <UserText>{quest.title}</UserText>
              </Link>
            </h2>
            <div className="flex shrink-0 items-center gap-2">
              <span
                aria-live="polite"
                className={cn(
                  'rounded-full border px-2.5 py-1 text-xs',
                  STATUS_CLASS[quest.status],
                )}
              >
                {STATUS_LABEL[quest.status]}
              </span>
              <QuestCardActions quest={quest} />
            </div>
          </div>

          {quest.description ? (
            <p
              dir="auto"
              className="line-clamp-2 text-sm text-muted-foreground"
            >
              {quest.description}
            </p>
          ) : null}

          <QuestMeta quest={quest} />

          <div className="space-y-1.5">
            <p
              dir="auto"
              aria-live="polite"
              className="text-xs text-muted-foreground"
            >
              {progressLine}
            </p>
            {valueMax > 0 ? (
              <Progress
                value={percent}
                aria-label={`${quest.title}: ${progressLine}`}
                aria-valuemin={0}
                aria-valuemax={valueMax}
                aria-valuenow={valueNow}
              />
            ) : null}
            {nextUp ? (
              <p dir="auto" className="text-xs text-muted-foreground">
                {QUEST_COPY.nextUpLabel}:{' '}
                {nextUp.kind === 'counter'
                  ? QUEST_COPY.nextUpCounter(nextUp.nextValue, nextUp.unit)
                  : nextUp.title}
              </p>
            ) : null}
            {stalled ? (
              <p className="text-xs text-muted-foreground">
                {QUEST_COPY.stalledLabel(stalledDays ?? 0)}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </li>
  )
}
