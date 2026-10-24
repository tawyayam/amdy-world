import { useState } from 'react'
import { CounterSetDialog } from '@/components/quests/counter-set-dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useAchievementToast } from '@/hooks/use-achievement-toast'
import { useAppData } from '@/hooks/use-app-data'
import { QUEST_COPY } from '@/lib/copy'
import {
  COUNTER_MILESTONE_XP,
  counterAtTotal,
  counterCurrentSection,
  counterCurrentValue,
  counterMilestones,
  counterNextMilestone,
  questCounter,
} from '@/lib/progress'
import type { CounterChange } from '@/lib/quests'
import type { Quest } from '@/lib/types'

interface CounterQuestProgressProps {
  quest: Quest
}

/**
 * A counter quest's progress: the count, a bar with milestone ticks, and the
 * +1/+5/Set-to/Undo controls. XP is never computed here — the action returns
 * what changed and the single achievement toast reports it. A plain +1/+5
 * updates the count on screen and stays silent.
 */
export function CounterQuestProgress({ quest }: CounterQuestProgressProps) {
  const { updateCounter, undoCounterUpdate, settings } = useAppData()
  const announceAchievements = useAchievementToast()
  const [settingTo, setSettingTo] = useState(false)
  const counter = questCounter(quest)

  if (!counter) return null

  const value = counterCurrentValue(quest)
  const percent = Math.round((value / counter.total) * 100)
  const milestones = counterMilestones(quest)
  const nextMilestone = counterNextMilestone(quest)
  const section = counterCurrentSection(quest)
  const canUndo = counter.updates.length > 0
  // At the top of the count only a correction can move it: +1/+5 go quiet
  // while "Set to…" and Undo stay on, so a miscount can always be fixed.
  const atTotal = counterAtTotal(quest)

  const report = async (change: CounterChange) => {
    const result = await updateCounter(quest.id, change)
    if (!result) return
    announceAchievements({
      characterName: settings.characterName,
      ...(result.completed
        ? {
            completedQuest: {
              title: quest.title,
              xp: result.xpDelta,
            },
          }
        : {}),
      milestonesReached: result.milestonesReached,
      milestoneXp: COUNTER_MILESTONE_XP,
      skillId: quest.skillId,
      levelUps: result.levelUps,
    })
  }

  const undo = async () => {
    // Undo itself never offers another Undo: the next one would remove a
    // different update. It also grants nothing, so it stays silent.
    await undoCounterUpdate(quest.id)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <p dir="auto" aria-live="polite" className="text-sm font-medium">
          {QUEST_COPY.counterValue(value, counter.total, counter.unit)}
        </p>
        <div className="relative">
          <Progress
            value={percent}
            aria-label={`${quest.title}: ${QUEST_COPY.counterValue(
              value,
              counter.total,
              counter.unit,
            )}`}
            aria-valuemin={0}
            aria-valuemax={counter.total}
            aria-valuenow={value}
          />
          {/* Milestone ticks are decorative; the "Next milestone" line below
              carries the same information for screen readers. */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {milestones.map((milestone) => (
              <span
                key={milestone}
                className="absolute top-0 bottom-0 w-px bg-background"
                style={{ left: `${(milestone / counter.total) * 100}%` }}
              />
            ))}
          </div>
        </div>
        <p dir="auto" className="text-xs text-muted-foreground">
          {nextMilestone !== null
            ? QUEST_COPY.counterNextMilestone(
                nextMilestone,
                counter.unit,
                COUNTER_MILESTONE_XP,
              )
            : QUEST_COPY.counterNoNextMilestone}
        </p>
        {section ? (
          <p dir="auto" className="text-xs text-muted-foreground">
            {QUEST_COPY.counterSectionNumber(section.number)}:{' '}
            {QUEST_COPY.counterSectionPosition(
              section.title,
              section.value,
              section.size,
            )}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          disabled={atTotal}
          aria-label={QUEST_COPY.counterAddOne(counter.unit)}
          onClick={() => {
            void report({ kind: 'delta', delta: 1 })
          }}
        >
          {QUEST_COPY.counterPlusOne}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={atTotal}
          aria-label={QUEST_COPY.counterAddFive(counter.unit)}
          onClick={() => {
            void report({ kind: 'delta', delta: 5 })
          }}
        >
          {QUEST_COPY.counterPlusFive}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setSettingTo(true)}
        >
          {QUEST_COPY.counterSetTo}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={!canUndo}
          onClick={() => {
            void undo()
          }}
        >
          {QUEST_COPY.counterUndoLast}
        </Button>
      </div>

      {milestones.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            {QUEST_COPY.counterMilestonesTitle}
          </p>
          <ul className="space-y-1">
            {milestones.map((milestone) => (
              <li
                key={milestone}
                className="flex items-center justify-between text-sm"
              >
                <span dir="auto">
                  {QUEST_COPY.counterMilestoneItem(counter.unit, milestone)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {value >= milestone
                    ? QUEST_COPY.counterMilestoneDone
                    : QUEST_COPY.counterMilestonePending}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {settingTo ? (
        <CounterSetDialog
          counter={counter}
          currentValue={value}
          reopensWhenLowered={quest.status === 'done'}
          onSubmit={async (next) => {
            await report({ kind: 'set', value: next })
          }}
          onClose={() => setSettingTo(false)}
        />
      ) : null}
    </div>
  )
}
