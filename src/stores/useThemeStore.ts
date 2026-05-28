import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

/**
 * Theme store — manages dark/light mode with localStorage persistence.
 * Reads system preference on first load.
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
        ? 'dark'
        : 'light',

      setTheme: (theme: Theme) => {
        set({ theme })
        applyThemeToDocument(theme)
      },

      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === 'dark' ? 'light' : 'dark'
          applyThemeToDocument(newTheme)
          return { theme: newTheme }
        })
      },
    }),
    {
      name: 'dsv-theme',
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            applyThemeToDocument(state.theme)
          }
        }
      },
    }
  )
)

function applyThemeToDocument(theme: Theme): void {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}
