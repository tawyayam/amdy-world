import {
  MoreVertical,
  Pause,
  Pencil,
  Play,
  RotateCcw,
  Trash2,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import { RowActionButton } from '@/components/common/row-action-button'
import { QuestDeleteDialog } from '@/components/quests/quest-delete-dialog'
import { QuestFormDialog } from '@/components/quests/quest-form-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAppData } from '@/hooks/use-app-data'
import { COMMON_COPY, QUEST_COPY } from '@/lib/copy'
import { counterCurrentValue, questCounter } from '@/lib/progress'
import type { Quest, QuestStatus } from '@/lib/types'

interface QuestCardActionsProps {
  quest: Quest
}

interface StatusAction {
  label: string
  icon: LucideIcon
  next: QuestStatus
}

/**
 * The single status move a quest can make right now, or null when it has none:
 * a finished counter whose count still sits at the total cannot be reopened —
 * lowering the count reopens it on its own.
 */
function statusActionFor(quest: Quest): StatusAction | null {
  if (quest.status === 'done') {
    if (quest.kind === 'counter') {
      const counter = questCounter(quest)
      if (counter && counterCurrentValue(quest) >= counter.total) return null
    }
    return { label: QUEST_COPY.reopen, icon: RotateCcw, next: 'active' }
  }
  if (quest.status === 'paused') {
    return { label: QUEST_COPY.resume, icon: Play, next: 'active' }
  }
  return { label: QUEST_COPY.pause, icon: Pause, next: 'paused' }
}

/** Pause/resume, edit, and delete for a quest card, without opening the quest. */
export function QuestCardActions({ quest }: QuestCardActionsProps) {
  const { setQuestStatus, updateQuestDetails } = useAppData()
  const [editing, setEditing] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const statusAction = statusActionFor(quest)
  const runStatus = () => {
    if (!statusAction) return
    void setQuestStatus(quest.id, statusAction.next)
  }
  const openEdit = () => setEditing(true)
  const openDelete = () => setConfirmingDelete(true)

  return (
    <TooltipProvider>
      <div className="hidden items-center gap-1 md:flex">
        {statusAction ? (
          <IconAction
            label={statusAction.label}
            icon={statusAction.icon}
            onClick={runStatus}
          />
        ) : null}
        <IconAction label={COMMON_COPY.edit} icon={Pencil} onClick={openEdit} />
        <IconAction
          label={COMMON_COPY.delete}
          icon={Trash2}
          onClick={openDelete}
        />
      </div>

      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <RowActionButton aria-label={QUEST_COPY.actionsLabel}>
              <MoreVertical />
            </RowActionButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {statusAction ? (
              <DropdownMenuItem onSelect={runStatus}>
                <statusAction.icon />
                {statusAction.label}
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem onSelect={openEdit}>
              <Pencil />
              {COMMON_COPY.edit}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={openDelete}>
              <Trash2 />
              {COMMON_COPY.delete}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {editing ? (
        <QuestFormDialog
          title={QUEST_COPY.editTitle}
          submitLabel={COMMON_COPY.save}
          initial={{
            title: quest.title,
            description: quest.description,
            skillId: quest.skillId,
            tagIds: quest.tagIds,
            kind: quest.kind,
            ...(quest.counter
              ? {
                  counter: {
                    unit: quest.counter.unit,
                    total: quest.counter.total,
                    startValue: quest.counter.startValue,
                    sections: quest.counter.sections ?? [],
                  },
                }
              : {}),
          }}
          counterMinValue={
            quest.counter ? counterCurrentValue(quest) : undefined
          }
          onSubmit={(input) => updateQuestDetails(quest.id, input)}
          onClose={() => setEditing(false)}
        />
      ) : null}

      {confirmingDelete ? (
        <QuestDeleteDialog
          quest={quest}
          onClose={() => setConfirmingDelete(false)}
        />
      ) : null}
    </TooltipProvider>
  )
}

interface IconActionProps {
  label: string
  icon: LucideIcon
  onClick: () => void
}

function IconAction({ label, icon: Icon, onClick }: IconActionProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={label}
          onClick={onClick}
        >
          <Icon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
