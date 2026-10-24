import { ManageTagsDialog } from '@/components/tags/manage-tags-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppData } from '@/hooks/use-app-data'
import { QUEST_COPY } from '@/lib/copy'
import { SKILLS } from '@/lib/skills'
import type { QuestFilters } from '@/lib/quests'
import type { QuestStatus } from '@/lib/types'

interface QuestFiltersBarProps {
  value: QuestFilters
  onChange: (next: QuestFilters) => void
}

const STATUS_OPTIONS: readonly { value: QuestStatus; label: string }[] = [
  { value: 'active', label: QUEST_COPY.statusActive },
  { value: 'paused', label: QUEST_COPY.statusPaused },
  { value: 'done', label: QUEST_COPY.statusDone },
]

/** Status, skill, and tag filters for the Quests list, plus tag management. */
export function QuestFiltersBar({ value, onChange }: QuestFiltersBarProps) {
  const { tags } = useAppData()

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <label
            htmlFor="quest-filter-status"
            className="text-xs text-muted-foreground"
          >
            {QUEST_COPY.filterStatusLabel}
          </label>
          <Select
            value={value.status}
            onValueChange={(status) =>
              onChange({ ...value, status: status as QuestStatus | 'all' })
            }
          >
            <SelectTrigger id="quest-filter-status" className="min-h-11 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{QUEST_COPY.allStatuses}</SelectItem>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="quest-filter-skill"
            className="text-xs text-muted-foreground"
          >
            {QUEST_COPY.filterSkillLabel}
          </label>
          <Select
            value={value.skillId}
            onValueChange={(skillId) =>
              onChange({
                ...value,
                skillId: skillId as QuestFilters['skillId'],
              })
            }
          >
            <SelectTrigger id="quest-filter-skill" className="min-h-11 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{QUEST_COPY.allSkills}</SelectItem>
              {SKILLS.map((skill) => (
                <SelectItem key={skill.id} value={skill.id}>
                  {skill.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="quest-filter-tag"
            className="text-xs text-muted-foreground"
          >
            {QUEST_COPY.filterTagLabel}
          </label>
          <Select
            value={value.tagId}
            onValueChange={(tagId) => onChange({ ...value, tagId })}
          >
            <SelectTrigger id="quest-filter-tag" className="min-h-11 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{QUEST_COPY.allTags}</SelectItem>
              {tags.map((tag) => (
                <SelectItem key={tag.id} value={tag.id} dir="auto">
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ManageTagsDialog />
    </div>
  )
}
