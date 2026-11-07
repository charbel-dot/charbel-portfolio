import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useLang } from '../lib/i18n'
import { beirutParts } from '../lib/hooks'
import { mailto, whatsapp } from '../content'

type Line = { kind: 'in' | 'out'; text: string }

const ANCHORS: Record<string, string> = {
  services: 'services',
  work: 'work',
  about: 'about',
  contact: 'contact',
}

/** The live thing: a real terminal on the desk's monitor. */
export default function Terminal({ onClose }: { onClose: () => void }) {
  const { t, lang } = useLang()
  const T = t.terminal
  const [lines, setLines] = useState<Line[]>(() => T.welcome.map((text) => ({ kind: 'out', text })))
  const [value, setValue] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [hIndex, setHIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    returnFocus.current = document.activeElement as HTMLElement
    const id = window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 350)
    return () => {
      window.clearTimeout(id)
      returnFocus.current?.focus?.({ preventScroll: true })
    }
  }, [])

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight })
  }, [lines])

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const out = (texts: string[]) => texts.map((text) => ({ kind: 'out' as const, text }))

  const goTo = (id: string) => {
    onClose()
    window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 250)
  }

  const run = (raw: string) => {
    const cmd = raw.trim()
    const name = cmd.toLowerCase().split(/\s+/)[0]
    const echo: Line = { kind: 'in', text: cmd }
    if (!cmd) return setLines((l) => [...l, echo])
    setHistory((h) => [cmd, ...h].slice(0, 30))
    setHIndex(-1)
    switch (name) {
      case 'help':
      case 'ls':
        return setLines((l) => [...l, echo, ...out(T.help)])
      case 'whoami':
        return setLines((l) => [...l, echo, ...out(T.whoami)])
      case 'status':
        return setLines((l) => [...l, echo, ...out(T.status)])
      case 'about':
        return setLines((l) => [...l, echo, ...out(T.about)])
      case 'contact':
        return setLines((l) => [...l, echo, ...out(T.contact)])
      case 'time':
      case 'date':
        return setLines((l) => [...l, echo, ...out(T.time(beirutParts(new Date()).label))])
      case 'clear':
        return setLines([])
      case 'exit':
      case 'quit':
        return onClose()
      case 'sudo':
        return setLines((l) => [...l, echo, ...out(T.sudo)])
      case 'hire':
        setLines((l) => [...l, echo, ...out(T.hire)])
        window.location.href = mailto(t.contact.mailSubject)
        return
      case 'whatsapp':
        window.open(whatsapp(t.contact.waText), '_blank', 'noopener')
        return setLines((l) => [...l, echo])
      case 'services':
      case 'work':
        setLines((l) => [...l, echo, ...out([T.opening(name)])])
        return goTo(ANCHORS[name])
      default:
        return setLines((l) => [...l, echo, { kind: 'out', text: T.unknown(name) }])
    }
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    run(value)
    setValue('')
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' && history.length) {
      e.preventDefault()
      const i = Math.min(hIndex + 1, history.length - 1)
      setHIndex(i)
      setValue(history[i])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const i = hIndex - 1
      setHIndex(i)
      setValue(i >= 0 ? history[i] : '')
    } else if (e.key === 'Tab') {
      const opts = ['help', 'whoami', 'services', 'work', 'about', 'contact', 'status', 'time', 'hire', 'clear', 'exit']
      const m = opts.filter((o) => o.startsWith(value.toLowerCase()))
      if (value && m.length === 1) {
        e.preventDefault()
        setValue(m[0])
      }
    }
  }

  const chips = ['whoami', 'services', 'work', 'contact', 'hire']

  return (
    <div
      ref={dialogRef}
      className="term"
      role="dialog"
      aria-modal="false"
      aria-label={T.title}
      data-ui
      dir="ltr"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="term-bar">
        <span className="term-title">{T.title}</span>
        <button type="button" className="term-close" onClick={onClose} aria-label={T.close}>
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="term-body" ref={bodyRef} aria-live="polite">
        {lines.map((l, i) => (
          <pre key={i} className={l.kind === 'in' ? 'term-in' : 'term-out'} dir={l.kind === 'out' && lang === 'ar' ? 'auto' : 'ltr'}>
            <code>
              {l.kind === 'in' && <span className="term-prompt">$ </span>}
              {l.text}
            </code>
          </pre>
        ))}
        <form onSubmit={submit} className="term-form">
          <label className="term-prompt" htmlFor="term-input">
            $
          </label>
          <input
            id="term-input"
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="send"
            aria-label={T.inputLabel}
            placeholder={T.placeholder}
          />
        </form>
      </div>
      <div className="term-chips">
        {chips.map((c) => (
          <button key={c} type="button" onClick={(e) => (e.stopPropagation(), run(c))}>
            {c}
          </button>
        ))}
      </div>
    </div>
  )
}
