import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { COPY, type Copy, type Lang } from '../content'

type Ctx = { lang: Lang; t: Copy; toggle: () => void }
const LangContext = createContext<Ctx | null>(null)

function initialLang(): Lang {
  try {
    const q = new URLSearchParams(location.search).get('lang')
    if (q === 'ar' || q === 'en') return q
  } catch {
    /* ignore */
  }
  return document.documentElement.lang === 'ar' ? 'ar' : 'en'
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang)
  const t = COPY[lang]

  useEffect(() => {
    const root = document.documentElement
    root.lang = lang
    root.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.title = t.meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.meta.description)
    const url = lang === 'ar' ? 'https://charbelnasseh.dev/?lang=ar' : 'https://charbelnasseh.dev/'
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', url)
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', url)
    document.querySelector('meta[property="og:locale"]')?.setAttribute('content', lang === 'ar' ? 'ar_LB' : 'en_US')
    // keep the address shareable in the chosen language
    const u = new URL(location.href)
    if (lang === 'ar') u.searchParams.set('lang', 'ar')
    else u.searchParams.delete('lang')
    if (u.href !== location.href) history.replaceState(history.state, '', u)
    try {
      localStorage.setItem('lang', lang)
    } catch {
      /* private mode: language is simply not remembered */
    }
  }, [lang, t])

  const toggle = useCallback(() => setLang((l) => (l === 'en' ? 'ar' : 'en')), [])
  const value = useMemo(() => ({ lang, t, toggle }), [lang, t, toggle])
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang outside LangProvider')
  return ctx
}
