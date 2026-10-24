import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface UserTextProps {
  children: ReactNode
  className?: string
}

/** Renders user-written text with bidi isolation. */
export function UserText({ children, className }: UserTextProps) {
  return (
    <bdi dir="auto" className={cn(className)}>
      {children}
    </bdi>
  )
}
