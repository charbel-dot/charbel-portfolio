import { useCallback, useEffect, useRef, useState } from 'react'
import { useLang } from '../lib/lang-context'
import { beirutParts, phaseOf, useBeirutTime, usePrefersReducedMotion } from '../lib/hooks'
import { useTheme } from '../lib/theme-context'
import type { DeskScene } from '../scene/desk'
import { CARD_SPOTS, isCardSpot, type CardSpot, type SpotId } from '../scene/hotspots'
import Terminal from './Terminal'
import RoomCard from './RoomCard'

/** Dev only: ?poster renders the bare room so posters can be captured. */
const POSTER_MODE = import.meta.env.DEV && new URLSearchParams(location.search).has('poster')
if (POSTER_MODE) document.documentElement.classList.add('poster-mode')

const LIST: (CardSpot | 'monitor')[] = ['monitor', ...CARD_SPOTS]

type Tip = { id: SpotId; x: number; y: number } | null

export default function Hero() {
  const { t, lang } = useLang()
  const stageRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<DeskScene | null>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [selected, setSelected] = useState<SpotId | null>(null)
  const [tip, setTip] = useState<Tip>(null)
  const reduced = usePrefersReducedMotion()
  const { theme } = useTheme()
  const themeRef = useRef(theme)
  const returnFocus = useRef<HTMLElement | null>(null)
  const now = useBeirutTime()
  const { label, hour } = beirutParts(now)
  const phase = phaseOf(hour)

  useEffect(() => {
    themeRef.current = theme
  }, [theme])

  const select = useCallback((id: SpotId) => {
    if (document.activeElement instanceof HTMLElement && !document.activeElement.closest('.room-card')) {
      returnFocus.current = document.activeElement
    }
    setTip(null)
    setSelected(id)
    // on phones the card is a sheet over the page: bring the room back into view above it
    if (matchMedia('(max-width: 760px)').matches && window.scrollY > 40) window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const close = useCallback(() => {
    setSelected(null)
    returnFocus.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    const host = stageRef.current
    if (!host) return
    let cancelled = false
    let scene: DeskScene | null = null
    // A pre-rendered poster of the room paints at once. The live scene replaces it
    // as soon as the visitor moves, touches or scrolls (or after a few seconds),
    // so building it never competes with the first paint.
    const light = matchMedia('(pointer: coarse)').matches || window.innerWidth < 760
    const whenIdle = () =>
      new Promise<void>((resolve) => {
        if (POSTER_MODE) return resolve()
        let done = false
        const events = ['pointermove', 'pointerdown', 'touchstart', 'scroll', 'keydown', 'wheel']
        const go = () => {
          if (done) return
          done = true
          events.forEach((ev) => window.removeEventListener(ev, go))
          resolve()
        }
        const idle = () => {
          events.forEach((ev) => window.addEventListener(ev, go, { once: true, passive: true }))
          window.setTimeout(go, light ? 6000 : 4500)
        }
        if (document.readyState === 'complete') idle()
        else window.addEventListener('load', idle, { once: true })
      })
    whenIdle()
      .then(() => (cancelled ? Promise.reject(new Error('cancelled')) : import('../scene/desk')))
      .then(async ({ DeskScene, webglAvailable }) => {
        if (cancelled) return
        if (!webglAvailable()) {
          setFailed(true)
          return
        }
        scene = new DeskScene(host, {
          reducedMotion: reduced || POSTER_MODE,
          dark: themeRef.current === 'dark',
          hour: POSTER_MODE ? 13 : beirutParts(new Date()).hour,
          onSelect: select,
          onHover: (id, x, y) => setTip(id ? { id, x, y } : null),
        })
        sceneRef.current = scene
        await scene.start()
        if (!cancelled) requestAnimationFrame(() => setReady(true))
      })
      .catch((e: Error) => {
        if (!cancelled && e?.message !== 'cancelled') setFailed(true)
      })
    return () => {
      cancelled = true
      scene?.dispose()
      sceneRef.current = null
      setReady(false)
    }
  }, [reduced, select])

  useEffect(() => {
    sceneRef.current?.setHour(hour)
  }, [hour])

  useEffect(() => {
    sceneRef.current?.setDark(theme === 'dark')
  }, [theme])

  // fly the camera to whatever is open; leave room for the card beside or under it
  useEffect(() => {
    const narrow = matchMedia('(max-width: 760px)').matches
    const panel = isCardSpot(selected) ? (narrow ? 'bottom' : 'right') : null
    sceneRef.current?.focusOn(selected, panel)
  }, [selected, ready])

  const R = t.room
  const stageClass = ['hero-stage', ready && 'is-ready', failed && 'is-failed', selected && 'is-open'].filter(Boolean).join(' ')

  return (
    <header className="hero" id="top">
      <div className={stageClass}>
        {!POSTER_MODE && <div className="hero-poster" aria-hidden="true" />}
        <div ref={stageRef} className="hero-canvas" role="img" aria-label={t.hero.sceneLabel} />
        {failed && (
          <div className="hero-fallback">
            <img src="/images/beirut-corniche-wide.webp" width="1920" height="1080" alt="" />
          </div>
        )}
        {tip && !selected && (
          <p className="room-tip" style={{ left: 0, top: 0, transform: `translate(${tip.x + 16}px, ${tip.y + 18}px)` }} aria-hidden="true" dir="auto">
            <strong>{R.names[tip.id]}</strong> {R.verbs[tip.id]}
          </p>
        )}
        {!POSTER_MODE && (
          <nav className="room-list" aria-label={R.listLabel}>
            <p className="room-hint">{R.hint}</p>
            <ul>
              {LIST.map((id) => (
                <li key={id}>
                  <button
                    type="button"
                    aria-pressed={selected === id}
                    aria-haspopup="dialog"
                    onClick={() => (selected === id ? close() : select(id))}
                  >
                    {R.names[id]}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
        {selected === 'monitor' && <Terminal onClose={close} />}
        {isCardSpot(selected) && <RoomCard id={selected} now={now} onClose={close} onGo={(id) => setSelected(id)} />}
      </div>

      <div className="hero-name-wrap">
        <h1 className="hero-name" lang={lang}>
          <span className="hero-word">{t.hero.name[0]}</span>
          <span className="hero-frame" aria-hidden="true">
            <img
              src="/images/beirut-corniche-800.webp"
              srcSet="/images/beirut-corniche-800.webp 800w, /images/beirut-corniche.webp 1600w"
              sizes="(max-width: 760px) 100vw, 26vw"
              width="1600"
              height="750"
              alt=""
              fetchPriority="high"
              decoding="async"
            />
          </span>
          <span className="hero-word">{t.hero.name[1]}</span>
          <span className="visually-hidden">{t.hero.hiddenRole}</span>
        </h1>
      </div>

      <div className="hero-foot">
        <p className="hero-lead">{t.hero.lead}</p>
        <p className="hero-clock">
          <span className={`dot dot-${phase}`} aria-hidden="true" />
          {t.hero.beirut(label, t.hero.phases[phase])}
        </p>
        <div className="hero-actions">
          <button type="button" className="link-quiet" onClick={() => select('monitor')} aria-haspopup="dialog">
            {t.hero.terminal}
          </button>
          <a className="btn" href="#contact">
            {t.hero.cta}
          </a>
        </div>
      </div>
    </header>
  )
}
