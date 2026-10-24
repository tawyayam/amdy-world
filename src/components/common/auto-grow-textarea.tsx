// A textarea for user-written text that grows with its content. By default
// Enter submits and Shift+Enter adds a line, matching the one-line feel of quick
// capture. With `submitOnEnter={false}` (the quest description) Enter adds a new
// line and the caller submits with a button. `maxRows` caps the growth, after
// which the field scrolls instead. `dir="auto"` keeps Arabic and mixed text right.

import { useLayoutEffect, useRef, type KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'

interface AutoGrowTextareaProps {
  id?: string
  value: string
  onChange: (value: string) => void
  /** Called when Enter is pressed without Shift, when `submitOnEnter` is on. */
  onSubmit?: () => void
  /** When false, Enter inserts a newline rather than submitting. Default true. */
  submitOnEnter?: boolean
  /** Never shorter than this many lines; grows up to `maxRows`, then scrolls. */
  minRows?: number
  /** Grow up to this many lines, then scroll. Unlimited when omitted. */
  maxRows?: number
  placeholder?: string
  autoFocus?: boolean
  invalid?: boolean
  className?: string
}

/** Height that fits the given number of lines plus the field's vertical padding. */
function heightFor(element: HTMLTextAreaElement, rows: number): number {
  const styles = window.getComputedStyle(element)
  const lineHeight = Number.parseFloat(styles.lineHeight)
  const padding =
    Number.parseFloat(styles.paddingTop) +
    Number.parseFloat(styles.paddingBottom)
  // Fall back to a sane line height if `line-height` computes to `normal`.
  const rowHeight = Number.isFinite(lineHeight) ? lineHeight : 20
  return rowHeight * rows + padding
}

/** Auto-growing text field for user content. */
export function AutoGrowTextarea({
  id,
  value,
  onChange,
  onSubmit,
  submitOnEnter = true,
  minRows,
  maxRows,
  placeholder,
  autoFocus,
  invalid,
  className,
}: AutoGrowTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    element.style.height = 'auto'
    const limit = maxRows ? heightFor(element, maxRows) : Infinity
    const floor = minRows ? heightFor(element, minRows) : 0
    const grown = Math.max(Math.min(element.scrollHeight, limit), floor)
    element.style.height = `${grown}px`
    element.style.overflowY = element.scrollHeight > limit ? 'auto' : 'hidden'
  }, [value, minRows, maxRows])

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!submitOnEnter) return
    if (event.key !== 'Enter' || event.shiftKey) return
    if (event.nativeEvent.isComposing) return
    event.preventDefault()
    onSubmit?.()
  }

  return (
    <textarea
      id={id}
      ref={ref}
      dir="auto"
      rows={minRows ?? 1}
      value={value}
      placeholder={placeholder}
      autoFocus={autoFocus}
      aria-invalid={invalid}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={handleKeyDown}
      className={cn(
        'min-h-11 w-full min-w-0 resize-none rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
        className,
      )}
    />
  )
}
