import { EntryRow } from '@/components/entry/entry-row'
import { LevelCircle } from '@/components/progress/level-circle'
import { XpBar } from '@/components/progress/xp-bar'
import { RankLadder } from '@/components/skills/rank-ladder'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { NEXT_UP_COPY, RANK_COPY, SKILLS_COPY } from '@/lib/copy'
import { nextUp, type NextUpEquivalent } from '@/lib/next-up'
import { nextRank, rankForLevel, rankLadder } from '@/lib/ranks'
import type { Progress } from '@/lib/progress'
import type { Skill } from '@/lib/skills'
import type { Entry } from '@/lib/types'

interface SkillCardProps {
  skill: Skill
  progress: Progress
  recentEntries: Entry[]
}

function equivalentText(equivalent: NextUpEquivalent): string {
  switch (equivalent.kind) {
    case 'questSteps':
      return NEXT_UP_COPY.questSteps(equivalent.amount)
    case 'codingHours':
      return NEXT_UP_COPY.codingHours(equivalent.amount)
    case 'pages':
      return NEXT_UP_COPY.pages(equivalent.amount)
    case 'learnedNotes':
      return NEXT_UP_COPY.learnedNotes(equivalent.amount)
    case 'ideas':
      return NEXT_UP_COPY.ideas(equivalent.amount)
  }
}

/**
 * One skill: level, rank, XP bar, what the next level takes in plain actions,
 * and its place on the rank ladder.
 */
export function SkillCard({ skill, progress, recentEntries }: SkillCardProps) {
  const Icon = skill.icon
  const level = progress.skillLevels[skill.id]
  const rank = rankForLevel(skill.id, level.level)
  const upcoming = nextRank(skill.id, level.level)
  const upcomingXp = nextUp(skill.id, progress)
  const levelLabel = `${skill.name}, ${SKILLS_COPY.levelLabel(level.level)}, ${rank.name}`

  return (
    <Card>
      <CardHeader className="justify-between gap-4">
        <div className="flex items-center gap-3">
          <LevelCircle level={level.level} label={levelLabel} size="md" />
          <div>
            <h2 className="flex items-center gap-2 leading-none font-semibold">
              <Icon
                aria-hidden
                className="size-4"
                style={{ color: skill.color }}
              />
              {skill.name}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {SKILLS_COPY.levelLabel(level.level)} ·{' '}
              <span className="font-medium text-foreground">{rank.name}</span> ·{' '}
              {level.xpIntoLevel}/{level.xpForLevel} XP
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <XpBar
          value={level.xpIntoLevel}
          max={level.xpForLevel}
          color={skill.color}
          label={`${skill.name}: ${level.xpIntoLevel} / ${level.xpForLevel}`}
        />

        <div className="space-y-1 rounded-md border border-border/70 bg-muted/30 p-3">
          <p className="text-xs font-medium">
            {NEXT_UP_COPY.xpToLevel(
              upcomingXp.xpRemaining,
              upcomingXp.nextLevel,
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {NEXT_UP_COPY.about(upcomingXp.equivalents.map(equivalentText))}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {upcoming
              ? RANK_COPY.nextRankAway(
                  upcoming.name,
                  upcoming.level,
                  upcoming.levelsAway,
                )
              : RANK_COPY.topRankReached}
          </p>
          <RankLadder
            skillName={skill.name}
            ranks={rankLadder(skill.id, level.level)}
          />
        </div>

        {recentEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {SKILLS_COPY.recentEmpty}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {recentEntries.map((entry) => (
              <EntryRow key={entry.id} entry={entry} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
