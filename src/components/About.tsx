import { useLang } from '../lib/lang-context'
import { useReveal } from '../lib/hooks'
import type { CSSProperties } from 'react'

export default function About() {
  const { t } = useLang()
  const ref = useReveal<HTMLElement>()
  return (
    <section className="about" id="about" ref={ref} aria-labelledby="about-h">
      <div className="about-side">
        <h2 id="about-h" className="section-h" data-reveal style={{ '--i': 0 } as CSSProperties}>
          {t.about.heading}
        </h2>
        <dl className="about-facts" data-reveal style={{ '--i': 1 } as CSSProperties}>
          {t.about.facts.map((f) => (
            <div key={f.label}>
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="about-text">
        <p className="about-p" data-reveal style={{ '--i': 1 } as CSSProperties}>
          <img
            className="about-photo"
            src="/images/cedar-square-320.webp"
            srcSet="/images/cedar-square-320.webp 320w, /images/cedar-square.webp 800w"
            sizes="140px"
            width="800"
            height="800"
            alt={t.about.photoAlt}
            loading="lazy"
            decoding="async"
          />
          <strong>{t.about.name}</strong> {t.about.p1}
        </p>
        <p className="about-p about-p2" data-reveal style={{ '--i': 2 } as CSSProperties}>
          {t.about.p2}
        </p>
      </div>
    </section>
  )
}
