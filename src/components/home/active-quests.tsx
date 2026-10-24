import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { UserText } from '@/components/common/user-text'
import { Progress } from '@/components/ui/progress'
import { useAppData } from '@/hooks/use-app-data'
import { HOME_COPY, QUEST_COPY } from '@/lib/copy'
import { counterCurrentValue, questCounter } from '@/lib/progress'
import {
  activeQuests,
  questLastProgressAt,
  questNextUp,
  questStalledDays,
  questStepProgress,
  STALLED_AFTER_DAYS,
} from '@/lib/quests'
import type { Quest } from '@/lib/types'

interface ActiveQuestsProps {
  quests: Quest[]
}

/** The projects currently in motion, each with its step or counter progress. */
export function ActiveQuests({ quests }: ActiveQuestsProps) {
  const { entries, todayKey, timeZone } = useAppData()
  const active = activeQuests(quests)

  return (
    <Card>
      <CardHeader>
        <h2 className="leading-none font-semibold">
          {HOME_COPY.activeQuestsTitle}
        </h2>
      </CardHeader>
      <CardContent>
        {active.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {HOME_COPY.activeQuestsEmpty}
          </p>
        ) : (
          <ul className="space-y-4">
            {active.map((quest) => {
              const counter = questCounter(quest)
              let label: string
              let valueNow: number
              let valueMax: number
              if (counter) {
                const value = counterCurrentValue(quest)
                label = QUEST_COPY.counterValue(
                  value,
                  counter.total,
                  counter.unit,
                )
                valueNow = value
                valueMax = counter.total
              } else {
                const { done, total } = questStepProgress(quest)
                label =
                  total > 0
                    ? HOME_COPY.questSteps(done, total)
                    : HOME_COPY.questNoSteps
                valueNow = done
                valueMax = total
              }
              const percent =
                valueMax > 0 ? Math.round((valueNow / valueMax) * 100) : 0
              const nextUp = questNextUp(quest)
              const stalledDays = questStalledDays(
                questLastProgressAt(quest, entries),
                todayKey,
                timeZone,
              )
              const stalled =
                stalledDays !== null && stalledDays >= STALLED_AFTER_DAYS

              return (
                <li key={quest.id} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <Link
                      to={`/quests/${quest.id}`}
                      dir="auto"
                      className="min-w-0 truncate font-medium hover:text-primary focus-visible:underline"
                    >
                      <UserText>{quest.title}</UserText>
                    </Link>
                    <span
                      dir="auto"
                      aria-live="polite"
                      className="shrink-0 text-xs text-muted-foreground"
                    >
                      {label}
                    </span>
                  </div>
                  {valueMax > 0 ? (
                    <Progress
                      value={percent}
                      aria-label={`${quest.title}: ${label}`}
                      aria-valuemin={0}
                      aria-valuemax={valueMax}
                      aria-valuenow={valueNow}
                    />
                  ) : null}
                  {nextUp ? (
                    <p dir="auto" className="text-xs text-muted-foreground">
                      {QUEST_COPY.nextUpLabel}:{' '}
                      {nextUp.kind === 'counter'
                        ? QUEST_COPY.nextUpCounter(
                            nextUp.nextValue,
                            nextUp.unit,
                          )
                        : nextUp.title}
                    </p>
                  ) : null}
                  {stalled ? (
                    <p className="text-xs text-muted-foreground">
                      {QUEST_COPY.stalledLabel(stalledDays ?? 0)}
                    </p>
                  ) : null}
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
