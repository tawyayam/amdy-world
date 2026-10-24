import { useId, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { QuestList } from '@/components/quests/quest-list'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Quest } from '@/lib/types'

interface QuestStatusSectionProps {
  heading: string
  quests: Quest[]
  /** Render as a disclosure, collapsed by default. Used for Completed. */
  collapsible?: boolean
}

/**
 * One status section of the Quests list. Collapsible sections become a keyboard
 * operable disclosure (a heading button with `aria-expanded`) that starts
 * collapsed, so a growing pile of completed quests stays out of the way.
 */
export function QuestStatusSection({
  heading,
  quests,
  collapsible = false,
}: QuestStatusSectionProps) {
  if (collapsible) {
    return <CollapsibleQuestSection heading={heading} quests={quests} />
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium text-muted-foreground">{heading}</h2>
      <QuestList quests={quests} />
    </section>
  )
}

function CollapsibleQuestSection({
  heading,
  quests,
}: {
  heading: string
  quests: Quest[]
}) {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  return (
    <section className="space-y-3">
      <h2>
        <Button
          type="button"
          variant="ghost"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="min-h-11 gap-2 px-2 text-sm font-medium text-muted-foreground"
        >
          <ChevronRight
            aria-hidden="true"
            className={cn('transition-transform', open && 'rotate-90')}
          />
          {heading}
        </Button>
      </h2>
      <div id={panelId} hidden={!open}>
        <QuestList quests={quests} />
      </div>
    </section>
  )
}
