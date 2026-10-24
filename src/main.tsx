import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import '@fontsource-variable/inter'
import '@fontsource/ibm-plex-sans-arabic/arabic-400.css'
import '@fontsource/ibm-plex-sans-arabic/arabic-500.css'
import '@fontsource/ibm-plex-sans-arabic/arabic-600.css'
import './index.css'
import { Toaster } from './components/ui/sonner'
import { AppErrorBoundary } from './components/app-error-boundary'
import { AppDataProvider } from './hooks/app-data-provider'
import { router } from './router'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element was not found in the document')
}

createRoot(rootElement).render(
  <StrictMode>
    <AppErrorBoundary>
      <AppDataProvider>
        <RouterProvider router={router} />
        <Toaster />
      </AppDataProvider>
    </AppErrorBoundary>
  </StrictMode>,
)
