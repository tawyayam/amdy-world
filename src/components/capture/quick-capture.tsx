import { useState, type FormEvent } from 'react'
import { AutoGrowTextarea } from '@/components/common/auto-grow-textarea'
import { CaptureMetaFields } from '@/components/capture/capture-meta-fields'
import { CaptureSkillField } from '@/components/capture/capture-skill-field'
import { CaptureTypeChips } from '@/components/capture/capture-type-chips'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useAchievementToast } from '@/hooks/use-achievement-toast'
import { useAppData } from '@/hooks/use-app-data'
import { CAPTURE_COPY } from '@/lib/copy'
import { buildEntryMeta, emptyMetaForm } from '@/lib/entry-meta'
import { progressMessage } from '@/lib/messages'
import { SKILL_FOR_ENTRY_TYPE } from '@/lib/progress'
import type { SkillId } from '@/lib/skills'
import type { CaptureType } from '@/lib/types'

/** The one-line capture form: type chips, a text field, and instant XP feedback. */
export function QuickCapture() {
  const { addEntry, lastCaptureType, setLastCaptureType, settings } =
    useAppData()
  const announceAchievements = useAchievementToast()
  const [text, setText] = useState('')
  const [form, setForm] = useState(emptyMetaForm)
  const [skillId, setSkillId] = useState<SkillId>(
    defaultSkillFor(lastCaptureType),
  )
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const onTypeChange = (type: CaptureType) => {
    setLastCaptureType(type)
    setSkillId(defaultSkillFor(type))
    setMessage(null)
    setError(null)
  }

  const submit = async () => {
    const trimmed = text.trim()
    if (!trimmed) {
      setError(CAPTURE_COPY.textRequired)
      setMessage(null)
      return
    }

    setSaving(true)
    setError(null)
    try {
      const result = await addEntry({
        type: lastCaptureType,
        text: trimmed,
        skillId,
        meta: buildEntryMeta(lastCaptureType, form),
      })
      setMessage(
        progressMessage({
          xp: result.xp,
          skillId: result.skillId,
          levelUps: result.levelUps,
          characterName: settings.characterName,
        }),
      )
      announceAchievements({
        characterName: settings.characterName,
        levelUps: result.levelUps,
      })
      setText('')
      setForm(emptyMetaForm())
    } catch {
      setError(CAPTURE_COPY.saveFailed)
      setMessage(null)
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    void submit()
  }

  // The skill comes last, right before "Log it". For a session, minutes and the
  // skill share one row; reading keeps its pages/book row above the skill.
  const metaFields = (
    <CaptureMetaFields
      type={lastCaptureType}
      pages={form.pages}
      bookTitle={form.bookTitle}
      minutes={form.minutes}
      onPagesChange={(pages) => setForm((prev) => ({ ...prev, pages }))}
      onBookTitleChange={(bookTitle) =>
        setForm((prev) => ({ ...prev, bookTitle }))
      }
      onMinutesChange={(minutes) => setForm((prev) => ({ ...prev, minutes }))}
    />
  )
  const skillField = (
    <CaptureSkillField
      value={skillId}
      onChange={(next) => {
        if (next) setSkillId(next)
      }}
    />
  )

  return (
    <Card>
      <CardHeader>
        <h2 className="leading-none font-semibold">{CAPTURE_COPY.title}</h2>
      </CardHeader>
      <CardContent className="space-y-3">
        <form onSubmit={handleSubmit} className="space-y-3">
          <CaptureTypeChips value={lastCaptureType} onChange={onTypeChange} />

          <div className="space-y-1.5">
            <label
              htmlFor="capture-text"
              className="text-xs text-muted-foreground"
            >
              {CAPTURE_COPY.textLabel}
            </label>
            <AutoGrowTextarea
              id="capture-text"
              value={text}
              placeholder={CAPTURE_COPY.textPlaceholder}
              invalid={Boolean(error)}
              onChange={(value) => {
                setText(value)
                if (message) setMessage(null)
                if (error) setError(null)
              }}
              onSubmit={() => {
                void submit()
              }}
              minRows={2}
              maxRows={8}
            />
          </div>

          {lastCaptureType === 'session' ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {metaFields}
              {skillField}
            </div>
          ) : (
            <>
              {metaFields}
              {skillField}
            </>
          )}

          <div className="flex items-center justify-between gap-3">
            <Button type="submit" disabled={saving}>
              {CAPTURE_COPY.save}
            </Button>
            <p aria-live="polite" className="text-sm">
              {message ? (
                <span dir="auto" className="font-medium text-primary">
                  {message}
                </span>
              ) : null}
            </p>
          </div>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  )
}

/** The skill a capture type files under by default. */
function defaultSkillFor(type: CaptureType): SkillId {
  return SKILL_FOR_ENTRY_TYPE[type] as SkillId
}
