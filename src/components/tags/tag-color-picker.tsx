// Round color swatches for choosing a tag color, built on shadcn RadioGroup.
// Each swatch is a real radio for the keyboard and screen reader, tinted with a
// theme token; the selected one also shows a check so color is not the only cue.

import { Check } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { TAGS_COPY } from '@/lib/copy'
import { TAG_COLOR_TOKENS, tagColorVar } from '@/lib/tags'
import { cn } from '@/lib/utils'
import type { TagColor } from '@/lib/types'

interface TagColorPickerProps {
  value: TagColor
  onChange: (color: TagColor) => void
  /** Namespaces the radio ids so two pickers on screen never collide. */
  idPrefix?: string
}

/** Tokens light enough that the check must be dark to stay legible. */
const LIGHT_TOKENS: readonly TagColor[] = ['neutral', 'gold', 'orange']

/** Radio swatches that pick a tag's color. */
export function TagColorPicker({
  value,
  onChange,
  idPrefix = 'tag-color',
}: TagColorPickerProps) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(next) => onChange(next as TagColor)}
      aria-label={TAGS_COPY.colorLabel}
      className="flex flex-wrap gap-2"
    >
      {TAG_COLOR_TOKENS.map((token) => {
        const selected = value === token
        return (
          <div key={token} className="relative">
            <RadioGroupItem
              id={`${idPrefix}-${token}`}
              value={token}
              aria-label={TAGS_COPY.colorNames[token]}
              className={cn(
                'size-8 rounded-full border-2 border-border shadow-xs',
                'data-[state=checked]:border-foreground',
                'focus-visible:ring-[3px] focus-visible:ring-ring/50',
                '[&_[data-slot=radio-group-indicator]]:hidden',
              )}
              style={{ backgroundColor: tagColorVar(token) }}
            />
            {selected ? (
              <Check
                aria-hidden="true"
                className={cn(
                  'pointer-events-none absolute top-1/2 left-1/2 size-4 -translate-x-1/2 -translate-y-1/2',
                  LIGHT_TOKENS.includes(token)
                    ? 'text-background'
                    : 'text-white',
                )}
              />
            ) : null}
          </div>
        )
      })}
    </RadioGroup>
  )
}
