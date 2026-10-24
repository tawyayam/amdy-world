import { useState, type ReactNode } from 'react'
import { Tags } from 'lucide-react'
import { FormDialog } from '@/components/common/form-dialog'
import { Button } from '@/components/ui/button'
import { TAGS_COPY } from '@/lib/copy'
import { TagsManager } from './tags-manager'

interface ManageTagsDialogProps {
  /** Custom trigger; defaults to the "Manage tags" button. */
  trigger?: ReactNode
}

/** Opens the global tag list in a dialog, from a button or a custom trigger. */
export function ManageTagsDialog({ trigger }: ManageTagsDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        trigger ?? (
          <Button type="button" variant="outline" className="h-11">
            <Tags />
            {TAGS_COPY.manageButton}
          </Button>
        )
      }
      title={TAGS_COPY.manageTitle}
      description={TAGS_COPY.manageBody}
    >
      <TagsManager />
    </FormDialog>
  )
}
