import { useState, type FormEvent } from 'react'
import { FormDialog } from '@/components/common/form-dialog'
import { CaptureSkillField } from '@/components/capture/capture-skill-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { COMMON_COPY, GOALS_COPY } from '@/lib/copy'
import type { GoalDetailsInput } from '@/hooks/app-data-context'
import type { SkillId } from '@/lib/skills'

interface GoalFormDialogProps {
  title: string
  submitLabel: string
  initial?: GoalDetailsInput
  onSubmit: (input: GoalDetailsInput) => Promise<void>
  onClose: () => void
}

/** Edits one daily goal: its title and the skill its XP goes to. */
export function GoalFormDialog({
  title,
  submitLabel,
  initial,
  onSubmit,
  onClose,
}: GoalFormDialogProps) {
  const [titleText, setTitleText] = useState(initial?.title ?? '')
  const [skillId, setSkillId] = useState<SkillId>(
    initial?.skillId ?? 'programming',
  )
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = titleText.trim()
    if (!trimmed) {
      setError(GOALS_COPY.titleRequired)
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSubmit({ title: trimmed, skillId })
      onClose()
    } catch {
      setError(COMMON_COPY.actionFailed)
    } finally {
      setSaving(false)
    }
  }

  return (
    <FormDialog
      open
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose()
      }}
      title={title}
      onSubmit={handleSubmit}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            {COMMON_COPY.cancel}
          </Button>
          <Button type="submit" disabled={saving}>
            {submitLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-1.5">
        <label
          htmlFor="goal-form-title"
          className="text-xs text-muted-foreground"
        >
          {GOALS_COPY.titleLabel}
        </label>
        <Input
          id="goal-form-title"
          dir="auto"
          value={titleText}
          placeholder={GOALS_COPY.titlePlaceholder}
          onChange={(event) => setTitleText(event.target.value)}
          className="min-h-11"
          autoComplete="off"
          autoFocus
        />
      </div>

      <CaptureSkillField
        value={skillId}
        onChange={(next) => setSkillId(next ?? 'programming')}
        idPrefix="goal-form"
      />

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </FormDialog>
  )
}
