// Entry text with a three-line clamp and a keyboard-accessible "Show more".
// Overflow is measured so the toggle only appears when the text is actually
// clipped. Line breaks are preserved and Arabic gets `dir="auto"`.

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ENTRY_COPY } from '@/lib/copy'
import { cn } from '@/lib/utils'

interface EntryTextProps {
  text: string
  className?: string
}

/** Clamped user text that can be expanded in place. */
export function EntryText({ text, className }: EntryTextProps) {
  const paragraphRef = useRef<HTMLParagraphElement>(null)
  const expandedRef = useRef(false)
  const [expanded, setExpanded] = useState(false)
  const [overflowing, setOverflowing] = useState(false)

  useEffect(() => {
    expandedRef.current = expanded
  }, [expanded])

  useEffect(() => {
    const element = paragraphRef.current
    if (!element) return
    const measure = () => {
      // While expanded the clamp is off, so a measurement would always say
      // "fits". Keep the last collapsed result so the toggle does not flicker.
      if (expandedRef.current) return
      setOverflowing(element.scrollHeight > element.clientHeight + 1)
    }
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [text])

  const canToggle = overflowing || expanded

  return (
    <div className="min-w-0">
      <p
        ref={paragraphRef}
        dir="auto"
        className={cn(
          'text-sm break-words whitespace-pre-wrap',
          !expanded && 'line-clamp-3',
          className,
        )}
      >
        {text}
      </p>
      {canToggle ? (
        <Button
          type="button"
          variant="link"
          size="xs"
          className="h-auto min-h-11 px-0 text-xs"
          aria-expanded={expanded}
          onClick={() => setExpanded((previous) => !previous)}
        >
          {expanded ? ENTRY_COPY.showLess : ENTRY_COPY.showMore}
        </Button>
      ) : null}
    </div>
  )
}
