import { AppShell } from '@/components/layout/AppShell'
import { useEffect } from 'react'
import { useThemeStore } from '@/stores/useThemeStore'

/**
 * Root application component.
 * Initializes theme on mount and renders the app shell.
 */
export default function App() {
  const theme = useThemeStore((s) => s.theme)

  // Apply theme class on mount and changes
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  return <AppShell />
}
