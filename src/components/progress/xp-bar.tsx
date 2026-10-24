import type { CSSProperties } from 'react'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface XpBarProps {
  /** XP earned inside the current level. */
  value: number
  /** XP needed for the next level. */
  max: number
  /** CSS color for the fill (a theme token). Defaults to the gold accent. */
  color?: string
  label: string
  className?: string
}

/**
 * An XP bar built on shadcn's Progress. The fill turns gold by default and takes
 * a skill color when one is passed, using a CSS variable so no hex is hard-coded.
 */
export function XpBar({ value, max, color, label, className }: XpBarProps) {
  const safeMax = max > 0 ? max : 1
  const percent = Math.min(
    100,
    Math.max(0, Math.round((value / safeMax) * 100)),
  )

  return (
    <Progress
      value={percent}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn(
        'h-2.5',
        color && '[&_[data-slot=progress-indicator]]:bg-[var(--xp-fill)]',
        className,
      )}
      style={color ? ({ '--xp-fill': color } as CSSProperties) : undefined}
    />
  )
}
