import { RANK_COPY } from '@/lib/copy'
import type { RankLadderEntry, RankState } from '@/lib/ranks'
import { cn } from '@/lib/utils'

const STATE_CLASS: Record<RankState, string> = {
  earlier: 'border-transparent text-muted-foreground/60',
  current: 'border-primary/60 bg-primary/15 font-medium text-primary',
  next: 'border-primary/40 text-foreground',
  later: 'border-dashed border-border text-muted-foreground',
}

interface RankLadderProps {
  /** Used in the list's accessible name, e.g. "Programming ranks". */
  skillName: string
  ranks: RankLadderEntry[]
}

/** The five rank names as chips, with the current one marked for assistive tech. */
export function RankLadder({ skillName, ranks }: RankLadderProps) {
  return (
    <ol
      aria-label={RANK_COPY.ladderLabel(skillName)}
      className="flex flex-wrap gap-1.5"
    >
      {ranks.map((rank) => (
        <li
          key={rank.level}
          aria-current={rank.state === 'current' ? 'step' : undefined}
          className={cn(
            'rounded-full border px-2 py-0.5 text-xs',
            STATE_CLASS[rank.state],
          )}
        >
          {rank.name}
        </li>
      ))}
    </ol>
  )
}
