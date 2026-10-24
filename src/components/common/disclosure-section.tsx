import { type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DisclosureSectionProps {
  open: boolean
  onToggle: () => void
  label: string
  /** Prefixes the panel id so two disclosures on a page never collide. */
  idBase: string
  children: ReactNode
}

/**
 * A collapsible form section: a button with `aria-expanded` and a panel that
 * stays in the DOM (hidden when collapsed) so the controls keep their ids.
 */
export function DisclosureSection({
  open,
  onToggle,
  label,
  idBase,
  children,
}: DisclosureSectionProps) {
  const panelId = `${idBase}-disclosure-panel`
  const buttonId = `${idBase}-disclosure-button`

  return (
    <div>
      <button
        type="button"
        id={buttonId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex min-h-11 w-full items-center justify-between gap-2 rounded-md border border-border px-3 text-sm font-medium transition-colors hover:bg-accent outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {label}
        <ChevronDown
          aria-hidden
          className={cn('size-4 transition-transform', open && 'rotate-180')}
        />
      </button>
      <div id={panelId} hidden={!open} className="space-y-4 pt-4">
        {children}
      </div>
    </div>
  )
}
