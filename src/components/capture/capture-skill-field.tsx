// Small skill selector used by quick capture, the entry edit dialog, and the
// quest form. Built on the shadcn Select for a themed panel; the caller decides
// whether a "No skill" option is offered (notes have none).

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CAPTURE_COPY } from '@/lib/copy'
import { SKILLS, type SkillId } from '@/lib/skills'

interface CaptureSkillFieldProps {
  value: SkillId | null
  onChange: (skillId: SkillId | null) => void
  /** Offers a "No skill" choice, used for entries without a skill. */
  allowNone?: boolean
  /** Namespaces the field id so two forms on screen never collide. */
  idPrefix?: string
  /** Hides the visible label but keeps it for screen readers, for inline rows. */
  labelHidden?: boolean
}

/** Radix Select cannot carry an empty-string value, so "none" is a sentinel. */
const NONE_VALUE = 'none'

/** Compact select that decides which skill an entry's XP goes to. */
export function CaptureSkillField({
  value,
  onChange,
  allowNone = false,
  idPrefix = 'capture',
  labelHidden = false,
}: CaptureSkillFieldProps) {
  const id = `${idPrefix}-skill`
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className={labelHidden ? 'sr-only' : 'text-xs text-muted-foreground'}
      >
        {CAPTURE_COPY.skillLabel}
      </label>
      <Select
        value={value ?? NONE_VALUE}
        onValueChange={(next) =>
          onChange(next === NONE_VALUE ? null : (next as SkillId))
        }
      >
        <SelectTrigger id={id} className="min-h-11 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {allowNone ? (
            <SelectItem value={NONE_VALUE}>{CAPTURE_COPY.skillNone}</SelectItem>
          ) : null}
          {SKILLS.map((skill) => (
            <SelectItem key={skill.id} value={skill.id}>
              {skill.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
