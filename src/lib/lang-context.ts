import { createContext, useContext } from 'react'
import type { Copy, Lang } from '../content'

type Ctx = { lang: Lang; t: Copy; toggle: () => void }
export const LangContext = createContext<Ctx | null>(null)

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang outside LangProvider')
  return ctx
}
