// The global tag list: add, edit (name + color), and soft delete (undoable)
// tags. This is the only place tags are created. Uniqueness is checked here for
// an inline message and again in the hook as a guard.

import { Check, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { UserText } from '@/components/common/user-text'
import { RowActionButton } from '@/components/common/row-action-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppData } from '@/hooks/use-app-data'
import { COMMON_COPY, TAGS_COPY } from '@/lib/copy'
import { TOAST_DURATION, TOAST_ID } from '@/lib/toast'
import { isTagNameTaken, tagColorVar } from '@/lib/tags'
import type { Tag, TagColor } from '@/lib/types'
import { TagColorPicker } from './tag-color-picker'

/** Lists every live tag with add, edit, and delete controls. */
export function TagsManager() {
  const { tags, createTag, updateTag, deleteTag, restoreTag } = useAppData()
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState<TagColor>('neutral')
  const [addError, setAddError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState<TagColor>('neutral')
  const [editError, setEditError] = useState<string | null>(null)

  const startEdit = (tag: Tag) => {
    setEditingId(tag.id)
    setEditName(tag.name)
    setEditColor(tag.colorToken ?? 'neutral')
    setEditError(null)
  }

  const handleAdd = async () => {
    const name = newName.trim()
    if (!name) {
      setAddError(TAGS_COPY.nameRequired)
      return
    }
    if (isTagNameTaken(tags, name)) {
      setAddError(TAGS_COPY.nameTaken)
      return
    }
    try {
      await createTag({ name, colorToken: newColor })
      setNewName('')
      setNewColor('neutral')
      setAddError(null)
    } catch {
      setAddError(TAGS_COPY.nameTaken)
    }
  }

  const saveEdit = async (id: string) => {
    const name = editName.trim()
    if (!name) {
      setEditError(TAGS_COPY.nameRequired)
      return
    }
    if (isTagNameTaken(tags, name, id)) {
      setEditError(TAGS_COPY.nameTaken)
      return
    }
    try {
      await updateTag(id, { name, colorToken: editColor })
      setEditingId(null)
      setEditError(null)
    } catch {
      setEditError(TAGS_COPY.nameTaken)
    }
  }

  const handleDelete = async (tag: Tag) => {
    try {
      await deleteTag(tag.id)
      if (editingId === tag.id) setEditingId(null)
      toast(TAGS_COPY.deleted, {
        id: TOAST_ID.undo,
        duration: TOAST_DURATION.undo,
        action: {
          label: COMMON_COPY.undo,
          onClick: () => {
            void restoreTag(tag)
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
    <div className="space-y-4">
      {tags.length === 0 ? (
        <p className="text-sm text-muted-foreground">{TAGS_COPY.empty}</p>
      ) : (
        <ul className="space-y-1">
          {tags.map((tag) =>
            editingId === tag.id ? (
              <li
                key={tag.id}
                className="space-y-3 rounded-md border border-border p-3"
              >
                <Input
                  value={editName}
                  dir="auto"
                  autoComplete="off"
                  aria-label={TAGS_COPY.renameLabel}
                  className="h-11"
                  autoFocus
                  onChange={(event) => {
                    setEditName(event.target.value)
                    setEditError(null)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      void saveEdit(tag.id)
                    }
                  }}
                />
                <TagColorPicker
                  value={editColor}
                  onChange={setEditColor}
                  idPrefix={`tag-edit-${tag.id}`}
                />
                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingId(null)}
                  >
                    {COMMON_COPY.cancel}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => void saveEdit(tag.id)}
                  >
                    <Check />
                    {COMMON_COPY.save}
                  </Button>
                </div>
                {editError ? (
                  <p role="alert" className="text-xs text-destructive">
                    {editError}
                  </p>
                ) : null}
              </li>
            ) : (
              <li
                key={tag.id}
                className="flex min-h-11 items-center gap-2 rounded-md border border-border px-2"
              >
                <span
                  aria-hidden="true"
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: tagColorVar(tag.colorToken) }}
                />
                <span dir="auto" className="flex-1 truncate text-sm">
                  <UserText>{tag.name}</UserText>
                </span>
                <RowActionButton
                  aria-label={TAGS_COPY.edit}
                  onClick={() => startEdit(tag)}
                >
                  <Pencil />
                </RowActionButton>
                <RowActionButton
                  aria-label={TAGS_COPY.deleteTag}
                  onClick={() => void handleDelete(tag)}
                >
                  <Trash2 />
                </RowActionButton>
              </li>
            ),
          )}
        </ul>
      )}

      <div className="space-y-3 border-t border-border pt-4">
        <Input
          value={newName}
          dir="auto"
          autoComplete="off"
          aria-label={TAGS_COPY.nameLabel}
          placeholder={TAGS_COPY.namePlaceholder}
          className="h-11"
          onChange={(event) => {
            setNewName(event.target.value)
            setAddError(null)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              void handleAdd()
            }
          }}
        />
        <TagColorPicker value={newColor} onChange={setNewColor} />
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full"
          onClick={() => void handleAdd()}
        >
          {TAGS_COPY.add}
        </Button>
        {addError ? (
          <p role="alert" className="text-xs text-destructive">
            {addError}
          </p>
        ) : null}
      </div>
    </div>
  )
}
