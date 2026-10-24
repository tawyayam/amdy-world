import { useState } from 'react'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { RowActionButton } from '@/components/common/row-action-button'
import { TemplateFormDialog } from '@/components/goals/template-form-dialog'
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
import type { GoalTemplate } from '@/lib/types'

interface TemplateMenuProps {
  template: GoalTemplate
}

/** Per-template actions: edit its details and soft delete with undo. */
export function TemplateMenu({ template }: TemplateMenuProps) {
  const { updateTemplate, deleteTemplate, restoreTemplate } = useAppData()
  const [editing, setEditing] = useState(false)

  const handleDelete = async () => {
    try {
      await deleteTemplate(template.id)
      toast(GOALS_COPY.templateDeleted, {
        id: TOAST_ID.undo,
        duration: TOAST_DURATION.undo,
        action: {
          label: COMMON_COPY.undo,
          onClick: () => {
            void restoreTemplate(template)
          },
        },
      })
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
          <RowActionButton aria-label={GOALS_COPY.templateMenuLabel}>
            <MoreVertical />
          </RowActionButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setEditing(true)}>
            <Pencil />
            {GOALS_COPY.editTemplate}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => {
              void handleDelete()
            }}
          >
            <Trash2 />
            {GOALS_COPY.deleteTemplate}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {editing ? (
        <TemplateFormDialog
          title={GOALS_COPY.editTemplateTitle}
          submitLabel={COMMON_COPY.save}
          initial={{
            title: template.title,
            skillId: template.skillId,
            days: template.days,
            active: template.active,
          }}
          onSubmit={(input) => updateTemplate(template.id, input)}
          onClose={() => setEditing(false)}
        />
      ) : null}
    </>
  )
}
