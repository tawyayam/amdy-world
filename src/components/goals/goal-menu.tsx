import { useState } from 'react'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { RowActionButton } from '@/components/common/row-action-button'
import { GoalFormDialog } from '@/components/goals/goal-form-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppData } from '@/hooks/use-app-data'
import { COMMON_COPY, GOALS_COPY } from '@/lib/copy'
import { TOAST_DURATION, TOAST_ID } from '@/lib/toast'
import type { DailyGoal } from '@/lib/types'

interface GoalMenuProps {
  goal: DailyGoal
}

/** Per-goal actions: edit its details and soft delete. */
export function GoalMenu({ goal }: GoalMenuProps) {
  const { updateDailyGoal, deleteDailyGoal } = useAppData()
  const [editing, setEditing] = useState(false)

  const handleDelete = async () => {
    try {
      // The row disappears from the list right away, so the result is its own
      // confirmation and no toast is needed.
      await deleteDailyGoal(goal.id)
    } catch {
      toast.error(COMMON_COPY.actionFailed, {
        id: TOAST_ID.error,
        duration: TOAST_DURATION.error,
      })
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <RowActionButton aria-label={GOALS_COPY.goalMenuLabel}>
            <MoreVertical />
          </RowActionButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setEditing(true)}>
            <Pencil />
            {COMMON_COPY.edit}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => {
              void handleDelete()
            }}
          >
            <Trash2 />
            {COMMON_COPY.delete}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {editing ? (
        <GoalFormDialog
          title={GOALS_COPY.editTitle}
          submitLabel={GOALS_COPY.save}
          initial={{ title: goal.title, skillId: goal.skillId }}
          onSubmit={(input) => updateDailyGoal(goal.id, input)}
          onClose={() => setEditing(false)}
        />
      ) : null}
    </>
  )
}
