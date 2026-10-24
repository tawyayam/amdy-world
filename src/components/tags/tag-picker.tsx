// Multi-select for a quest's tags. It only selects among existing tags; new
// tags are created in the "Manage tags" dialog. A plain checkbox list (not a
// popover) keeps it keyboard- and screen-reader-friendly inside a dialog.

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useAppData } from '@/hooks/use-app-data'
import { TAGS_COPY } from '@/lib/copy'
import { tagColorVar } from '@/lib/tags'
import { ManageTagsDialog } from './manage-tags-dialog'

interface TagPickerProps {
  selectedIds: string[]
  onChange: (tagIds: string[]) => void
  /** Namespaces the field ids so two pickers on screen never collide. */
  idPrefix?: string
}

/** Checkbox list of every live tag; tags are created from "Manage tags". */
export function TagPicker({
  selectedIds,
  onChange,
  idPrefix = 'quest',
}: TagPickerProps) {
  const { tags } = useAppData()

  const toggle = (tagId: string, checked: boolean) => {
    onChange(
      checked
        ? [...selectedIds, tagId]
        : selectedIds.filter((id) => id !== tagId),
    )
  }

  return (
    <fieldset className="space-y-2">
      <legend className="text-xs text-muted-foreground">
        {TAGS_COPY.label}
      </legend>

      {tags.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          {`${TAGS_COPY.pickerEmptyHint} `}
          <ManageTagsDialog
            trigger={
              <Button type="button" variant="link" className="h-auto p-0">
                {TAGS_COPY.manageButton}
              </Button>
            }
          />
        </p>
      ) : (
        <div
          role="group"
          aria-label={TAGS_COPY.label}
          className="max-h-36 space-y-0.5 overflow-y-auto rounded-md border border-input p-1.5"
        >
          {tags.map((tag) => {
            const id = `${idPrefix}-tag-${tag.id}`
            return (
              <div key={tag.id} className="flex min-h-9 items-center gap-2">
                <Checkbox
                  id={id}
                  checked={selectedIds.includes(tag.id)}
                  onCheckedChange={(value) => toggle(tag.id, value === true)}
                />
                <label
                  htmlFor={id}
                  dir="auto"
                  className="flex flex-1 items-center gap-2 text-sm"
                >
                  <span
                    aria-hidden="true"
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: tagColorVar(tag.colorToken) }}
                  />
                  {tag.name}
                </label>
              </div>
            )
          })}
        </div>
      )}
    </fieldset>
  )
}
