import { toast } from 'sonner'
import { GoalMenu } from '@/components/goals/goal-menu'
import { Checkbox } from '@/components/ui/checkbox'
import { UserText } from '@/components/common/user-text'
import { useAchievementToast } from '@/hooks/use-achievement-toast'
import { useAppData } from '@/hooks/use-app-data'
import { COMMON_COPY } from '@/lib/copy'
import { TOAST_DURATION, TOAST_ID } from '@/lib/toast'
import { SKILL_BY_ID } from '@/lib/skills'
import { cn } from '@/lib/utils'
import type { DailyGoal } from '@/lib/types'

interface GoalRowProps {
  goal: DailyGoal
}

/** One goal in today's checklist: a real checkbox, its skill, and its menu. */
export function GoalRow({ goal }: GoalRowProps) {
  const { toggleDailyGoal, settings } = useAppData()
  const announceAchievements = useAchievementToast()
  const skill = SKILL_BY_ID[goal.skillId]
  const checkboxId = `goal-${goal.id}`

  const handleToggle = async () => {
    try {
      // Ticking already flips the checkbox on screen, so only a level-up
      // is worth a toast.
      const result = await toggleDailyGoal(goal.id)
      if (!result) return
      announceAchievements({
        characterName: settings.characterName,
        levelUps: result.levelUps,
      })
    } catch {
      toast.error(COMMON_COPY.actionFailed, {
        id: TOAST_ID.error,
        duration: TOAST_DURATION.error,
      })
    }
  }

  return (
    <li className="flex items-center gap-3">
      <Checkbox
        id={checkboxId}
        checked={goal.done}
        onCheckedChange={() => {
          void handleToggle()
        }}
      />
      <span
        className="size-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: skill.color }}
        aria-hidden="true"
      />
      <label
        htmlFor={checkboxId}
        dir="auto"
        className={cn(
          'flex-1 py-2.5 text-sm break-words',
          goal.done && 'text-muted-foreground line-through',
        )}
      >
        <UserText>{goal.title}</UserText>
        <span className="sr-only"> �� {skill.name}</span>
      </label>
      <GoalMenu goal={goal} />
    </li>
  )
}
