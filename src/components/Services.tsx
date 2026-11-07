import { lazy, Suspense, useState, type CSSProperties } from 'react'
import { useLang } from '../lib/lang-context'
import { useReveal } from '../lib/hooks'
import type { ServiceGroup } from '../content'

const ServiceFigure = lazy(() => import('./ServiceFigure'))

type Active = { group: ServiceGroup['id']; note: string; name: string } | null

export default function Services() {
  const { t, lang } = useLang()
  const ref = useReveal<HTMLElement>()
  const [active, setActive] = useState<Active>(null)
  const figureId = active ? active.group : 'idle'

  return (
    <section className="services" id="services" ref={ref} aria-labelledby="services-h">
      <h2 id="services-h" className="section-h" data-reveal style={{ '--i': 0 } as CSSProperties}>
        {t.services.heading}
      </h2>
      <div className="services-grid" onMouseLeave={() => setActive(null)}>
        {t.services.groups.map((g, gi) => (
          <div className="services-col" key={g.id} data-reveal style={{ '--i': gi + 1 } as CSSProperties}>
            <h3 className="services-group">{g.title}</h3>
            <ul>
              {g.items.map((it) => (
                <li key={it.name}>
                  <button
                    type="button"
                    className={active?.name === it.name ? 'is-active' : ''}
                    onMouseEnter={() => setActive({ group: g.id, note: it.note, name: it.name })}
                    onFocus={() => setActive({ group: g.id, note: it.note, name: it.name })}
                    aria-describedby="services-note"
                  >
                    {it.name}
                  </button>
                </li>
              ))}
            </ul>
            <p className="services-summary">{g.summary}</p>
          </div>
        ))}
        <aside className="services-aside" data-reveal style={{ '--i': 4 } as CSSProperties}>
          <div className="services-figure">
            <Suspense fallback={null}>
              <ServiceFigure key={figureId + lang} id={figureId} label={active ? active.name : t.services.heading} />
            </Suspense>
          </div>
          <p id="services-note" className="services-note" aria-live="polite">
            {active ? (
              <>
                <strong>{active.name}.</strong> {active.note}
              </>
            ) : (
              t.services.hint
            )}
          </p>
        </aside>
      </div>
    </section>
  )
}
