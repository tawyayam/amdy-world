import { useState, type FormEvent } from 'react'
import { FormDialog } from '@/components/common/form-dialog'
import { CaptureSkillField } from '@/components/capture/capture-skill-field'
import { WeekdayPicker } from '@/components/goals/weekday-picker'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { COMMON_COPY, GOALS_COPY } from '@/lib/copy'
import type { GoalTemplateInput } from '@/hooks/app-data-context'
import type { SkillId } from '@/lib/skills'
import type { Weekday } from '@/lib/types'

interface TemplateFormDialogProps {
  title: string
  submitLabel: string
  initial?: GoalTemplateInput
  onSubmit: (input: GoalTemplateInput) => Promise<void>
  onClose: () => void
}

const ALL_DAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6]

/** Creates or edits a recurring goal: title, skill, repeat days, and active. */
export function TemplateFormDialog({
  title,
  submitLabel,
  initial,
  onSubmit,
  onClose,
}: TemplateFormDialogProps) {
  const [titleText, setTitleText] = useState(initial?.title ?? '')
  const [skillId, setSkillId] = useState<SkillId>(
    initial?.skillId ?? 'programming',
  )
  const [days, setDays] = useState<Weekday[]>(initial?.days ?? ALL_DAYS)
  const [active, setActive] = useState(initial?.active ?? true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = titleText.trim()
    if (!trimmed) {
      setError(GOALS_COPY.titleRequired)
      return
    }
    if (days.length === 0) {
      setError(GOALS_COPY.daysRequired)
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSubmit({
        title: trimmed,
        skillId,
        days: [...days].sort((first, second) => first - second),
        active,
      })
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
      onOpenChange={(open) => {
        if (!open) onClose()
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
          htmlFor="template-title"
          className="text-xs text-muted-foreground"
        >
          {GOALS_COPY.titleLabel}
        </label>
        <Input
          id="template-title"
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
        onChange={(next) => {
          if (next) setSkillId(next)
        }}
        idPrefix="template-form"
      />

      <WeekdayPicker value={days} onChange={setDays} />

      <label
        htmlFor="template-active"
        className="flex min-h-11 w-fit cursor-pointer items-center gap-2 text-sm"
      >
        <Checkbox
          id="template-active"
          checked={active}
          onCheckedChange={(value) => setActive(value === true)}
        />
        {GOALS_COPY.activeLabel}
      </label>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </FormDialog>
  )
}
