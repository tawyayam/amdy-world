import { TagChip } from '@/components/tags/tag-chip'
import { useAppData } from '@/hooks/use-app-data'
import { SKILL_BY_ID } from '@/lib/skills'
import { tagsForQuest } from '@/lib/tags'
import type { Quest } from '@/lib/types'

/** A quest's skill (tinted icon + name) and its tag chips. */
export function QuestMeta({ quest }: { quest: Quest }) {
  const { tags } = useAppData()
  const skill = SKILL_BY_ID[quest.skillId]
  const SkillIcon = skill.icon
  const questTags = tagsForQuest(quest.tagIds, tags)

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <SkillIcon
          aria-hidden="true"
          className="size-3.5"
          style={{ color: skill.color }}
        />
        {skill.name}
      </span>
      {questTags.map((tag) => (
        <TagChip key={tag.id} tag={tag} />
      ))}
    </div>
  )
}
