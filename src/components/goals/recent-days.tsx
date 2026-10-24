import { useId, useState } from 'react'
import { ChevronRight, Square, SquareCheck } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useAppData } from '@/hooks/use-app-data'
import { GOALS_COPY } from '@/lib/copy'
import { formatDateKeyShort } from '@/lib/format'
import { recentGoalDays, type RecentGoalDay } from '@/lib/goals'
import { SKILL_BY_ID } from '@/lib/skills'
import { cn } from '@/lib/utils'
import type { DailyGoal } from '@/lib/types'

/** Read-only history of the last days that had goals, each one expandable. */
export function RecentDays() {
  const { goals, todayKey } = useAppData()
  const days = recentGoalDays(goals, todayKey)

  return (
    <Card>
      <CardHeader>
        <h2 className="leading-none font-semibold">
          {GOALS_COPY.recentDaysTitle}
        </h2>
        <CardDescription>{GOALS_COPY.recentDaysIntro}</CardDescription>
      </CardHeader>
      <CardContent>
        {days.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {GOALS_COPY.recentDaysEmpty}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {days.map((day) => (
              <RecentDayRow key={day.dateKey} day={day} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function RecentDayRow({ day }: { day: RecentGoalDay }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const percent = day.total === 0 ? 0 : (day.done / day.total) * 100

  return (
    <li className="py-1">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-11 w-full items-center gap-2 rounded-md text-left text-sm focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <ChevronRight
          aria-hidden="true"
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform',
            open && 'rotate-90',
          )}
        />
        <span className="flex-1 font-medium">
          {formatDateKeyShort(day.dateKey)}
        </span>
        <span className="text-muted-foreground">
          {GOALS_COPY.progress(day.done, day.total)}
        </span>
      </button>

      <Progress
        value={percent}
        aria-hidden="true"
        className="mt-1.5 ml-6 h-1.5 w-auto"
      />

      <div id={panelId} hidden={!open} className="mt-2">
        <ul className="space-y-1.5 pl-6">
          {day.goals.map((goal) => (
            <RecentGoalItem key={goal.id} goal={goal} />
          ))}
        </ul>
      </div>
    </li>
  )
}

function RecentGoalItem({ goal }: { goal: DailyGoal }) {
  const skill = SKILL_BY_ID[goal.skillId]
  const Icon = goal.done ? SquareCheck : Square

  return (
    <li className="flex items-center gap-2 text-sm">
      <Icon
        aria-hidden="true"
        className={cn(
          'size-4 shrink-0',
          goal.done ? 'text-primary' : 'text-muted-foreground',
        )}
      />
      <span
        className="size-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: skill.color }}
        aria-hidden="true"
      />
      <span
        dir="auto"
        className={cn(
          'break-words',
          goal.done && 'text-muted-foreground line-through',
        )}
      >
        {goal.title}
        <span className="sr-only"> — {skill.name}</span>
      </span>
    </li>
  )
}
