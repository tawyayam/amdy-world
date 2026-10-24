import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/app-layout'
import { GoalsPage } from '@/pages/goals-page'
import { HomePage } from '@/pages/home-page'
import { QuestDetailPage } from '@/pages/quest-detail-page'
import { QuestsPage } from '@/pages/quests-page'
import { SettingsPage } from '@/pages/settings-page'
import { SkillsPage } from '@/pages/skills-page'
import { TimelinePage } from '@/pages/timeline-page'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'skills', element: <SkillsPage /> },
      { path: 'quests', element: <QuestsPage /> },
      { path: 'quests/:questId', element: <QuestDetailPage /> },
      { path: 'timeline', element: <TimelinePage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'goals', element: <GoalsPage /> },
    ],
  },
])
