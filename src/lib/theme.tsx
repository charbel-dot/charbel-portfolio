import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ThemeContext, type Theme } from './theme-context'

const systemDark = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches

function stored(): Theme | null {
  try {
    const q = new URLSearchParams(location.search).get('theme')
    if (q === 'dark' || q === 'light') return q
    const v = localStorage.getItem('theme')
    return v === 'dark' || v === 'light' ? v : null
  } catch {
    return null
  }
}

/** Follows the system until the visitor picks; their pick is remembered. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [choice, setChoice] = useState<Theme | null>(stored)
  const [sys, setSys] = useState<Theme>(() => (systemDark() ? 'dark' : 'light'))
  const theme = choice ?? sys

  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const on = () => setSys(mq.matches ? 'dark' : 'light')
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme
    root.style.colorScheme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#141514' : '#ffffff')
  }, [theme])

  const toggle = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setChoice(next)
    try {
      localStorage.setItem('theme', next)
    } catch {
      /* not remembered in private mode */
    }
  }, [theme])

  const value = useMemo(() => ({ theme, toggle }), [theme, toggle])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

