import { useState, type FormEvent } from 'react'
import { AutoGrowTextarea } from '@/components/common/auto-grow-textarea'
import { EntryRow } from '@/components/entry/entry-row'
import { Button } from '@/components/ui/button'
import { useAppData } from '@/hooks/use-app-data'
import { COMMON_COPY, QUEST_COPY } from '@/lib/copy'
import { buildEntryMeta, emptyMetaForm } from '@/lib/entry-meta'
import type { Quest } from '@/lib/types'

interface JourneyNotesProps {
  quest: Quest
}

/**
 * The quest's log: live entries linked to it (journey notes and promoted
 * origins), newest first, with a one-line form that adds a pre-linked note.
 */
export function JourneyNotes({ quest }: JourneyNotesProps) {
  const { entries, addEntry } = useAppData()
  const [text, setText] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const linked = entries
    .filter(
      (entry) => entry.deletedAt === null && entry.meta?.questId === quest.id,
    )
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt))

  const saveNote = async () => {
    const trimmed = text.trim()
    if (!trimmed) return
    setSaving(true)
    setError(null)
    try {
      await addEntry({
        type: 'note',
        text: trimmed,
        meta: buildEntryMeta('note', {
          ...emptyMetaForm(),
          questId: quest.id,
        }),
      })
      setText('')
      setMessage(QUEST_COPY.journeyAdded)
    } catch {
      setError(COMMON_COPY.actionFailed)
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    void saveNote()
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{QUEST_COPY.journeyIntro}</p>

      <form onSubmit={handleSubmit} className="space-y-2">
        <label htmlFor="journey-note" className="sr-only">
          {QUEST_COPY.journeyAddLabel}
        </label>
        <AutoGrowTextarea
          id="journey-note"
          value={text}
          placeholder={QUEST_COPY.journeyAddPlaceholder}
          onChange={(next) => {
            setText(next)
            if (message) setMessage(null)
            if (error) setError(null)
          }}
          onSubmit={() => {
            void saveNote()
          }}
          maxRows={6}
        />
        <div className="flex items-center gap-3">
          <Button
            type="submit"
            size="sm"
            disabled={saving || text.trim() === ''}
          >
            {QUEST_COPY.journeyAdd}
          </Button>
          <p aria-live="polite" className="text-sm text-muted-foreground">
            {message ?? ''}
          </p>
        </div>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </form>

      {linked.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {QUEST_COPY.journeyEmpty}
        </p>
      ) : (
        <ul className="divide-y">
          {linked.map((entry) => (
            <EntryRow key={entry.id} entry={entry} />
          ))}
        </ul>
      )}
    </div>
  )
}
