import { ProfileCard } from '@/components/settings/profile-card'
import { BackupCard } from '@/components/settings/backup-card'
import { SampleDataCard } from '@/components/settings/sample-data-card'
import { DangerZoneCard } from '@/components/settings/danger-zone-card'

/**
 * Settings screen. Below `lg` it is a single column in the order Profile,
 * Backup, Sample data, Danger zone; from `lg` it becomes two columns (Profile
 * then Sample data on the left, Backup on the right) with the Danger zone
 * spanning the full width at the bottom. The DOM order stays the mobile order,
 * so keyboard and screen-reader order is logical at every width; the desktop
 * columns are set with explicit grid placement.
 */
export function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-start">
      <div className="lg:col-start-1 lg:row-start-1">
        <ProfileCard />
      </div>
      <div className="lg:col-start-2 lg:row-start-1 lg:row-span-2">
        <BackupCard />
      </div>
      <div className="lg:col-start-1 lg:row-start-2">
        <SampleDataCard />
      </div>
      <div className="lg:col-span-2 lg:row-start-3">
        <DangerZoneCard />
      </div>
    </div>
  )
}
