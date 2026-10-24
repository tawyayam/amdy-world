import { cn } from '@/lib/utils'

interface LevelCircleProps {
  level: number
  /** Accessible description, for example "Programming, level 3". */
  label: string
  size?: 'md' | 'lg'
  className?: string
}

/** The gold badge that shows a level number, used for the character and skills. */
export function LevelCircle({
  level,
  label,
  size = 'lg',
  className,
}: LevelCircleProps) {
  return (
    <span
      role="img"
      aria-label={label}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground ring-2 ring-primary/30',
        size === 'lg' ? 'size-14 text-xl' : 'size-9 text-sm',
        className,
      )}
    >
      {level}
    </span>
  )
}
