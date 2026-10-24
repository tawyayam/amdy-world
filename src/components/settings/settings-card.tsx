// The Settings screen uses a tighter version of the shadcn Card: about `p-5`
// padding and a smaller header-to-content gap, so the many cards fit the
// two-column layout without looking airy. The shadcn defaults are untouched;
// only the Settings cards use these wrappers.

import type { ComponentProps } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/** A Settings card: shadcn Card with tighter padding and header/content gap. */
export function SettingsCard({
  className,
  ...props
}: ComponentProps<typeof Card>) {
  return <Card className={cn('gap-3 py-5', className)} {...props} />
}

/** Header for a `SettingsCard`; matches its `p-5` side padding. */
export function SettingsCardHeader({
  className,
  ...props
}: ComponentProps<typeof CardHeader>) {
  return <CardHeader className={cn('px-5', className)} {...props} />
}

/** Content for a `SettingsCard`; matches its `p-5` side padding. */
export function SettingsCardContent({
  className,
  ...props
}: ComponentProps<typeof CardContent>) {
  return <CardContent className={cn('px-5', className)} {...props} />
}
