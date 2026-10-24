import {
  Home,
  History,
  ScrollText,
  Settings,
  Swords,
  type LucideIcon,
} from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { AppStateScreen } from '@/components/app-state-screen'
import { UserText } from '@/components/common/user-text'
import { Logo } from '@/components/brand/logo'
import { WelcomeScreen } from '@/components/welcome/welcome-screen'
import { useAppData } from '@/hooks/use-app-data'
import {
  APP_STATE_COPY,
  NAV_LABELS,
  PRIMARY_NAV_LABEL,
  SKIP_LINK_LABEL,
} from '@/lib/copy'
import { cn } from '@/lib/utils'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

const NAV_ITEMS: readonly NavItem[] = [
  { to: '/', label: NAV_LABELS.today, icon: Home, end: true },
  { to: '/skills', label: NAV_LABELS.skills, icon: Swords },
  { to: '/quests', label: NAV_LABELS.quests, icon: ScrollText },
  { to: '/timeline', label: NAV_LABELS.timeline, icon: History },
  { to: '/settings', label: NAV_LABELS.settings, icon: Settings },
]

function mobileLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    'flex min-h-11 flex-col items-center justify-center gap-1 px-2 py-2 text-xs',
    'transition-colors focus-visible:outline-2 focus-visible:outline-ring',
    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
  )
}

function desktopLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    'flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium',
    'transition-colors focus-visible:outline-2 focus-visible:outline-ring',
    isActive
      ? 'bg-accent text-foreground'
      : 'text-muted-foreground hover:text-foreground',
  )
}

export function AppLayout() {
  const { status, errorMessage, settings, showWelcome, reload } = useAppData()

  if (status === 'loading') {
    return <AppStateScreen variant="loading" title={APP_STATE_COPY.loading} />
  }

  if (status === 'unavailable' || status === 'error') {
    return (
      <AppStateScreen
        variant="error"
        title={
          status === 'unavailable'
            ? APP_STATE_COPY.errorTitle
            : APP_STATE_COPY.unsupportedTitle
        }
        body={errorMessage ?? APP_STATE_COPY.unsupportedBody}
        onRetry={() => {
          void reload()
        }}
      />
    )
  }

  // A brand-new install sees the welcome screen instead of the shell, so there
  // is nothing to navigate to and no empty screens to stumble into.
  if (showWelcome) {
    return <WelcomeScreen />
  }

  return (
    <div className="flex min-h-svh flex-col md:flex-row">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        {SKIP_LINK_LABEL}
      </a>

      <header className="sticky top-0 z-40 border-b border-border bg-background px-4 py-3 md:hidden">
        <Logo />
      </header>

      <aside className="hidden w-56 shrink-0 flex-col border-r border-border p-4 md:sticky md:top-0 md:flex md:h-svh md:overflow-y-auto">
        <div className="mb-2 px-3 border-b border-border pb-3">
          <Logo />
          <p dir="auto" className="mt-2 truncate text-xs text-muted-foreground">
            <UserText>{settings.characterName}</UserText>
          </p>
        </div>
        <nav
          aria-label={PRIMARY_NAV_LABEL}
          className="flex flex-col gap-1 mt-5"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={desktopLinkClass}
            >
              <item.icon className="size-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main
        id="main-content"
        tabIndex={-1}
        className="min-w-0 flex-1 px-4 pt-6 pb-[calc(7rem_+_env(safe-area-inset-bottom))] focus-visible:outline-none md:px-8 md:pt-8 md:pb-10"
      >
        <div className="w-full max-w-[1200px]">
          <Outlet />
        </div>
      </main>

      <nav
        aria-label={PRIMARY_NAV_LABEL}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background md:hidden"
      >
        <ul className="grid grid-cols-5 pb-[env(safe-area-inset-bottom)]">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} end={item.end} className={mobileLinkClass}>
                <item.icon className="size-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
