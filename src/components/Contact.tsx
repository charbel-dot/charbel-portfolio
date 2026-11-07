import type { CSSProperties } from 'react'
import { CONTACT, mailto, whatsapp } from '../content'
import { useLang } from '../lib/lang-context'
import { beirutParts, useBeirutTime, useReveal } from '../lib/hooks'

const Arrow = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default function Contact() {
  const { t } = useLang()
  const ref = useReveal<HTMLElement>(0.1)
  const { label } = beirutParts(useBeirutTime())
  const c = t.contact
  const s = (i: number) => ({ '--i': i }) as CSSProperties

  return (
    <section className="contact" id="contact" ref={ref} aria-labelledby="contact-h">
      <div className="contact-head">
        <h2 id="contact-h" className="section-h" data-reveal style={s(0)}>
          {c.heading}
        </h2>
        <p className="contact-lead" data-reveal style={s(1)}>
          {c.lead}
        </p>
      </div>
      <ul className="contact-rows">
        <li className="contact-row" data-reveal style={s(1)}>
          <a href={mailto(c.mailSubject)} dir="ltr">
            {c.email}
          </a>
          <img
            className="contact-photo"
            src="/images/zaytunay-square-240.webp"
            srcSet="/images/zaytunay-square-240.webp 240w, /images/zaytunay-square.webp 480w"
            sizes="112px"
            width="480"
            height="480"
            alt={c.photoAlt}
            loading="lazy"
            decoding="async"
          />
        </li>
        <li className="contact-row" data-reveal style={s(2)}>
          <a href={whatsapp(c.waText)} target="_blank" rel="noopener">
            {c.whatsapp}
          </a>
        </li>
        <li className="contact-row" data-reveal style={s(3)}>
          <a href={CONTACT.instagramUrl} target="_blank" rel="noopener">
            {c.instagram}
          </a>
        </li>
        <li className="contact-row contact-row-quiet" data-reveal style={s(4)}>
          <span>{c.place(label)}</span>
        </li>
        <li className="contact-row contact-row-quiet" data-reveal style={s(5)}>
          <span>{c.status}</span>
        </li>
        <li className="contact-row contact-row-greet" data-reveal style={s(6)}>
          <a href={mailto(c.mailSubject)} aria-label={c.greetingLabel}>
            <span>{c.greeting}</span>
            <span className="contact-go">
              <Arrow />
            </span>
          </a>
        </li>
      </ul>
    </section>
  )
}
