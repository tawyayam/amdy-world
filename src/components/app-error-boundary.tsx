// Catches render crashes anywhere below so a broken screen never shows a blank
// page. The fallback keeps the storage adapter reachable and offers an
// emergency backup download before the user retries or reloads.

import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Download } from 'lucide-react'
import { AppStateScreen } from '@/components/app-state-screen'
import { Button } from '@/components/ui/button'
import { APP_STATE_COPY } from '@/lib/copy'
import { downloadTextFile } from '@/lib/download'
import { createEmergencyBackup } from '@/lib/error-recovery'
import { nowIso, storage } from '@/lib/storage'

interface AppErrorBoundaryProps {
  children: ReactNode
}

interface AppErrorBoundaryState {
  hasError: boolean
  backupStatus: 'idle' | 'working' | 'done' | 'failed'
}

function backupNote(
  status: AppErrorBoundaryState['backupStatus'],
): string | undefined {
  switch (status) {
    case 'working':
      return APP_STATE_COPY.backupWorking
    case 'done':
      return APP_STATE_COPY.backupDownloaded
    case 'failed':
      return APP_STATE_COPY.backupFailed
    case 'idle':
      return undefined
  }
}

/**
 * Root-level error boundary. Retry remounts the subtree; the backup button
 * exports the current data through the emergency (read-only) path.
 */
export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false, backupStatus: 'idle' }

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true, backupStatus: 'idle' }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Keep the one console call: a crash has no other channel to report to.
    console.error(
      'App error boundary caught a crash:',
      error,
      info.componentStack,
    )
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, backupStatus: 'idle' })
  }

  private handleDownloadBackup = (): void => {
    this.setState({ backupStatus: 'working' })
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    createEmergencyBackup(storage, nowIso(), timeZone)
      .then((backup) => {
        downloadTextFile(backup.fileName, backup.contents)
        this.setState({ backupStatus: 'done' })
      })
      .catch(() => {
        this.setState({ backupStatus: 'failed' })
      })
  }

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children
    }
    return (
      <AppStateScreen
        variant="error"
        title={APP_STATE_COPY.unsupportedTitle}
        body={APP_STATE_COPY.crashBody}
        note={backupNote(this.state.backupStatus)}
        onRetry={this.handleRetry}
        secondaryAction={
          <Button
            variant="outline"
            onClick={this.handleDownloadBackup}
            disabled={this.state.backupStatus === 'working'}
          >
            <Download aria-hidden />
            {APP_STATE_COPY.downloadBackup}
          </Button>
        }
      />
    )
  }
}
