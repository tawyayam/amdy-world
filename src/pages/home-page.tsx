import { QuickCapture } from '@/components/capture/quick-capture'
import { TodayGoalsCard } from '@/components/goals/today-goals-card'
import { ActiveQuests } from '@/components/home/active-quests'
import { CharacterCard } from '@/components/home/character-card'
import { TodayEntries } from '@/components/home/today-entries'
import { useAppData } from '@/hooks/use-app-data'
import { greetingForHour } from '@/lib/copy'
import { formatLongDate } from '@/lib/format'

/** The Today screen: your character, a fast capture, today's logs, active quests. */
export function HomePage() {
  const { settings, progress, entries, quests, todayKey, timeZone, hour, now } =
    useAppData()

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-sm text-muted-foreground">{formatLongDate(now)}</p>
        <h1 dir="auto" className="text-2xl font-semibold tracking-tight">
          {greetingForHour(hour)}, {settings.characterName}
        </h1>
      </header>

      {/* One column on mobile, in this order: character, capture, goals, logs,
       * quests. At lg the same DOM stays put (so keyboard and screen readers
       * keep the mobile reading order) and explicit grid placement moves each
       * card into two columns: character/capture/logs on the left, goals/quests
       * on the right. */}
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="lg:col-start-1 lg:row-start-1">
          <CharacterCard
            name={settings.characterName}
            streak={progress.streak}
            progress={progress}
          />
        </div>

        <div className="lg:col-start-1 lg:row-start-2">
          <QuickCapture />
        </div>

        <div className="lg:col-start-2 lg:row-start-1">
          <TodayGoalsCard />
        </div>

        <div className="lg:col-start-1 lg:row-start-3">
          <TodayEntries
            entries={entries}
            todayKey={todayKey}
            timeZone={timeZone}
          />
        </div>

        <div className="lg:col-start-2 lg:row-start-2">
          <ActiveQuests quests={quests} />
        </div>
      </div>
    </div>
  )
}
