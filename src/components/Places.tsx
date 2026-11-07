import type { CSSProperties } from 'react'
import { useLang } from '../lib/lang-context'
import { useReveal } from '../lib/hooks'

/** Lebanon, where the work is done: three real pictures, credited in the footer. */
export default function Places() {
  const { t } = useLang()
  const ref = useReveal<HTMLElement>(0.12)
  const p = t.places
  const s = (i: number) => ({ '--i': i }) as CSSProperties
  return (
    <section className="places" id="places" ref={ref} aria-labelledby="places-h">
      <h2 id="places-h" className="section-h" data-reveal style={s(0)}>
        {p.heading}
      </h2>
      <figure className="places-a" data-reveal style={s(1)}>
        <div className="places-img">
          <img src="/images/beirut-corniche-wide-960.webp" srcSet="/images/beirut-corniche-wide-960.webp 960w, /images/beirut-corniche-wide.webp 1920w" sizes="(max-width: 900px) 100vw, 66vw" width="1920" height="1080" alt={p.corniche} loading="lazy" decoding="async" />
        </div>
        <figcaption>{p.corniche}</figcaption>
      </figure>
      <figure className="places-b" data-reveal style={s(2)}>
        <div className="places-img">
          <img src="/images/cedar-tall-560.webp" srcSet="/images/cedar-tall-560.webp 560w, /images/cedar-tall.webp 1100w" sizes="(max-width: 900px) 50vw, 33vw" width="1100" height="1100" alt={p.cedar} loading="lazy" decoding="async" />
        </div>
        <figcaption>{p.cedar}</figcaption>
      </figure>
      <figure className="places-c" data-reveal style={s(3)}>
        <div className="places-img">
          <img src="/images/zaytunay-portrait.webp" width="546" height="683" alt={p.bay} loading="lazy" decoding="async" />
        </div>
        <figcaption>{p.bay}</figcaption>
      </figure>
      <p className="places-note" data-reveal style={s(3)}>
        {p.note}
      </p>
    </section>
  )
}
