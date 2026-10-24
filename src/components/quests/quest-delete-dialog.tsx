import { useState } from 'react'
import { toast } from 'sonner'
import { FormDialog } from '@/components/common/form-dialog'
import { Button } from '@/components/ui/button'
import { useAppData } from '@/hooks/use-app-data'
import { COMMON_COPY, QUEST_COPY } from '@/lib/copy'
import { TOAST_DURATION, TOAST_ID } from '@/lib/toast'
import type { Quest } from '@/lib/types'

interface QuestDeleteDialogProps {
  quest: Quest
  onClose: () => void
}

/** Confirms deleting a quest, then soft deletes it with an undo toast. */
export function QuestDeleteDialog({ quest, onClose }: QuestDeleteDialogProps) {
  const { deleteQuest, restoreQuest } = useAppData()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteQuest(quest.id)
      onClose()
      toast(QUEST_COPY.deleted, {
        id: TOAST_ID.undo,
        duration: TOAST_DURATION.undo,
        action: {
          label: COMMON_COPY.undo,
          onClick: () => {
            void restoreQuest(quest)
          },
        },
      })
    } catch {
      toast.error(COMMON_COPY.actionFailed, {
        id: TOAST_ID.error,
        duration: TOAST_DURATION.error,
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <FormDialog
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      title={QUEST_COPY.deleteTitle}
      description={QUEST_COPY.deleteBody}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            {COMMON_COPY.cancel}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleting}
            onClick={() => {
              void handleDelete()
            }}
          >
            {COMMON_COPY.delete}
          </Button>
        </>
      }
    />
  )
}
