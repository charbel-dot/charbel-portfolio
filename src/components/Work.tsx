import { useEffect, useRef } from 'react'
import { useLang } from '../lib/lang-context'
import { usePrefersReducedMotion } from '../lib/hooks'
import { Panes } from './Fragments'

/**
 * "Title torn at the seam": each project pins a stage split at the middle.
 * While it passes, the left half travels up and the right half down, so the
 * title tears and lines up exactly when the project is centred.
 */
export default function Work() {
  const { t } = useLang()
  const reduced = usePrefersReducedMotion()
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const items = Array.from(list.querySelectorAll<HTMLElement>('.work-item'))
    if (reduced) {
      items.forEach((el) => el.style.setProperty('--tear', '0'))
      return
    }
    let raf = 0
    const update = () => {
      raf = 0
      const vh = window.innerHeight
      for (const el of items) {
        const r = el.getBoundingClientRect()
        if (r.bottom < -vh || r.top > vh * 2) continue
        // progress from entering (0) to leaving (1); 0.5 is the middle of the pin
        const p = (vh - r.top) / (r.height + vh)
        const tear = Math.max(-1, Math.min(1, (p - 0.5) * 2))
        el.style.setProperty('--tear', tear.toFixed(4))
      }
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [reduced])

  return (
    <section className="work" id="work" aria-labelledby="work-h">
      <div className="work-list" ref={listRef}>
        {t.work.projects.map((p, i) => {
          const [a, b] = Panes({ id: p.id, sample: t.work.sample })
          return (
            <article className={`work-item work-${p.id}`} key={p.id} aria-labelledby={`work-${p.id}-t`}>
              <div className="work-stage">
                {i === 0 && (
                  <h2 id="work-h" className="section-h work-h">
                    {t.work.heading}
                  </h2>
                )}
                <div className="work-pane work-pane-a" role="img" aria-label={t.work.shots[p.id][0]}>
                  <div aria-hidden="true">{a}</div>
                </div>
                <div className="work-pane work-pane-b" role="img" aria-label={t.work.shots[p.id][1]}>
                  <div aria-hidden="true">{b}</div>
                </div>
                <div className="work-title-wrap">
                  <h3 className="work-title" id={`work-${p.id}-t`} data-copy={p.lines.join('\n')}>
                    {p.lines.join('\n')}
                  </h3>
                  <div className="work-meta">
                    <p>
                      {p.discipline}. {p.description}
                    </p>
                    {p.link && (
                      <a
                        className="work-link"
                        href={p.link.href}
                        {...(p.link.href.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {})}
                      >
                        {p.link.label}
                        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                          <path d="M4 12 12 4M5.5 4H12v6.5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
