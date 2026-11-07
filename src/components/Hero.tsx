import { useEffect, useRef, useState } from 'react'
import { useLang } from '../lib/i18n'
import { beirutParts, phaseOf, useBeirutTime, usePrefersReducedMotion } from '../lib/hooks'
import type { DeskScene } from '../scene/desk'
import Terminal from './Terminal'
import { useTheme } from '../lib/theme'

/** Dev only: ?poster renders the bare room so posters can be captured. */
const POSTER_MODE = import.meta.env.DEV && new URLSearchParams(location.search).has('poster')
if (POSTER_MODE) document.documentElement.classList.add('poster-mode')

export default function Hero() {
  const { t, lang } = useLang()
  const stageRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<DeskScene | null>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(false)
  const reduced = usePrefersReducedMotion()
  const { theme } = useTheme()
  const themeRef = useRef(theme)
  useEffect(() => {
    themeRef.current = theme
  }, [theme])
  const now = useBeirutTime()
  const { label, hour } = beirutParts(now)
  const phase = phaseOf(hour)

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
        const go = () => {
          if (done) return
          done = true
          events.forEach((ev) => window.removeEventListener(ev, go))
          resolve()
        }
        const events = ['pointermove', 'pointerdown', 'touchstart', 'scroll', 'keydown', 'wheel']
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
          onMonitorClick: () => setOpen(true),
          onHoverChange: setHover,
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
  }, [reduced])

  useEffect(() => {
    sceneRef.current?.setHour(hour)
  }, [hour])

  useEffect(() => {
    sceneRef.current?.setDark(theme === 'dark')
  }, [theme])

  useEffect(() => {
    sceneRef.current?.setFocus(open)
  }, [open])

  return (
    <header className="hero" id="top">
      <div
        className={`hero-stage${ready ? ' is-ready' : ''}${failed ? ' is-failed' : ''}${hover ? ' is-hover' : ''}${open ? ' is-open' : ''}`}
      >
        {!POSTER_MODE && <div className="hero-poster" aria-hidden="true" />}
        <div ref={stageRef} className="hero-canvas" role="img" aria-label={t.hero.sceneLabel} />
        {failed && (
          <div className="hero-fallback">
            <img src="/images/beirut-corniche-wide.webp" width="1920" height="1080" alt="" />
          </div>
        )}
        {open && <Terminal onClose={() => setOpen(false)} />}
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
          <button type="button" className="link-quiet" onClick={() => setOpen(true)} aria-haspopup="dialog">
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
