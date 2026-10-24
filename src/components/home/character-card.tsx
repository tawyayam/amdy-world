import { Flame } from 'lucide-react'
import { LevelCircle } from '@/components/progress/level-circle'
import { XpBar } from '@/components/progress/xp-bar'
import { Card, CardContent } from '@/components/ui/card'
import { UserText } from '@/components/common/user-text'
import { CHARACTER_COPY, RANK_COPY, SKILLS_COPY } from '@/lib/copy'
import type { Progress } from '@/lib/progress'
import { nextRank, rankForLevel } from '@/lib/ranks'
import { SKILLS } from '@/lib/skills'

interface CharacterCardProps {
  name: string
  streak: number
  progress: Progress
}

/**
 * The RPG header from the mockup: the gold overall level circle beside the name,
 * an overall XP bar under it, then one colored bar per skill.
 */
export function CharacterCard({ name, streak, progress }: CharacterCardProps) {
  const overall = progress.overall
  const rank = rankForLevel('overall', overall.level)
  const upcomingRank = nextRank('overall', overall.level)
  const streakLabel =
    streak === 1 ? CHARACTER_COPY.streakSingular : CHARACTER_COPY.streakPlural

  return (
    <Card>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-4">
          <LevelCircle
            level={overall.level}
            label={`${name}, ${CHARACTER_COPY.levelLabel} ${overall.level}, ${rank.name}`}
          />
          <div className="min-w-0">
            <p dir="auto" className="truncate text-lg font-semibold">
              <UserText>{name}</UserText>
            </p>
            <p className="text-sm font-medium">
              <span className="text-primary">
                {CHARACTER_COPY.levelValue(overall.level)}
              </span>
              <span className="text-muted-foreground"> · {rank.name}</span>
            </p>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Flame aria-hidden className="size-4 text-primary" />
              <span>
                {streak} {streakLabel}
              </span>
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{CHARACTER_COPY.overallXpLabel}</span>
            <span>{CHARACTER_COPY.xpToNextLevel(overall.xpToNextLevel)}</span>
          </div>
          <XpBar
            value={overall.xpIntoLevel}
            max={overall.xpForLevel}
            label={`${CHARACTER_COPY.overallXpLabel}: ${overall.xpIntoLevel} / ${overall.xpForLevel}`}
          />
          <p className="text-xs text-muted-foreground">
            {upcomingRank
              ? RANK_COPY.nextRank(upcomingRank.name, upcomingRank.level)
              : RANK_COPY.topRankReached}
          </p>
        </div>

        <ul className="space-y-3">
          {SKILLS.map((skill) => {
            const level = progress.skillLevels[skill.id]
            const Icon = skill.icon
            return (
              <li key={skill.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Icon
                      aria-hidden
                      className="size-4"
                      style={{ color: skill.color }}
                    />
                    {skill.name}
                  </span>
                  <span className="text-muted-foreground">
                    {SKILLS_COPY.levelLabel(level.level)} · {level.xpIntoLevel}/
                    {level.xpForLevel}
                  </span>
                </div>
                <XpBar
                  value={level.xpIntoLevel}
                  max={level.xpForLevel}
                  color={skill.color}
                  label={`${skill.name}: ${level.xpIntoLevel} / ${level.xpForLevel}`}
                />
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
