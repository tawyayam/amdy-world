import { NotebookPen } from 'lucide-react'
import type { ReactNode } from 'react'
import { UserText } from '@/components/common/user-text'
import { EntryText } from '@/components/entry/entry-text'
import { Card, CardContent } from '@/components/ui/card'
import { entryDetailSegments } from '@/lib/entries'
import { formatTime } from '@/lib/format'
import { SKILL_BY_ID } from '@/lib/skills'
import type { Entry } from '@/lib/types'

interface EntryCardProps {
  entry: Entry
  /** Optional trailing control, such as the edit/delete menu. */
  actions?: ReactNode
}

/** One log entry as a compact card, for the timeline's grid layout. */
export function EntryCard({ entry, actions }: EntryCardProps) {
  const skill = entry.skillId ? SKILL_BY_ID[entry.skillId] : null
  const Icon = skill?.icon ?? NotebookPen
  const color = skill?.color ?? 'var(--muted-foreground)'
  const segments = entryDetailSegments(entry)

  return (
    <li>
      <Card className="py-3">
        <CardContent className="space-y-2 px-3">
          <div className="flex items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary">
              <Icon aria-hidden className="size-4" style={{ color }} />
            </span>
            <p
              className="min-w-0 flex-1 overflow-hidden text-xs text-muted-foreground"
              dir="ltr"
            >
              {segments.map((segment, index) => (
                <span
                  key={index}
                  className={segment.kind === 'user' ? 'min-w-0' : 'shrink-0'}
                >
                  {index > 0 ? ' · ' : null}
                  {segment.kind === 'user' ? (
                    <UserText className="max-w-full truncate align-baseline">
                      {segment.value}
                    </UserText>
                  ) : (
                    <span className="shrink-0">{segment.value}</span>
                  )}
                </span>
              ))}
              {segments.length > 0 ? ' · ' : ''}
              <span className="shrink-0">{formatTime(entry.createdAt)}</span>
            </p>
            {actions ? <div className="shrink-0">{actions}</div> : null}
          </div>
          <EntryText text={entry.text} />
        </CardContent>
      </Card>
    </li>
  )
}
