import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { CardDescription, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAppData } from '@/hooks/use-app-data'
import { validateCharacterName } from '@/lib/character-name'
import { COMMON_COPY, SETTINGS_COPY } from '@/lib/copy'
import { CHARACTER_NAME_MAX_LENGTH } from '@/lib/schema'
import {
  SettingsCard,
  SettingsCardContent,
  SettingsCardHeader,
} from './settings-card'

/** Edits the character name; saving updates the home screen and the nav. */
export function ProfileCard() {
  const { settings, saveSettings } = useAppData()
  const [name, setName] = useState(settings.characterName)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const trimmed = name.trim()
  const changed = trimmed !== settings.characterName

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const result = validateCharacterName(name)
    if (!result.ok) {
      setError(
        result.reason === 'empty'
          ? SETTINGS_COPY.nameRequired
          : SETTINGS_COPY.nameTooLong,
      )
      return
    }
    setSaving(true)
    setError(null)
    try {
      await saveSettings({ ...settings, characterName: result.value })
    } catch {
      setError(COMMON_COPY.actionFailed)
    } finally {
      setSaving(false)
    }
  }

  return (
    <SettingsCard>
      <SettingsCardHeader>
        <CardTitle>{SETTINGS_COPY.profileTitle}</CardTitle>
        <CardDescription>{SETTINGS_COPY.characterNameHelp}</CardDescription>
      </SettingsCardHeader>
      <SettingsCardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="settings-character-name"
              className="text-xs text-muted-foreground block"
            >
              {SETTINGS_COPY.characterNameLabel}
            </label>
            <Input
              id="settings-character-name"
              dir="auto"
              value={name}
              maxLength={CHARACTER_NAME_MAX_LENGTH}
              placeholder={SETTINGS_COPY.characterNamePlaceholder}
              onChange={(event) => setName(event.target.value)}
              className="min-h-11 max-w-md"
              autoComplete="off"
            />
          </div>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <Button type="submit" disabled={saving || !changed}>
            {COMMON_COPY.save}
          </Button>
        </form>
      </SettingsCardContent>
    </SettingsCard>
  )
}
