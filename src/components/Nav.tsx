import { useLang } from '../lib/i18n'
import { useTheme } from '../lib/theme'

export default function Nav() {
  const { t, toggle, lang } = useLang()
  const { theme, toggle: toggleTheme } = useTheme()
  const dark = theme === 'dark'
  return (
    <nav className="nav" aria-label={t.nav.menu}>
      <a className="nav-mark" href="#top" aria-label={lang === 'ar' ? 'شربل ناصح، إلى الأعلى' : 'Charbel Nasseh, back to top'}>
        <svg viewBox="0 0 64 64" width="28" height="28" aria-hidden="true">
          <rect width="64" height="64" rx="32" fill="var(--mark-bg)" />
          <path
            d="M24 22 14 32l10 10M40 22l10 10-10 10"
            stroke="var(--mark-fg)"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>{lang === 'ar' ? 'شربل ناصح' : 'Charbel Nasseh'}</span>
      </a>
      <ul className="nav-links">
        <li className="nav-hide-sm">
          <a href="#services">{t.nav.services}</a>
        </li>
        <li className="nav-hide-sm">
          <a href="#work">{t.nav.work}</a>
        </li>
        <li className="nav-hide-sm">
          <a href="#about">{t.nav.about}</a>
        </li>
        <li>
          <a href="#contact">{t.nav.contact}</a>
        </li>
        <li>
          <button
            type="button"
            className="nav-theme"
            onClick={toggleTheme}
            aria-pressed={dark}
            aria-label={t.nav.dark}
            title={t.nav.dark}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <circle className="nt-sun" cx="12" cy="12" r="4.5" fill="currentColor" />
              <g className="nt-rays" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
              </g>
              <circle className="nt-cut" cx="16.5" cy="8.5" r="4.6" fill="var(--bg)" />
            </svg>
          </button>
        </li>
        <li>
          <button type="button" className="nav-lang" onClick={toggle} aria-label={t.nav.switchLabel} lang={lang === 'en' ? 'ar' : 'en'}>
            {t.nav.switchTo}
          </button>
        </li>
      </ul>
    </nav>
  )
}
