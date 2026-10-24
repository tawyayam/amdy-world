import { useState, type FormEvent } from 'react'
import { CaptureSkillField } from '@/components/capture/capture-skill-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppData } from '@/hooks/use-app-data'
import { GOALS_COPY } from '@/lib/copy'
import type { SkillId } from '@/lib/skills'

/** Inline form for adding a one-off goal to today. Skill is required. */
export function GoalAddForm() {
  const { addDailyGoal } = useAppData()
  const [title, setTitle] = useState('')
  const [skillId, setSkillId] = useState<SkillId>('programming')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) {
      setError(GOALS_COPY.titleRequired)
      return
    }
    setSaving(true)
    setError(null)
    try {
      await addDailyGoal({ title: trimmed, skillId })
      setTitle('')
    } catch {
      setError(GOALS_COPY.addFailed)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <div className="flex-1 space-y-1.5">
          <label htmlFor="goal-add-title" className="sr-only">
            {GOALS_COPY.addLabel}
          </label>
          <Input
            id="goal-add-title"
            dir="auto"
            value={title}
            placeholder={GOALS_COPY.addPlaceholder}
            onChange={(event) => {
              setTitle(event.target.value)
              if (error) setError(null)
            }}
            className="min-h-11"
            autoComplete="off"
          />
        </div>
        <div className="sm:w-40">
          <CaptureSkillField
            value={skillId}
            onChange={(next) => {
              if (next) setSkillId(next)
            }}
            idPrefix="goal-add"
            labelHidden
          />
        </div>
        <Button type="submit" disabled={saving} className="min-h-11">
          {GOALS_COPY.add}
        </Button>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </form>
  )
}
