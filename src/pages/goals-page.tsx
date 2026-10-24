import { useState } from 'react'
import { Plus } from 'lucide-react'
import { RecentDays } from '@/components/goals/recent-days'
import { TemplateFormDialog } from '@/components/goals/template-form-dialog'
import { TemplateRow } from '@/components/goals/template-row'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAppData } from '@/hooks/use-app-data'
import { GOALS_COPY } from '@/lib/copy'
import type { GoalTemplateInput } from '@/hooks/app-data-context'

/** Manage screen for recurring goals: add, edit, pause, and delete templates. */
export function GoalsPage() {
  const { templates, createTemplate } = useAppData()
  const [creating, setCreating] = useState(false)

  const handleCreate = async (input: GoalTemplateInput): Promise<void> => {
    await createTemplate(input)
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {GOALS_COPY.templatesTitle}
          </h1>
          <p className="text-sm text-muted-foreground">
            {GOALS_COPY.templatesIntro}
          </p>
        </div>
        <Button type="button" onClick={() => setCreating(true)}>
          <Plus />
          {GOALS_COPY.newTemplate}
        </Button>
      </header>

      {templates.length === 0 ? (
        <p className="text-muted-foreground">{GOALS_COPY.templatesEmpty}</p>
      ) : (
        <Card>
          <CardContent>
            <ul className="divide-y divide-border">
              {templates.map((template) => (
                <TemplateRow key={template.id} template={template} />
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <RecentDays />

      {creating ? (
        <TemplateFormDialog
          title={GOALS_COPY.createTemplateTitle}
          submitLabel={GOALS_COPY.newTemplate}
          onSubmit={handleCreate}
          onClose={() => setCreating(false)}
        />
      ) : null}
    </div>
  )
}
