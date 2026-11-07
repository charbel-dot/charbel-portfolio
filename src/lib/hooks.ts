import { useEffect, useRef, useState } from 'react'

/** The time in Beirut, refreshed every 20 seconds. */
export function useBeirutTime() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 20_000)
    return () => window.clearInterval(id)
  }, [])
  return now
}

const BEIRUT = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Beirut',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

export function beirutParts(d: Date) {
  const parts = BEIRUT.formatToParts(d)
  const h = Number(parts.find((p) => p.type === 'hour')?.value ?? 0)
  const m = Number(parts.find((p) => p.type === 'minute')?.value ?? 0)
  return { h, m, label: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`, hour: h + m / 60 }
}

export type Phase = 'night' | 'dawn' | 'day' | 'dusk'
export function phaseOf(hour: number): Phase {
  if (hour >= 5.5 && hour < 8) return 'dawn'
  if (hour >= 8 && hour < 17.5) return 'day'
  if (hour >= 17.5 && hour < 19.5) return 'dusk'
  return 'night'
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof matchMedia !== 'undefined' ? matchMedia('(prefers-reduced-motion: reduce)').matches : false,
  )
  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

/**
 * Adds `is-in` to the element once it enters the viewport. Children with
 * `data-reveal` rise in, staggered by their `--i`. Content is visible when
 * scripts are off (the hidden state only exists under `html.js`).
 */
export function useReveal<T extends HTMLElement>(threshold = 0.18) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      el.classList.add('is-in')
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add('is-in')
            io.disconnect()
          }
        }
      },
      { threshold, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return ref
}
