import { TemplateMenu } from '@/components/goals/template-menu'
import { Checkbox } from '@/components/ui/checkbox'
import { useAppData } from '@/hooks/use-app-data'
import { GOALS_COPY, weekdaysSummary } from '@/lib/copy'
import { SKILL_BY_ID } from '@/lib/skills'
import type { GoalTemplate } from '@/lib/types'

interface TemplateRowProps {
  template: GoalTemplate
}

/** One recurring goal: its skill, repeat days, an active toggle, and its menu. */
export function TemplateRow({ template }: TemplateRowProps) {
  const { updateTemplate } = useAppData()
  const skill = SKILL_BY_ID[template.skillId]
  const activeId = `template-active-${template.id}`

  const setActive = (active: boolean) => {
    void updateTemplate(template.id, {
      title: template.title,
      skillId: template.skillId,
      days: template.days,
      active,
    })
  }

  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
      <span
        className="size-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: skill.color }}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p dir="auto" className="truncate text-sm font-medium">
          {template.title}
        </p>
        <p className="text-xs text-muted-foreground">
          {skill.name} · {weekdaysSummary(template.days)}
        </p>
      </div>
      <label
        htmlFor={activeId}
        className="flex min-h-11 cursor-pointer items-center gap-2 text-xs text-muted-foreground"
      >
        <Checkbox
          id={activeId}
          checked={template.active}
          onCheckedChange={(value) => setActive(value === true)}
        />
        {GOALS_COPY.activeLabel}
      </label>
      <TemplateMenu template={template} />
    </li>
  )
}
