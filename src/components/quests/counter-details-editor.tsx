import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QUEST_COPY } from '@/lib/copy'
import type { CounterSectionRow } from '@/lib/counter-form'

interface CounterDetailsEditorProps {
  startValue: string
  /** Editing freezes the starting value; the input shows it read-only. */
  startValueDisabled: boolean
  sections: CounterSectionRow[]
  onStartValueChange: (startValue: string) => void
  onSectionsChange: (sections: CounterSectionRow[]) => void
  idPrefix: string
}

/**
 * The counter fields that live under "More options": the starting value and the
 * course-section rows.
 */
export function CounterDetailsEditor({
  startValue,
  startValueDisabled,
  sections,
  onStartValueChange,
  onSectionsChange,
  idPrefix,
}: CounterDetailsEditorProps) {
  const updateRow = (id: string, patch: Partial<CounterSectionRow>) => {
    onSectionsChange(
      sections.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label
          htmlFor={`${idPrefix}-counter-start`}
          className="block text-xs text-muted-foreground"
        >
          {QUEST_COPY.counterStartLabel}
        </label>
        <Input
          id={`${idPrefix}-counter-start`}
          type="number"
          inputMode="numeric"
          min={0}
          value={startValue}
          disabled={startValueDisabled}
          onChange={(event) => onStartValueChange(event.target.value)}
          className="h-11 max-w-40"
        />
        <p className="text-xs text-muted-foreground">
          {QUEST_COPY.counterStartHelp}
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">{QUEST_COPY.counterSectionsTitle}</p>
        <p className="text-xs text-muted-foreground">
          {QUEST_COPY.counterSectionsHelp}
        </p>
        {sections.map((row) => (
          <div
            key={row.id}
            className="flex flex-col gap-2 sm:flex-row sm:items-end"
          >
            <div className="min-w-0 flex-1 space-y-1.5">
              <label
                htmlFor={`${idPrefix}-section-title-${row.id}`}
                className="sr-only"
              >
                {QUEST_COPY.counterSectionTitleLabel}
              </label>
              <Input
                id={`${idPrefix}-section-title-${row.id}`}
                dir="auto"
                value={row.title}
                placeholder={QUEST_COPY.counterSectionTitleLabel}
                onChange={(event) =>
                  updateRow(row.id, { title: event.target.value })
                }
                className="h-11"
                autoComplete="off"
              />
            </div>
            <div className="flex w-full items-end gap-2 sm:w-auto sm:shrink-0">
              <div className="flex-1 space-y-1.5 sm:w-24 sm:flex-initial">
                <label
                  htmlFor={`${idPrefix}-section-end-${row.id}`}
                  className="sr-only"
                >
                  {QUEST_COPY.counterSectionEndLabel}
                </label>
                <Input
                  id={`${idPrefix}-section-end-${row.id}`}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={row.endAt}
                  placeholder={QUEST_COPY.counterSectionEndLabel}
                  onChange={(event) =>
                    updateRow(row.id, { endAt: event.target.value })
                  }
                  className="h-11"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={QUEST_COPY.counterSectionRemove}
                className="h-11 w-11 shrink-0"
                onClick={() =>
                  onSectionsChange(
                    sections.filter((item) => item.id !== row.id),
                  )
                }
              >
                <Trash2 />
              </Button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-1.5 h-11"
          onClick={() =>
            onSectionsChange([
              ...sections,
              { id: globalThis.crypto.randomUUID(), title: '', endAt: '' },
            ])
          }
        >
          <Plus />
          {QUEST_COPY.counterSectionAdd}
        </Button>
      </div>
    </div>
  )
}
