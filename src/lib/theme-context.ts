import { createContext, useContext } from 'react'

export type Theme = 'light' | 'dark'
type Ctx = { theme: Theme; toggle: () => void }
export const ThemeContext = createContext<Ctx | null>(null)

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme outside ThemeProvider')
  return ctx
}
