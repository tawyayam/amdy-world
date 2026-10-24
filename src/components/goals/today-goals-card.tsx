import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { GoalAddForm } from '@/components/goals/goal-add-form'
import { GoalRow } from '@/components/goals/goal-row'
import { Card, CardAction, CardContent, CardHeader } from '@/components/ui/card'
import { useAppData } from '@/hooks/use-app-data'
import { GOALS_COPY } from '@/lib/copy'
import { goalBonusForDay } from '@/lib/progress'

/** Today's goals checklist, with an inline add and a link to manage templates. */
export function TodayGoalsCard() {
  const { goals, todayKey } = useAppData()
  const todaysGoals = goals.filter((goal) => goal.date === todayKey)
  const done = todaysGoals.filter((goal) => goal.done).length
  const bonus = goalBonusForDay(todaysGoals)

  return (
    <Card>
      <CardHeader>
        <h2 className="leading-none font-semibold">{GOALS_COPY.todayTitle}</h2>
        <CardAction className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {GOALS_COPY.progress(done, todaysGoals.length)}
          </span>
          <Link
            to="/goals"
            className="text-xs font-medium text-muted-foreground hover:text-primary focus-visible:underline"
          >
            {GOALS_COPY.manage}
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        {todaysGoals.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {GOALS_COPY.todayEmpty}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {todaysGoals.map((goal) => (
              <GoalRow key={goal.id} goal={goal} />
            ))}
          </ul>
        )}

        {bonus > 0 ? (
          <p
            aria-live="polite"
            className="flex items-center gap-1.5 text-sm font-medium text-primary"
          >
            <Sparkles className="size-4" aria-hidden="true" />
            {GOALS_COPY.allDoneBonus(bonus)}
          </p>
        ) : null}

        <GoalAddForm />
      </CardContent>
    </Card>
  )
}
