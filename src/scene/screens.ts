/** Canvas textures for the two screens on the desk. */
import * as THREE from 'three'

const MONO = '500 30px ui-monospace, Menlo, Consolas, monospace' // taste-skill-ignore: a real terminal

const SCRIPT = [
  { p: true, t: 'whoami' },
  { p: false, t: 'web developer · sysadmin' },
  { p: true, t: 'ls services/' },
  { p: false, t: 'websites/  stores/  erpnext/  servers/' },
  { p: true, t: 'docker compose ps' },
  { p: false, t: 'erpnext    running   healthy' },
  { p: false, t: 'ury-pos    running   healthy' },
  { p: false, t: 'nginx      running   healthy' },
  { p: true, t: 'git push origin main' },
  { p: false, t: 'deployed in 41s' },
  { p: true, t: 'status' },
  { p: false, t: 'open for new projects' },
]

function texture(canvas: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(canvas)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

/** The main monitor: a shell that types to itself. */
export class TerminalScreen {
  canvas = document.createElement('canvas')
  private ctx: CanvasRenderingContext2D
  texture: THREE.CanvasTexture
  private line = 0
  private char = 0
  private lines: { p: boolean; t: string }[] = []
  private acc = 0
  private cursor = 0
  private blink = true

  constructor() {
    this.canvas.width = 1024
    this.canvas.height = 600
    this.ctx = this.canvas.getContext('2d')!
    this.texture = texture(this.canvas)
    this.draw()
  }

  tick(dt: number, speedUp = 1) {
    this.acc += dt * speedUp
    this.cursor += dt
    const step = SCRIPT[this.line % SCRIPT.length]
    const speed = step.p ? 0.055 : 0.012
    let changed = false
    while (this.acc > speed) {
      this.acc -= speed
      if (this.char === 0) this.lines.push({ p: step.p, t: '' })
      this.lines[this.lines.length - 1].t = step.t.slice(0, this.char + 1)
      this.char++
      changed = true
      if (this.char >= step.t.length) {
        this.char = 0
        this.line++
        this.acc -= step.p ? 0.5 : 0.18
        if (this.line % SCRIPT.length === 0) {
          this.acc -= 1.4
          this.lines = []
        }
        break
      }
    }
    if (this.cursor > 0.5) {
      this.cursor = 0
      this.blink = !this.blink
      changed = true
    }
    if (changed) this.draw()
  }

  draw() {
    const { ctx } = this
    const W = this.canvas.width
    const H = this.canvas.height
    ctx.fillStyle = '#161817'
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#232523'
    ctx.fillRect(0, 0, W, 54)
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = '#3a3d3b'
      ctx.beginPath()
      ctx.arc(34 + i * 30, 27, 9, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.fillStyle = '#8f9691'
    ctx.font = MONO.replace('30px', '24px')
    ctx.fillText('charbel@dev: ~', 140, 35)
    ctx.font = MONO
    const visible = this.lines.slice(-12)
    visible.forEach((l, i) => {
      const y = 104 + i * 42
      if (l.p) {
        ctx.fillStyle = '#a1ffcb'
        ctx.fillText('$', 36, y)
        ctx.fillStyle = '#f2f2f2'
      } else ctx.fillStyle = '#9aa29d'
      ctx.fillText(l.t, 70, y)
    })
    if (this.blink) {
      const last = visible[visible.length - 1]
      const y = 104 + Math.max(0, visible.length - 1) * 42
      const x = last ? 70 + ctx.measureText(last.t).width + 6 : 70
      ctx.fillStyle = '#a1ffcb'
      ctx.fillRect(x, y - 26, 16, 32)
    }
    ctx.fillStyle = '#5c625e'
    ctx.font = MONO.replace('30px', '22px')
    ctx.fillText('click to use this terminal', 36, H - 28)
    this.texture.needsUpdate = true
  }
}

/** The second, vertical screen: a live load graph for the server under the desk. */
export class GraphScreen {
  canvas = document.createElement('canvas')
  private ctx: CanvasRenderingContext2D
  texture: THREE.CanvasTexture
  private values: number[] = []
  private acc = 0
  private seed = 0.4

  constructor() {
    this.canvas.width = 360
    this.canvas.height = 600
    this.ctx = this.canvas.getContext('2d')!
    this.texture = texture(this.canvas)
    for (let i = 0; i < 26; i++) this.push()
    this.draw()
  }

  private push() {
    this.seed = Math.min(0.95, Math.max(0.08, this.seed + (Math.random() - 0.5) * 0.22))
    this.values.push(this.seed)
    if (this.values.length > 26) this.values.shift()
  }

  tick(dt: number) {
    this.acc += dt
    if (this.acc > 0.6) {
      this.acc = 0
      this.push()
      this.draw()
    }
  }

  draw() {
    const { ctx } = this
    const W = this.canvas.width
    const H = this.canvas.height
    ctx.fillStyle = '#161817'
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#9aa29d'
    ctx.font = '500 26px ui-sans-serif, system-ui, sans-serif'
    ctx.fillText('proxmox · cpu', 24, 48)
    const last = this.values[this.values.length - 1]
    ctx.fillStyle = '#f2f2f2'
    ctx.font = '600 64px ui-sans-serif, system-ui, sans-serif'
    ctx.fillText(`${Math.round(last * 100)}%`, 24, 124)
    const bw = (W - 48) / this.values.length
    this.values.forEach((v, i) => {
      const h = v * (H - 260)
      ctx.fillStyle = i === this.values.length - 1 ? '#a1ffcb' : '#3b4a42'
      ctx.fillRect(24 + i * bw, H - 60 - h, bw - 3, h)
    })
    ctx.fillStyle = '#5c625e'
    ctx.font = '500 22px ui-sans-serif, system-ui, sans-serif'
    ctx.fillText('6 containers · all healthy', 24, H - 22)
    this.texture.needsUpdate = true
  }
}

/** The phone's lock screen; lights up when a message arrives. */
export class PhoneScreen {
  canvas = document.createElement('canvas')
  private ctx: CanvasRenderingContext2D
  texture: THREE.CanvasTexture

  constructor() {
    this.canvas.width = 200
    this.canvas.height = 400
    this.ctx = this.canvas.getContext('2d')!
    this.texture = texture(this.canvas)
    this.draw(false)
  }

  draw(lit: boolean, time = '') {
    const { ctx } = this
    ctx.fillStyle = lit ? '#1e2220' : '#0c0c0c'
    ctx.fillRect(0, 0, 200, 400)
    if (lit) {
      ctx.fillStyle = '#f2f2f2'
      ctx.font = '600 52px ui-sans-serif, system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(time, 100, 120)
      ctx.fillStyle = '#a1ffcb'
      ctx.fillRect(20, 200, 160, 70)
      ctx.fillStyle = '#141514'
      ctx.font = '600 22px ui-sans-serif, system-ui, sans-serif'
      ctx.fillText('New project?', 100, 244)
      ctx.textAlign = 'start'
    }
    this.texture.needsUpdate = true
  }
}
