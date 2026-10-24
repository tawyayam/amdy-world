import { type FormEvent, type ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface FormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  /** Optional line under the title, in the fixed header. */
  description?: ReactNode
  /** Custom trigger; rendered before the content when provided. */
  trigger?: ReactNode
  /** When set, body and footer are wrapped in a form so submit buttons work. */
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void
  /** Action row; stays visible while the body scrolls. */
  footer?: ReactNode
  /** Extra classes for the panel, e.g. a narrower max width. */
  contentClassName?: string
  /** Scrollable body content. */
  children?: ReactNode
}

/**
 * The one layout every form dialog shares: a fixed header (title plus the
 * close button), a body that scrolls inside the panel, and a footer that is
 * always visible. The panel is capped at the viewport height minus 2rem, so it
 * fits at 360x640, in a short desktop window, and with the keyboard open.
 */
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  trigger,
  onSubmit,
  footer,
  contentClassName,
  children,
}: FormDialogProps) {
  const body =
    children != null ? (
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-1">
        <div className="space-y-5 -mx-1 px-1 py-1">{children}</div>
      </div>
    ) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent
        className={cn(
          'flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden',
          contentClassName,
        )}
      >
        <DialogHeader className="shrink-0 pr-8">
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        {onSubmit ? (
          <form
            onSubmit={onSubmit}
            className="flex min-h-0 flex-1 flex-col gap-4"
          >
            {body}
            <DialogFooter className="shrink-0">{footer}</DialogFooter>
          </form>
        ) : (
          <>
            {body}
            {footer ? (
              <DialogFooter className="shrink-0">{footer}</DialogFooter>
            ) : null}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
