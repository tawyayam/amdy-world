import {
  BookOpen,
  Code2,
  GraduationCap,
  Lightbulb,
  type LucideIcon,
} from 'lucide-react'
import { SKILL_NAMES } from '@/lib/copy'

export type SkillId = keyof typeof SKILL_NAMES

export interface Skill {
  id: SkillId
  name: string
  icon: LucideIcon
  /** CSS color, defined as a theme token in src/index.css. */
  color: string
}

export const SKILLS: readonly Skill[] = [
  {
    id: 'programming',
    name: SKILL_NAMES.programming,
    icon: Code2,
    color: 'var(--skill-programming)',
  },
  {
    id: 'reading',
    name: SKILL_NAMES.reading,
    icon: BookOpen,
    color: 'var(--skill-reading)',
  },
  {
    id: 'learning',
    name: SKILL_NAMES.learning,
    icon: GraduationCap,
    color: 'var(--skill-learning)',
  },
  {
    id: 'ideas',
    name: SKILL_NAMES.ideas,
    icon: Lightbulb,
    color: 'var(--skill-ideas)',
  },
]

export const SKILL_BY_ID = SKILLS.reduce(
  (skillsById, skill) => {
    skillsById[skill.id] = skill
    return skillsById
  },
  {} as Record<SkillId, Skill>,
)
