import type { ReactNode } from 'react'
import { Loader2, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { APP_STATE_COPY } from '@/lib/copy'

interface AppStateScreenProps {
  variant: 'loading' | 'error'
  title: string
  body?: string
  onRetry?: () => void
  /** Extra button beside the retry button, e.g. the crash screen's backup. */
  secondaryAction?: ReactNode
  /** Short status line under the buttons, e.g. backup progress. */
  note?: string
}

/**
 * Full-screen state shown when the app cannot render its screens yet: while data
 * loads, or when storage is unavailable. Announced to assistive tech.
 */
export function AppStateScreen({
  variant,
  title,
  body,
  onRetry,
  secondaryAction,
  note,
}: AppStateScreenProps) {
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center"
    >
      {variant === 'error' ? (
        <TriangleAlert aria-hidden className="size-8 text-destructive" />
      ) : (
        <Loader2 aria-hidden className="size-8 animate-spin text-primary" />
      )}
      <div className="max-w-md space-y-1">
        <h1 className="text-xl font-semibold">{title}</h1>
        {body ? <p className="text-muted-foreground">{body}</p> : null}
      </div>
      {onRetry || secondaryAction ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {onRetry ? (
            <Button onClick={onRetry}>{APP_STATE_COPY.retry}</Button>
          ) : null}
          {secondaryAction}
        </div>
      ) : null}
      {note ? (
        <p role="status" className="max-w-md text-sm text-muted-foreground">
          {note}
        </p>
      ) : null}
    </div>
  )
}
