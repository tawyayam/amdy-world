import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CounterQuestProgress } from '@/components/quests/counter-quest-progress'
import { JourneyNotes } from '@/components/quests/journey-notes'
import { QuestDeleteDialog } from '@/components/quests/quest-delete-dialog'
import { QuestFormDialog } from '@/components/quests/quest-form-dialog'
import { QuestMeta } from '@/components/quests/quest-meta'
import { QuestStatusControls } from '@/components/quests/quest-status-controls'
import { QuestSteps } from '@/components/quests/quest-steps'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useAppData } from '@/hooks/use-app-data'
import { COMMON_COPY, NAV_LABELS, QUEST_COPY } from '@/lib/copy'
import { counterCurrentValue } from '@/lib/progress'

/**
 * One quest: its status, description, progress (steps or counter), and journey
 * notes, with edit and delete actions.
 */
export function QuestDetailPage() {
  const { questId } = useParams()
  const { quests, updateQuestDetails } = useAppData()
  const [editing, setEditing] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const quest = quests.find((candidate) => candidate.id === questId)

  if (!quest) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          {QUEST_COPY.notFound}
        </h1>
        <Button asChild variant="outline">
          <Link to="/quests">{QUEST_COPY.backToQuests}</Link>
        </Button>
      </section>
    )
  }

  return (
    <div className="space-y-6">
      <Link
        to="/quests"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <ArrowLeft aria-hidden className="size-4" />
        {NAV_LABELS.quests}
      </Link>

      <div className="space-y-3">
        <h1
          dir="auto"
          className="text-2xl font-semibold tracking-tight break-words"
        >
          {quest.title}
        </h1>
        <QuestMeta quest={quest} />
        <QuestStatusControls
          quest={quest}
          onEdit={() => setEditing(true)}
          onDelete={() => setConfirmingDelete(true)}
        />
      </div>

      {quest.description ? (
        <p
          dir="auto"
          className="text-muted-foreground break-words whitespace-pre-line"
        >
          {quest.description}
        </p>
      ) : null}

      {quest.originIdeaId ? (
        <p className="text-xs text-muted-foreground">{QUEST_COPY.originIdea}</p>
      ) : null}

      <Card>
        <CardHeader>
          <h2 className="leading-none font-semibold">
            {quest.counter
              ? QUEST_COPY.counterProgressTitle
              : QUEST_COPY.stepsTitle}
          </h2>
        </CardHeader>
        <CardContent>
          {quest.counter ? (
            <CounterQuestProgress quest={quest} />
          ) : (
            <QuestSteps quest={quest} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="leading-none font-semibold">
            {QUEST_COPY.journeyTitle}
          </h2>
        </CardHeader>
        <CardContent>
          <JourneyNotes quest={quest} />
        </CardContent>
      </Card>

      {editing ? (
        <QuestFormDialog
          title={QUEST_COPY.editTitle}
          submitLabel={COMMON_COPY.save}
          initial={{
            title: quest.title,
            description: quest.description,
            skillId: quest.skillId,
            tagIds: quest.tagIds,
            kind: quest.kind,
            ...(quest.counter
              ? {
                  counter: {
                    unit: quest.counter.unit,
                    total: quest.counter.total,
                    startValue: quest.counter.startValue,
                    sections: quest.counter.sections ?? [],
                  },
                }
              : {}),
          }}
          counterMinValue={
            quest.counter ? counterCurrentValue(quest) : undefined
          }
          onSubmit={(input) => updateQuestDetails(quest.id, input)}
          onClose={() => setEditing(false)}
        />
      ) : null}

      {confirmingDelete ? (
        <QuestDeleteDialog
          quest={quest}
          onClose={() => setConfirmingDelete(false)}
        />
      ) : null}
    </div>
  )
}
