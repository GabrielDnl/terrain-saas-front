import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type ThemeName = 'sl' | 'sao' | 'emerald'

interface ThemeContextValue {
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
}

const THEME_STORAGE_KEY = 'terrain-saas-theme'

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function getInitialTheme(): ThemeName {
  if (typeof window === 'undefined') return 'emerald'
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'sl' || stored === 'sao' || stored === 'emerald') return stored
  return 'emerald'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const setTheme = (next: ThemeName) => setThemeState(next)

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}

export const THEME_LABELS: Record<ThemeName, string> = {
  sl: 'Système',
  sao: 'Cristal',
  emerald: 'Émeraude',
}

export const THEME_DOT_COLORS: Record<ThemeName, string> = {
  sl: '#38bdf8',
  sao: '#c9a84c',
  emerald: '#1db87a',
}
