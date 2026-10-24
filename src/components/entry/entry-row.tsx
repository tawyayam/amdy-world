import { NotebookPen } from 'lucide-react'
import type { ReactNode } from 'react'
import { UserText } from '@/components/common/user-text'
import { EntryText } from '@/components/entry/entry-text'
import { entryDetailSegments } from '@/lib/entries'
import { formatTime } from '@/lib/format'
import { SKILL_BY_ID } from '@/lib/skills'
import type { Entry } from '@/lib/types'

interface EntryRowProps {
  entry: Entry
  /** Optional trailing control, such as the edit/delete menu. */
  actions?: ReactNode
}

/** One log entry in the timeline list: a skill-tinted icon, text, and detail. */
export function EntryRow({ entry, actions }: EntryRowProps) {
  const skill = entry.skillId ? SKILL_BY_ID[entry.skillId] : null
  const Icon = skill?.icon ?? NotebookPen
  const color = skill?.color ?? 'var(--muted-foreground)'
  const segments = entryDetailSegments(entry)

  return (
    <li className="flex items-start gap-3 py-2">
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary">
        <Icon aria-hidden className="size-4" style={{ color }} />
      </span>
      <div className="min-w-0 flex-1">
        <EntryText text={entry.text} />
        <p
          className="mt-0.5 overflow-hidden text-xs text-muted-foreground"
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
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </li>
  )
}
