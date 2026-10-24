import { type KeyboardEvent } from 'react'
import { QUEST_COPY } from '@/lib/copy'
import type { QuestKind } from '@/lib/types'
import { cn } from '@/lib/utils'

const KINDS: readonly QuestKind[] = ['steps', 'counter']

const KIND_LABEL: Record<QuestKind, string> = {
  steps: QUEST_COPY.kindSteps,
  counter: QUEST_COPY.kindCounter,
}

const KIND_HINT: Record<QuestKind, string> = {
  steps: QUEST_COPY.kindStepsHint,
  counter: QUEST_COPY.kindCounterHint,
}

interface QuestKindFieldProps {
  value: QuestKind
  onChange: (kind: QuestKind) => void
  /** A quest keeps its progress model, so editing locks the choice. */
  locked?: boolean
}

/**
 * The "Steps or Counter" choice on the quest form. Same keyboard-friendly
 * radiogroup pattern as the capture type chips; arrow keys move between the
 * two options unless the choice is locked.
 */
export function QuestKindField({
  value,
  onChange,
  locked = false,
}: QuestKindFieldProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (locked) return
    const index = KINDS.indexOf(value)
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      onChange(KINDS[(index + 1) % KINDS.length])
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      onChange(KINDS[(index - 1 + KINDS.length) % KINDS.length])
    }
  }

  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground" id="quest-kind-label">
        {QUEST_COPY.kindLabel}
      </p>
      <div
        role="radiogroup"
        aria-labelledby="quest-kind-label"
        onKeyDown={handleKeyDown}
        className="flex gap-2"
      >
        {KINDS.map((kind) => {
          const selected = kind === value
          return (
            <button
              key={kind}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              disabled={locked && !selected}
              onClick={() => {
                if (!locked) onChange(kind)
              }}
              className={cn(
                'min-h-11 flex-1 rounded-full border px-4 text-sm font-medium transition-colors',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                'disabled:cursor-not-allowed disabled:opacity-60',
                selected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground',
              )}
            >
              {KIND_LABEL[kind]}
            </button>
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        {locked ? QUEST_COPY.kindLocked : KIND_HINT[value]}
      </p>
    </div>
  )
}
