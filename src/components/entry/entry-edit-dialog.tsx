import { useState, type FormEvent } from 'react'
import { AutoGrowTextarea } from '@/components/common/auto-grow-textarea'
import { FormDialog } from '@/components/common/form-dialog'
import { CaptureMetaFields } from '@/components/capture/capture-meta-fields'
import { CaptureQuestField } from '@/components/capture/capture-quest-field'
import { CaptureSkillField } from '@/components/capture/capture-skill-field'
import { Button } from '@/components/ui/button'
import { useAppData } from '@/hooks/use-app-data'
import { CAPTURE_COPY, COMMON_COPY, ENTRY_COPY } from '@/lib/copy'
import { entryMetaForEdit, metaFormFromEntry } from '@/lib/entry-meta'
import { activeQuests } from '@/lib/quests'
import type { Entry, Quest } from '@/lib/types'

interface EntryEditDialogProps {
  entry: Entry
  onClose: () => void
}

/** Edits an entry's text, skill, quest link, and type-specific fields, in place. */
export function EntryEditDialog({ entry, onClose }: EntryEditDialogProps) {
  const { updateEntry, quests } = useAppData()
  const [text, setText] = useState(entry.text)
  const [skillId, setSkillId] = useState(entry.skillId)
  const [form, setForm] = useState(() => metaFormFromEntry(entry))
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Active quests, plus the entry's own linked quest while it still exists —
  // even if it is paused or done, so the saved link never vanishes from under
  // the person.
  const linkedQuestId = entry.meta?.questId
  const questOptions = questOptionsFor(quests, linkedQuestId)

  const save = async () => {
    const trimmed = text.trim()
    if (!trimmed) {
      setError(CAPTURE_COPY.textRequired)
      return
    }
    setSaving(true)
    setError(null)
    try {
      await updateEntry(entry.id, {
        text: trimmed,
        skillId,
        meta: entryMetaForEdit(entry, form),
      })
      onClose()
    } catch {
      setError(COMMON_COPY.actionFailed)
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void save()
  }

  const idPrefix = `entry-${entry.id}`

  return (
    <FormDialog
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      title={ENTRY_COPY.editTitle}
      onSubmit={handleSubmit}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            {COMMON_COPY.cancel}
          </Button>
          <Button type="submit" disabled={saving}>
            {COMMON_COPY.save}
          </Button>
        </>
      }
    >
      <div className="space-y-1.5">
        <label
          htmlFor={`${idPrefix}-text`}
          className="text-xs text-muted-foreground"
        >
          {ENTRY_COPY.editTextLabel}
        </label>
        <AutoGrowTextarea
          id={`${idPrefix}-text`}
          value={text}
          autoFocus
          invalid={Boolean(error)}
          onChange={setText}
          onSubmit={() => {
            void save()
          }}
        />
      </div>

      <CaptureSkillField
        idPrefix={idPrefix}
        value={skillId}
        allowNone={entry.type === 'note'}
        onChange={setSkillId}
      />

      <CaptureQuestField
        quests={questOptions}
        value={form.questId === '' ? null : form.questId}
        onChange={(questId) =>
          setForm((prev) => ({ ...prev, questId: questId ?? '' }))
        }
        idPrefix={idPrefix}
      />

      <CaptureMetaFields
        idPrefix={idPrefix}
        type={entry.type}
        pages={form.pages}
        bookTitle={form.bookTitle}
        minutes={form.minutes}
        onPagesChange={(pages) => setForm((prev) => ({ ...prev, pages }))}
        onBookTitleChange={(bookTitle) =>
          setForm((prev) => ({ ...prev, bookTitle }))
        }
        onMinutesChange={(minutes) => setForm((prev) => ({ ...prev, minutes }))}
      />

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </FormDialog>
  )
}

/** Active quests, with the entry's own linked quest kept while it is live. */
function questOptionsFor(
  quests: readonly Quest[],
  linkedQuestId: string | undefined,
): Quest[] {
  const options = activeQuests(quests)
  if (linkedQuestId === undefined) return options
  if (options.some((quest) => quest.id === linkedQuestId)) return options
  const linked = quests.find(
    (quest) => quest.id === linkedQuestId && quest.deletedAt === null,
  )
  return linked ? [...options, linked] : options
}
