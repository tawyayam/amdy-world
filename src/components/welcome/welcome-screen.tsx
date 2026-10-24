import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Upload, Sparkles, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ImportConfirmDialog } from '@/components/settings/import-confirm-dialog'
import { useAppData } from '@/hooks/use-app-data'
import { useBackupImport } from '@/hooks/use-backup-import'
import { validateCharacterName } from '@/lib/character-name'
import { CHARACTER_NAME_MAX_LENGTH } from '@/lib/schema'
import { BRAND, DEFAULT_CHARACTER_NAME, WELCOME_COPY } from '@/lib/copy'

/**
 * The one screen a brand-new install sees before the app shell: it asks for a
 * name and offers three ways in. It replaces the whole layout, so nothing else
 * renders until a choice is made. The name input is focused on mount and its
 * error is announced, so the flow works with keyboard and screen reader alone.
 */
export function WelcomeScreen() {
  const { settings, startFresh, startWithSampleData, finishOnboarding } =
    useAppData()
  const [name, setName] = useState(
    settings.characterName === DEFAULT_CHARACTER_NAME
      ? ''
      : settings.characterName,
  )
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<'fresh' | 'sample' | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { fileInput, pending, handleFileChange, importing, confirm, cancel } =
    useBackupImport(finishOnboarding)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Validates the field and either returns the trimmed name or shows the error.
  // Every way in needs a name, so this is shared by "start fresh", "try sample
  // data", and (indirectly) the import path stays independent.
  function requireName(): string | null {
    const result = validateCharacterName(name)
    if (result.ok) {
      setError(null)
      return result.value
    }
    setError(
      result.reason === 'empty'
        ? WELCOME_COPY.nameRequired
        : WELCOME_COPY.nameTooLong,
    )
    return null
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const value = requireName()
    if (value === null) return
    setBusy('fresh')
    try {
      await startFresh(value)
    } catch {
      setError(WELCOME_COPY.actionFailed)
      setBusy(null)
    }
  }

  const handleTrySample = async () => {
    const value = requireName()
    if (value === null) return
    setBusy('sample')
    try {
      await startWithSampleData(value)
    } catch {
      setError(WELCOME_COPY.actionFailed)
      setBusy(null)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-3">
            <p className="text-xl font-extrabold tracking-tight">
              <span className="text-foreground">{BRAND.name}</span>
              <span className="text-primary">{BRAND.suffix}</span>
            </p>
            <h1 className="text-2xl font-semibold">{WELCOME_COPY.title}</h1>
            <p className="text-sm text-muted-foreground">
              {WELCOME_COPY.intro}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label
                htmlFor="welcome-name"
                className="block text-xs text-muted-foreground"
              >
                {WELCOME_COPY.nameLabel}
              </label>
              <Input
                id="welcome-name"
                ref={inputRef}
                dir="auto"
                value={name}
                maxLength={CHARACTER_NAME_MAX_LENGTH}
                placeholder={WELCOME_COPY.namePlaceholder}
                autoComplete="off"
                aria-invalid={error ? true : undefined}
                onChange={(event) => setName(event.target.value)}
                className="min-h-11"
              />
            </div>

            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                className="min-h-11"
                disabled={busy !== null}
              >
                <Rocket className="size-4" aria-hidden="true" />
                {WELCOME_COPY.startFresh}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                disabled={busy !== null}
                onClick={() => {
                  void handleTrySample()
                }}
              >
                <Sparkles className="size-4" aria-hidden="true" />
                {WELCOME_COPY.trySampleData}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                aria-describedby="welcome-import-hint"
                disabled={busy !== null}
                onClick={() => fileInput.current?.click()}
              >
                <Upload className="size-4" aria-hidden="true" />
                {WELCOME_COPY.importBackup}
              </Button>
              <input
                ref={fileInput}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(event) => {
                  void handleFileChange(event)
                }}
              />
              <p
                id="welcome-import-hint"
                className="text-xs text-muted-foreground"
              >
                {WELCOME_COPY.importHint}
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      {pending ? (
        <ImportConfirmDialog
          snapshot={pending}
          importing={importing}
          onConfirm={confirm}
          onClose={cancel}
        />
      ) : null}
    </div>
  )
}
