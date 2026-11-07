import { useEffect, useRef } from 'react'
import { CONTACT, CREDITS, mailto, whatsapp } from '../content'
import { useLang } from '../lib/lang-context'
import { beirutParts, useBeirutTime } from '../lib/hooks'

export default function Footer() {
  const { t, lang } = useLang()
  const now = useBeirutTime()
  const { label } = beirutParts(now)
  const f = t.footer
  const markRef = useRef<HTMLParagraphElement>(null)

  // size the wordmark so each line runs exactly from margin to margin
  useEffect(() => {
    const el = markRef.current
    if (!el) return
    const fit = () => {
      el.style.fontSize = '100px'
      const spans = Array.from(el.querySelectorAll('span'))
      const stacked = getComputedStyle(spans[0]).display === 'block'
      const w = stacked ? Math.max(...spans.map((s) => s.getBoundingClientRect().width)) : el.scrollWidth
      const avail = el.clientWidth
      if (w > 0) el.style.fontSize = `${Math.floor((100 * avail) / w) - 0.5}px`
    }
    fit()
    let lastW = el.clientWidth
    const ro = new ResizeObserver(() => {
      if (el.clientWidth === lastW) return
      lastW = el.clientWidth
      fit()
    })
    ro.observe(el)
    document.fonts?.ready.then(fit)
    return () => ro.disconnect()
  }, [lang])
  const year = now.getFullYear()
  return (
    <footer className="footer">
      <div className="footer-cols">
        <div>
          <h2 className="footer-h">{f.contact}</h2>
          <ul>
            <li>
              <a href={mailto(t.contact.mailSubject)} dir="ltr">
                {CONTACT.email}
              </a>
            </li>
            <li>
              <a href={whatsapp(t.contact.waText)} target="_blank" rel="noopener">
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="footer-h">{f.pages}</h2>
          <ul>
            <li>
              <a href="#services">{t.nav.services}</a>
            </li>
            <li>
              <a href="#work">{t.nav.work}</a>
            </li>
            <li>
              <a href="#about">{t.nav.about}</a>
            </li>
            <li>
              <a href="#top">{f.top}</a>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="footer-h">{f.elsewhere}</h2>
          <ul>
            <li>
              <a href={CONTACT.instagramUrl} target="_blank" rel="noopener">
                Instagram
              </a>
            </li>
            <li>
              <a href="https://mobitouch.online" target="_blank" rel="noopener">
                MobiTouch
              </a>
            </li>
            <li>
              <a href="https://humlb.com" target="_blank" rel="noopener">
                HÚM
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="footer-h">{f.beirut}</h2>
          <ul>
            <li className="footer-time">{label}</li>
            <li>{f.lebanon}</li>
          </ul>
        </div>
      </div>

      <p className="footer-mark" aria-hidden="true" lang={lang} ref={markRef}>
        {lang === 'ar' ? (
          <span className="fm-one">شربل ناصح</span>
        ) : (
          <>
            <span>Charbel</span> <span>Nasseh</span>
          </>
        )}
      </p>

      <div className="footer-legal">
        <p>
          © {year} {f.rights}
        </p>
        <p className="credits" dir="ltr">
          {f.pictures}:{' '}
          {CREDITS.map((c, i) => (
            <span key={c.title}>
              <a href={c.page} target="_blank" rel="noopener">
                “{c.title}”
              </a>{' '}
              by {c.creator},{' '}
              <a href={c.licenseUrl} target="_blank" rel="noopener">
                {c.license}
              </a>
              {i < CREDITS.length - 1 ? '; ' : '.'}
            </span>
          ))}
        </p>
      </div>
    </footer>
  )
}
