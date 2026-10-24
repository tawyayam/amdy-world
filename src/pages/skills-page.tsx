import { SkillCard } from '@/components/skills/skill-card'
import { useAppData } from '@/hooks/use-app-data'
import { NAV_LABELS, SKILLS_COPY } from '@/lib/copy'
import { recentEntriesForSkill } from '@/lib/entries'
import { SKILLS } from '@/lib/skills'

const RECENT_LIMIT = 3

/** One card per skill with its level, XP bar, and latest activity. */
export function SkillsPage() {
  const { entries, progress } = useAppData()

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {NAV_LABELS.skills}
        </h1>
        <p className="text-sm text-muted-foreground">{SKILLS_COPY.empty}</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {SKILLS.map((skill) => (
          <SkillCard
            key={skill.id}
            skill={skill}
            progress={progress}
            recentEntries={recentEntriesForSkill(
              entries,
              skill.id,
              RECENT_LIMIT,
            )}
          />
        ))}
      </div>
    </div>
  )
}
