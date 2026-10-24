import { useState, type FormEvent } from 'react'
import { AutoGrowTextarea } from '@/components/common/auto-grow-textarea'
import { DisclosureSection } from '@/components/common/disclosure-section'
import { FormDialog } from '@/components/common/form-dialog'
import { CaptureSkillField } from '@/components/capture/capture-skill-field'
import { CounterDetailsEditor } from '@/components/quests/counter-details-editor'
import { CounterTargetRow } from '@/components/quests/counter-target-row'
import { QuestKindField } from '@/components/quests/quest-kind-field'
import { TagPicker } from '@/components/tags/tag-picker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { COMMON_COPY, QUEST_COPY } from '@/lib/copy'
import { validateCounterForm, type CounterSectionRow } from '@/lib/counter-form'
import {
  isMoreOptionsError,
  isTargetRowError,
  isTotalError,
  isUnitError,
  shouldOpenMoreOptions,
} from '@/lib/quest-form'
import type { QuestDetailsInput } from '@/hooks/app-data-context'
import type { SkillId } from '@/lib/skills'
import type { QuestKind } from '@/lib/types'

interface QuestFormDialogProps {
  title: string
  submitLabel: string
  initial?: QuestDetailsInput
  /** The counter's current value when editing; the total cannot drop below it. */
  counterMinValue?: number
  onSubmit: (input: QuestDetailsInput) => Promise<void>
  onClose: () => void
}

/** A row seeded from a saved section, or blank for a new milestone. */
function seedSections(initial?: QuestDetailsInput): CounterSectionRow[] {
  return (
    initial?.counter?.sections?.map((section) => ({
      id: section.id,
      title: section.title,
      endAt: String(section.endAt),
    })) ?? []
  )
}

/**
 * Creates, edits, or promotes a quest. Title, progress model, the Unit and
 * Total row, the skill, the description, and the tags stay visible; only the
 * counter's starting value and course sections sit under a "More options"
 * disclosure that opens itself when an edit already fills it or a validation
 * error belongs inside.
 */
export function QuestFormDialog({
  title,
  submitLabel,
  initial,
  counterMinValue = 0,
  onSubmit,
  onClose,
}: QuestFormDialogProps) {
  const [titleText, setTitleText] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [skillId, setSkillId] = useState<SkillId>(
    initial?.skillId ?? 'programming',
  )
  const [tagIds, setTagIds] = useState<string[]>(initial?.tagIds ?? [])
  const [kind, setKind] = useState<QuestKind>(initial?.kind ?? 'steps')
  const [unit, setUnit] = useState(initial?.counter?.unit ?? 'lesson')
  const [total, setTotal] = useState(
    initial?.counter?.total !== undefined ? String(initial.counter.total) : '',
  )
  const [startValue, setStartValue] = useState(
    initial?.counter?.startValue !== undefined
      ? String(initial.counter.startValue)
      : '0',
  )
  const [sections, setSections] = useState(() => seedSections(initial))
  const [moreOpen, setMoreOpen] = useState(() =>
    shouldOpenMoreOptions({
      startValue:
        initial?.counter?.startValue !== undefined
          ? String(initial.counter.startValue)
          : '0',
      sections: seedSections(initial),
      error: null,
    }),
  )
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // A quest keeps its progress model, so editing can never switch it.
  const kindLocked = initial !== undefined

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = titleText.trim()
    if (!trimmed) {
      setError(QUEST_COPY.titleRequired)
      return
    }

    let counter: QuestDetailsInput['counter']
    if (kind === 'counter') {
      const validated = validateCounterForm(
        { unit, total, startValue, sections },
        counterMinValue,
      )
      if (validated.error !== null || !validated.counter) {
        const message = validated.error ?? QUEST_COPY.counterTotalRequired
        setError(message)
        if (isMoreOptionsError(message)) setMoreOpen(true)
        return
      }
      counter = {
        unit: validated.counter.unit,
        total: validated.counter.total,
        startValue: validated.counter.startValue,
        sections: validated.counter.sections,
      }
    }

    setSaving(true)
    setError(null)
    try {
      await onSubmit({
        title: trimmed,
        description: description.trim(),
        skillId,
        tagIds,
        kind,
        ...(counter ? { counter } : {}),
      })
      onClose()
    } catch {
      setError(COMMON_COPY.actionFailed)
    } finally {
      setSaving(false)
    }
  }

  const slotError =
    error && !isTargetRowError(error) && !isMoreOptionsError(error)
      ? error
      : null

  return (
    <FormDialog
      open
      onOpenChange={(next) => {
        if (!next) onClose()
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
        <label htmlFor="quest-title" className="text-xs text-muted-foreground">
          {QUEST_COPY.titleLabel}
        </label>
        <Input
          id="quest-title"
          dir="auto"
          value={titleText}
          placeholder={QUEST_COPY.titlePlaceholder}
          onChange={(event) => setTitleText(event.target.value)}
          className="h-11"
          autoComplete="off"
          autoFocus
        />
      </div>

      <QuestKindField value={kind} onChange={setKind} locked={kindLocked} />

      {kind === 'counter' ? (
        <CounterTargetRow
          unit={unit}
          total={total}
          unitError={isUnitError(error) ? error : null}
          totalError={isTotalError(error) ? error : null}
          onUnitChange={setUnit}
          onTotalChange={setTotal}
          idPrefix="quest-form"
        />
      ) : null}

      <CaptureSkillField
        value={skillId}
        onChange={(next) => setSkillId(next ?? 'programming')}
        idPrefix="quest-form"
      />

      <div className="space-y-1.5">
        <label
          htmlFor="quest-description"
          className="text-xs text-muted-foreground"
        >
          {QUEST_COPY.descriptionLabel}
        </label>
        <AutoGrowTextarea
          id="quest-description"
          value={description}
          placeholder={QUEST_COPY.descriptionPlaceholder}
          onChange={setDescription}
          submitOnEnter={false}
          minRows={2}
          maxRows={8}
        />
      </div>

      <TagPicker
        selectedIds={tagIds}
        onChange={setTagIds}
        idPrefix="quest-form"
      />

      {kind === 'counter' ? (
        <DisclosureSection
          open={moreOpen}
          onToggle={() => setMoreOpen((open) => !open)}
          label={QUEST_COPY.moreOptionsLabel}
          idBase="quest-form"
        >
          <CounterDetailsEditor
            startValue={startValue}
            startValueDisabled={kindLocked}
            sections={sections}
            onStartValueChange={setStartValue}
            onSectionsChange={setSections}
            idPrefix="quest-form"
          />

          {error && isMoreOptionsError(error) ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </DisclosureSection>
      ) : null}

      {slotError ? (
        <p role="alert" className="text-sm text-destructive">
          {slotError}
        </p>
      ) : null}
    </FormDialog>
  )
}
