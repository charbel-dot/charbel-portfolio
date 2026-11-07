import { useEffect, useRef } from 'react'
import { useLang } from '../lib/lang-context'
import { CARD_SPOTS, type CardSpot } from '../scene/hotspots'
import { CONTACT, mailto, whatsapp, type CardAction } from '../content'

const Arrow = ({ flip = false }: { flip?: boolean }) => (
  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ZONES = new Map<string, Intl.DateTimeFormat>()
function zoneTime(zone: string, now: Date) {
  let f = ZONES.get(zone)
  if (!f) {
    f = new Intl.DateTimeFormat('en-GB', { timeZone: zone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    ZONES.set(zone, f)
  }
  return f.format(now)
}

/** The card for one object in the room: what it is, and where to go next. */
export default function RoomCard({
  id,
  now,
  onClose,
  onGo,
}: {
  id: CardSpot
  now: Date
  onClose: () => void
  onGo: (id: CardSpot) => void
}) {
  const { t, lang } = useLang()
  const R = t.room
  const card = R.cards[id]
  const titleRef = useRef<HTMLHeadingElement>(null)
  const i = CARD_SPOTS.indexOf(id)
  const prev = CARD_SPOTS[(i - 1 + CARD_SPOTS.length) % CARD_SPOTS.length]
  const next = CARD_SPOTS[(i + 1) % CARD_SPOTS.length]
  const rtl = lang === 'ar'

  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true })
  }, [id])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const actions: CardAction[] =
    id === 'phone'
      ? [
          { label: CONTACT.email, href: mailto(t.contact.mailSubject) },
          { label: 'WhatsApp', href: whatsapp(t.contact.waText), external: true },
          { label: `Instagram @${CONTACT.instagram}`, href: CONTACT.instagramUrl, external: true },
        ]
      : card.actions

  return (
    <dialog open className="room-card" aria-labelledby="room-card-title" key={id}>
      <div className="room-card-top">
        <h2 id="room-card-title" ref={titleRef} tabIndex={-1}>
          {card.title}
        </h2>
        <button type="button" className="room-card-close" onClick={onClose} aria-label={R.close}>
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <p className="room-card-body">{card.body}</p>
      {id === 'clock' && (
        <dl className="room-card-zones">
          {R.zones.map((z) => (
            <div key={z.zone}>
              <dt>{z.city}</dt>
              <dd dir="ltr">{zoneTime(z.zone, now)}</dd>
            </div>
          ))}
        </dl>
      )}
      {card.items && (
        <ul className="room-card-items">
          {card.items.map((it) => (
            <li key={it}>{it}</li>
          ))}
        </ul>
      )}
      {actions.length > 0 && (
        <div className="room-card-actions">
          {actions.map((a, ai) => (
            <a
              key={a.href}
              className={ai === 0 ? 'btn' : 'room-card-link'}
              href={a.href}
              dir={a.href.startsWith('mailto') ? 'ltr' : undefined}
              onClick={a.href.startsWith('#') ? onClose : undefined}
              {...(a.external ? { target: '_blank', rel: 'noopener' } : {})}
            >
              {a.label}
            </a>
          ))}
        </div>
      )}
      <div className="room-card-nav">
        <button type="button" onClick={() => onGo(prev)}>
          <Arrow flip={!rtl} />
          {R.names[prev]}
        </button>
        <button type="button" onClick={() => onGo(next)}>
          {R.names[next]}
          <Arrow flip={rtl} />
        </button>
      </div>
    </dialog>
  )
}
