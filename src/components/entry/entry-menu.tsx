import { MoreVertical, Pencil, Sparkles, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { RowActionButton } from '@/components/common/row-action-button'
import { EntryEditDialog } from '@/components/entry/entry-edit-dialog'
import { QuestFormDialog } from '@/components/quests/quest-form-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAchievementToast } from '@/hooks/use-achievement-toast'
import { useAppData } from '@/hooks/use-app-data'
import { COMMON_COPY, ENTRY_COPY, QUEST_COPY } from '@/lib/copy'
import { TOAST_DURATION, TOAST_ID } from '@/lib/toast'
import { defaultSkillForPromotion, isPromotedToLiveQuest } from '@/lib/quests'
import type { Entry } from '@/lib/types'
import type { QuestDetailsInput } from '@/hooks/app-data-context'

interface EntryMenuProps {
  entry: Entry
}

/** Per-entry actions: edit, turn the entry into a quest, and soft delete. */
export function EntryMenu({ entry }: EntryMenuProps) {
  const { quests, deleteEntry, restoreEntry, promoteEntryToQuest, settings } =
    useAppData()
  const announceAchievements = useAchievementToast()
  const [editing, setEditing] = useState(false)
  const [promoting, setPromoting] = useState(false)
  const canPromote = !isPromotedToLiveQuest(entry, quests)

  const handlePromote = async (input: QuestDetailsInput) => {
    const result = await promoteEntryToQuest(entry.id, input)
    announceAchievements({
      characterName: settings.characterName,
      skillId: result.skillId,
      levelUps: result.levelUps,
    })
  }
  const handleDelete = async () => {
    try {
      await deleteEntry(entry.id)
      toast(ENTRY_COPY.deleted, {
        id: TOAST_ID.undo,
        duration: TOAST_DURATION.undo,
        action: {
          label: COMMON_COPY.undo,
          onClick: () => {
            void restoreEntry(entry)
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
          <RowActionButton aria-label={ENTRY_COPY.menuLabel}>
            <MoreVertical />
          </RowActionButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setEditing(true)}>
            <Pencil />
            {COMMON_COPY.edit}
          </DropdownMenuItem>
          {canPromote ? (
            <DropdownMenuItem onSelect={() => setPromoting(true)}>
              <Sparkles />
              {ENTRY_COPY.promote}
            </DropdownMenuItem>
          ) : null}
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
        <EntryEditDialog entry={entry} onClose={() => setEditing(false)} />
      ) : null}

      {promoting ? (
        <QuestFormDialog
          title={QUEST_COPY.createTitle}
          submitLabel={QUEST_COPY.newQuest}
          initial={{
            title: entry.text,
            description: '',
            skillId: defaultSkillForPromotion(entry),
            tagIds: [],
          }}
          onSubmit={handlePromote}
          onClose={() => setPromoting(false)}
        />
      ) : null}
    </>
  )
}
