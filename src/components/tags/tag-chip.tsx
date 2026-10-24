import { tagColorVar } from '@/lib/tags'
import { UserText } from '@/components/common/user-text'
import type { Tag } from '@/lib/types'

/** A small pill for a tag: a colored dot plus the tag's own (possibly Arabic) name. */
export function TagChip({ tag }: { tag: Tag }) {
  return (
    <span
      dir="auto"
      className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-xs text-foreground"
    >
      <span
        aria-hidden="true"
        className="size-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: tagColorVar(tag.colorToken) }}
      />
      <span className="truncate">
        <UserText>{tag.name}</UserText>
      </span>
    </span>
  )
}
