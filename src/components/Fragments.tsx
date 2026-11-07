/**
 * Interface fragments for the work section, drawn in HTML at a fixed
 * proportion (sized with container units so they scale with their pane).
 * HÚM uses the store's real collection names and prices; the restaurant
 * screens use sample data and say so.
 */
import type { Project } from '../content'

const HUM_COLLECTIONS = [
  'Timeless Stones',
  'The Turkish Empire',
  'HÚM Specials',
  'Agate Treasures',
  'The Antique Garden',
  'The Aaj Vault',
  'The Amber Reserve',
  'Signature Wristpieces',
]

function HumStore() {
  return (
    <div className="frag frag-hum-store" data-ui>
      <div className="fh-bar">Welcome to HÚM · Free shipping all over Lebanon</div>
      <div className="fh-head">
        <span className="fh-burger" />
        <span className="fh-logo">HÚM</span>
        <span className="fh-icons">
          <i />
          <i />
        </span>
      </div>
      <div className="fh-hero">
        <p className="fh-hero-line">Wear the moment,<br />keep the calm.</p>
        <span className="fh-hero-btn">Shop wristpieces</span>
      </div>
      <div className="fh-products">
        {[
          ['The Blue Genie', '55 $'],
          ['The Olive Seed', '50 $'],
          ['Magnetic, Black Stone', '27 $'],
        ].map(([n, p]) => (
          <div className="fh-product" key={n}>
            <span className="fh-thumb" />
            <span className="fh-pname">{n}</span>
            <span className="fh-price">{p}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function HumCollections() {
  return (
    <div className="frag frag-hum-list" data-ui>
      <p className="fhl-title">HÚM Collections</p>
      <ul>
        {HUM_COLLECTIONS.map((c, i) => (
          <li key={c} className={i === 1 ? 'is-on' : ''}>
            {c}
          </li>
        ))}
      </ul>
      <div className="fhl-cart">
        <span>The Rope, Olive</span>
        <span>25 $</span>
        <span className="fhl-add">Add to cart</span>
      </div>
    </div>
  )
}

const TABLES: { n: number; s: 'busy' | 'free' | 'bill'; g?: number; mins?: number }[] = [
  { n: 1, s: 'busy', g: 4, mins: 32 },
  { n: 2, s: 'free' },
  { n: 3, s: 'bill', g: 2, mins: 58 },
  { n: 4, s: 'busy', g: 6, mins: 12 },
  { n: 5, s: 'free' },
  { n: 6, s: 'busy', g: 2, mins: 21 },
  { n: 7, s: 'busy', g: 3, mins: 8 },
  { n: 8, s: 'free' },
  { n: 9, s: 'bill', g: 5, mins: 71 },
  { n: 10, s: 'free' },
  { n: 11, s: 'busy', g: 2, mins: 40 },
  { n: 12, s: 'free' },
]

function PosFloor({ sample }: { sample: string }) {
  return (
    <div className="frag frag-pos" data-ui>
      <div className="fp-top">
        <span className="fp-brand">URY POS</span>
        <span className="fp-tabs">
          <b>Floor</b>
          <span>Orders</span>
          <span>Kitchen</span>
        </span>
      </div>
      <div className="fp-grid">
        {TABLES.map((tb) => (
          <div key={tb.n} className={`fp-table fp-${tb.s}`}>
            <span className="fp-n">T{tb.n}</span>
            {tb.g ? (
              <span className="fp-meta">
                {tb.g} guests · {tb.mins} min
              </span>
            ) : (
              <span className="fp-meta">Free</span>
            )}
          </div>
        ))}
      </div>
      <div className="fp-foot">
        <span>6 tables open</span>
        <span>2 bills waiting</span>
      </div>
      <span className="frag-sample">{sample}</span>
    </div>
  )
}

function KitchenTicket({ sample }: { sample: string }) {
  const items = [
    ['2', 'Fattoush'],
    ['1', 'Hummus'],
    ['1', 'Mixed grill'],
    ['3', 'Fresh lemonade'],
  ]
  return (
    <div className="frag frag-ticket" data-ui>
      <div className="ft-paper">
        <p className="ft-head">
          <span>Table 7</span>
          <span>#0412</span>
        </p>
        <p className="ft-sub">Sent 20:41 · 3 guests</p>
        <ul>
          {items.map(([q, n]) => (
            <li key={n}>
              <b>{q}×</b>
              <span>{n}</span>
            </li>
          ))}
        </ul>
        <p className="ft-note">No onion on the fattoush</p>
        <span className="ft-ready">Mark ready</span>
      </div>
      <span className="frag-sample">{sample}</span>
    </div>
  )
}

function MobiBoard() {
  return (
    <div className="frag frag-mobi" data-ui>
      <svg className="fm-mark" viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="32" fill="#232323" />
        <path d="M24 22 14 32l10 10M40 22l10 10-10 10" stroke="#a1ffcb" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="fm-word">MobiTouch</p>
      <p className="fm-sub">Web development and IT services</p>
      <ul className="fm-rows">
        <li>Websites</li>
        <li>Stores</li>
        <li>ERPNext</li>
        <li>Servers</li>
      </ul>
    </div>
  )
}

function MobiShell() {
  return (
    <div className="frag frag-shell" data-ui>
      <pre>
        <code>
          <span className="fs-p">$</span> ls services/{'\n'}
          websites/  stores/{'\n'}
          erpnext/   servers/{'\n'}
          {'\n'}
          <span className="fs-p">$</span> status{'\n'}
          <span className="fs-ok">open for new projects</span>
          {'\n'}
          {'\n'}
          <span className="fs-p">$</span> <span className="fs-cur" />
        </code>
      </pre>
    </div>
  )
}

export function Panes({ id, sample }: { id: Project['id']; sample: string }) {
  if (id === 'hum') return [<HumStore key="a" />, <HumCollections key="b" />]
  if (id === 'restaurant') return [<PosFloor key="a" sample={sample} />, <KitchenTicket key="b" sample={sample} />]
  return [<MobiBoard key="a" />, <MobiShell key="b" />]
}
