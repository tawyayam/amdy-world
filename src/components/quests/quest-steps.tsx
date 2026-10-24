import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { useAppData } from '@/hooks/use-app-data'
import { cn } from '@/lib/utils'
import { QUEST_COPY } from '@/lib/copy'
import type { Quest } from '@/lib/types'

interface QuestStepsProps {
  quest: Quest
}

/** The step list of a quest: tick steps, reorder them, and add new ones. */
export function QuestSteps({ quest }: QuestStepsProps) {
  const { addQuestStep, toggleQuestStep, moveQuestStep } = useAppData()
  const [title, setTitle] = useState('')

  const handleAdd = async (event: FormEvent) => {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    await addQuestStep(quest.id, trimmed)
    setTitle('')
  }

  return (
    <div className="space-y-3">
      {quest.steps.length === 0 ? (
        <p className="text-sm text-muted-foreground">{QUEST_COPY.noSteps}</p>
      ) : (
        <ul className="space-y-1">
          {quest.steps.map((step, index) => (
            <li key={step.id} className="flex items-center gap-2">
              <Checkbox
                id={`step-${step.id}`}
                checked={step.done}
                onCheckedChange={() => {
                  void toggleQuestStep(quest.id, step.id)
                }}
              />
              <label
                htmlFor={`step-${step.id}`}
                dir="auto"
                className={cn(
                  'flex-1 py-2.5 text-sm break-words',
                  step.done && 'text-muted-foreground line-through',
                )}
              >
                {step.title}
              </label>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-11"
                aria-label={QUEST_COPY.moveUp}
                disabled={index === 0}
                onClick={() => {
                  void moveQuestStep(quest.id, step.id, 'up')
                }}
              >
                <ChevronUp />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-11"
                aria-label={QUEST_COPY.moveDown}
                disabled={index === quest.steps.length - 1}
                onClick={() => {
                  void moveQuestStep(quest.id, step.id, 'down')
                }}
              >
                <ChevronDown />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="flex items-center gap-2">
        <label htmlFor="quest-step-new" className="sr-only">
          {QUEST_COPY.stepPlaceholder}
        </label>
        <Input
          id="quest-step-new"
          dir="auto"
          value={title}
          placeholder={QUEST_COPY.stepPlaceholder}
          onChange={(event) => setTitle(event.target.value)}
          className="h-11"
          autoComplete="off"
        />
        <Button type="submit" variant="secondary" disabled={!title.trim()}>
          {QUEST_COPY.addStep}
        </Button>
      </form>
    </div>
  )
}
