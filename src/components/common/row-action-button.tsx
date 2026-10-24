import type { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type RowActionButtonProps = ComponentProps<typeof Button>

/**
 * The icon button used for per-row actions (kebab menus, edit, delete). It keeps
 * the icon compact while giving the button a 44px tap target, so rows stay the
 * same height but remain comfortably tappable on a phone.
 */
export function RowActionButton({ className, ...props }: RowActionButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn('size-11', className)}
      {...props}
    />
  )
}
