/**
 * The desk: a cut-away corner of Charbel's room, built from primitives.
 * A developer in mint headphones types at a monitor; a small server blinks
 * under the desk; the window shows the sky over Beirut at this hour.
 *
 * Loaded lazily (dynamic import) so the page paints before three.js arrives.
 */
import * as THREE from 'three'

export type DeskOptions = {
  reducedMotion: boolean
  dark: boolean
  /** Beirut hour as a float, 0–24. */
  hour: number
  onMonitorClick?: () => void
  onHoverChange?: (hovering: boolean) => void
}

const C = {
  wall: 0xf1f1f1,
  wallSide: 0xe6e6e6,
  floor: 0xd9d9d9,
  plinth: 0x232323,
  ink: 0x232323,
  charcoal: 0x2e2e2e,
  grey: 0x8a8a8a,
  light: 0xbdbdbd,
  mint: 0xa1ffcb,
  mintDeep: 0x5fe3a1,
  skin: 0xc58f6c,
  hair: 0x221a16,
  hoodie: 0x3a3a3a,
  jeans: 0x4b5563,
  wood: 0xcfc6ba,
}

type Rig = {
  root: THREE.Group
  torso: THREE.Group
  head: THREE.Group
  eyes: THREE.Mesh[]
  armL: { shoulder: THREE.Group; elbow: THREE.Group }
  armR: { shoulder: THREE.Group; elbow: THREE.Group }
}

const mat = (color: number, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.82, metalness: 0.02, ...extra })

function box(w: number, h: number, d: number, m: THREE.Material, r = 0) {
  const g = r > 0 ? roundedBox(w, h, d, r) : new THREE.BoxGeometry(w, h, d)
  const mesh = new THREE.Mesh(g, m)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

/** A cheap rounded box: an extruded rounded rectangle, bevelled. */
function roundedBox(w: number, h: number, d: number, r: number) {
  const s = new THREE.Shape()
  const x = -w / 2 + r
  const y = -h / 2 + r
  const iw = w - 2 * r
  const ih = h - 2 * r
  s.moveTo(x, y - r)
  s.lineTo(x + iw, y - r)
  s.quadraticCurveTo(x + iw + r, y - r, x + iw + r, y)
  s.lineTo(x + iw + r, y + ih)
  s.quadraticCurveTo(x + iw + r, y + ih + r, x + iw, y + ih + r)
  s.lineTo(x, y + ih + r)
  s.quadraticCurveTo(x - r, y + ih + r, x - r, y + ih)
  s.lineTo(x - r, y)
  s.quadraticCurveTo(x - r, y - r, x, y - r)
  const g = new THREE.ExtrudeGeometry(s, {
    depth: d - r * 2,
    bevelEnabled: true,
    bevelThickness: r,
    bevelSize: r * 0.6,
    bevelSegments: 2,
    curveSegments: 4,
  })
  g.translate(0, 0, -(d - r * 2) / 2)
  return g
}

function capsule(radius: number, length: number, m: THREE.Material) {
  const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 6, 12), m)
  mesh.castShadow = true
  return mesh
}

/* ---------- the monitor's screen: a canvas the scene types into ---------- */

const SCREEN_SCRIPT = [
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

class Screen {
  canvas = document.createElement('canvas')
  ctx: CanvasRenderingContext2D
  texture: THREE.CanvasTexture
  private line = 0
  private char = 0
  private lines: { p: boolean; t: string }[] = []
  private acc = 0
  private cursor = 0

  constructor() {
    this.canvas.width = 1024
    this.canvas.height = 600
    this.ctx = this.canvas.getContext('2d')!
    this.texture = new THREE.CanvasTexture(this.canvas)
    this.texture.colorSpace = THREE.SRGBColorSpace
    this.texture.anisotropy = 4
    this.draw()
  }

  /** Advances the typing; returns true when the canvas changed. */
  tick(dt: number) {
    this.acc += dt
    this.cursor += dt
    const step = SCREEN_SCRIPT[this.line % SCREEN_SCRIPT.length]
    const speed = step.p ? 0.055 : 0.012
    let changed = false
    while (this.acc > speed) {
      this.acc -= speed
      if (this.char === 0) this.lines.push({ p: step.p, t: '' })
      const cur = this.lines[this.lines.length - 1]
      cur.t = step.t.slice(0, this.char + 1)
      this.char++
      changed = true
      if (this.char >= step.t.length) {
        this.char = 0
        this.line++
        this.acc -= step.p ? 0.5 : 0.18
        if (this.line % SCREEN_SCRIPT.length === 0) {
          this.acc -= 1.4
          this.lines = []
        }
        break
      }
    }
    if (this.cursor > 0.5) {
      this.cursor = 0
      changed = true
      this.blink = !this.blink
    }
    if (changed) this.draw()
    return changed
  }
  private blink = true

  draw() {
    const { ctx } = this
    const W = this.canvas.width
    const H = this.canvas.height
    ctx.fillStyle = '#161817'
    ctx.fillRect(0, 0, W, H)
    // window bar
    ctx.fillStyle = '#232523'
    ctx.fillRect(0, 0, W, 54)
    ;['#3a3d3b', '#3a3d3b', '#3a3d3b'].forEach((c, i) => {
      ctx.fillStyle = c
      ctx.beginPath()
      ctx.arc(34 + i * 30, 27, 9, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.fillStyle = '#8f9691'
    ctx.font = '500 24px ui-monospace, Menlo, Consolas, monospace' // taste-skill-ignore: a real terminal
    ctx.fillText('charbel@dev: ~', 140, 35)

    ctx.font = '500 30px ui-monospace, Menlo, Consolas, monospace' // taste-skill-ignore: a real terminal
    const visible = this.lines.slice(-12)
    visible.forEach((l, i) => {
      const y = 104 + i * 42
      if (l.p) {
        ctx.fillStyle = '#a1ffcb'
        ctx.fillText('$', 36, y)
        ctx.fillStyle = '#f2f2f2'
        ctx.fillText(l.t, 70, y)
      } else {
        ctx.fillStyle = '#9aa29d'
        ctx.fillText(l.t, 70, y)
      }
    })
    if (this.blink) {
      const last = visible[visible.length - 1]
      const y = 104 + Math.max(0, visible.length - 1) * 42
      const x = last ? 70 + ctx.measureText(last.t).width + 6 : 70
      ctx.fillStyle = '#a1ffcb'
      ctx.fillRect(x, y - 26, 16, 32)
    }
    ctx.fillStyle = '#5c625e'
    ctx.font = '500 22px ui-monospace, Menlo, Consolas, monospace' // taste-skill-ignore: a real terminal
    ctx.fillText('click to use this terminal', 36, H - 28)
    this.texture.needsUpdate = true
  }
}

/* ---------------------------- the character ---------------------------- */

function buildCharacter(): Rig {
  const root = new THREE.Group()
  const skin = mat(C.skin, { roughness: 0.7 })
  const hoodie = mat(C.hoodie)
  const jeans = mat(C.jeans)
  const hairM = mat(C.hair, { roughness: 0.95 })
  const black = mat(0x111111, { roughness: 0.4 })
  const mint = mat(C.mint, { roughness: 0.45, emissive: new THREE.Color(C.mint), emissiveIntensity: 0.08 })

  // hips sit on the chair seat (seat top ~ y 0.52)
  const hips = box(0.38, 0.16, 0.3, jeans, 0.06)
  hips.position.set(0, 0.6, 0)
  root.add(hips)

  // legs: thighs forward, shins down
  for (const side of [-1, 1]) {
    const thigh = capsule(0.075, 0.32, jeans)
    thigh.rotation.x = Math.PI / 2
    thigh.position.set(side * 0.1, 0.6, -0.22)
    root.add(thigh)
    const shin = capsule(0.065, 0.36, jeans)
    shin.position.set(side * 0.1, 0.36, -0.42)
    root.add(shin)
    const shoe = box(0.12, 0.08, 0.22, mat(0xf4f4f4), 0.03)
    shoe.position.set(side * 0.1, 0.1, -0.47)
    root.add(shoe)
  }

  const torso = new THREE.Group()
  torso.position.set(0, 0.66, 0.02)
  root.add(torso)
  const chest = box(0.46, 0.5, 0.28, hoodie, 0.1)
  chest.position.y = 0.27
  torso.add(chest)
  const hood = capsule(0.07, 0.3, hoodie)
  hood.rotation.z = Math.PI / 2
  hood.position.set(0, 0.5, 0.1)
  torso.add(hood)
  // mint drawstrings
  for (const side of [-1, 1]) {
    const s = capsule(0.008, 0.12, mint)
    s.position.set(side * 0.05, 0.38, -0.145)
    torso.add(s)
  }

  // neck + head
  const neck = capsule(0.055, 0.06, skin)
  neck.position.set(0, 0.56, 0)
  torso.add(neck)

  const head = new THREE.Group()
  head.position.set(0, 0.74, -0.01)
  head.scale.setScalar(1.3)
  torso.add(head)
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.15, 28, 22), skin)
  skull.scale.set(1, 1.1, 1.02)
  skull.castShadow = true
  head.add(skull)
  // hair cap
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.158, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.52), hairM)
  hair.scale.set(1.02, 1.08, 1.06)
  hair.position.set(0, 0.025, 0.01)
  hair.rotation.x = -0.18
  hair.castShadow = true
  head.add(hair)
  // short beard: lower half shell
  const beard = new THREE.Mesh(
    new THREE.SphereGeometry(0.153, 28, 16, 0, Math.PI * 2, Math.PI * 0.64, Math.PI * 0.36),
    mat(0x3b2d25, { roughness: 0.95 }),
  )
  beard.scale.set(1, 1.1, 1.04)
  beard.position.set(0, 0.005, -0.004)
  beard.rotation.x = 0.12
  head.add(beard)
  // ears
  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 10), skin)
    ear.scale.set(0.5, 1, 0.8)
    ear.position.set(side * 0.152, 0, 0.01)
    head.add(ear)
  }
  // eyes look toward -z (the monitor)
  const eyes: THREE.Mesh[] = []
  for (const side of [-1, 1]) {
    const white = new THREE.Mesh(new THREE.SphereGeometry(0.026, 12, 10), mat(0xffffff, { roughness: 0.3 }))
    white.scale.z = 0.5
    white.position.set(side * 0.055, 0.025, -0.142)
    head.add(white)
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.016, 12, 10), black)
    eye.position.set(side * 0.055, 0.025, -0.155)
    head.add(eye)
    eyes.push(eye)
    const brow = box(0.06, 0.012, 0.02, hairM)
    brow.position.set(side * 0.055, 0.07, -0.152)
    brow.rotation.z = side * -0.12
    head.add(brow)
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.024, 12, 10), skin)
  nose.scale.set(0.8, 1, 1)
  nose.position.set(0, -0.01, -0.165)
  head.add(nose)

  // mint headphones, worn
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.168, 0.016, 10, 32, Math.PI), mint)
  band.position.set(0, 0.02, 0.01)
  band.castShadow = true
  head.add(band)
  for (const side of [-1, 1]) {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.045, 24), mint)
    cup.rotation.z = Math.PI / 2
    cup.position.set(side * 0.17, 0.0, 0.01)
    cup.castShadow = true
    head.add(cup)
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 20), mat(0x1c1c1c))
    pad.rotation.z = Math.PI / 2
    pad.position.set(side * 0.2, 0.0, 0.01)
    head.add(pad)
  }

  // arms: shoulder pivot → upper arm → elbow pivot → forearm → hand
  const makeArm = (side: number) => {
    const shoulder = new THREE.Group()
    shoulder.position.set(side * 0.27, 0.46, 0)
    torso.add(shoulder)
    const upper = capsule(0.06, 0.22, hoodie)
    upper.position.y = -0.14
    shoulder.add(upper)
    const elbow = new THREE.Group()
    elbow.position.y = -0.28
    shoulder.add(elbow)
    const fore = capsule(0.052, 0.22, hoodie)
    fore.position.y = -0.13
    elbow.add(fore)
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 12), skin)
    hand.scale.set(1, 0.7, 1.2)
    hand.position.y = -0.28
    hand.castShadow = true
    elbow.add(hand)
    // pose: reach forward to the keyboard
    shoulder.rotation.x = 0.55
    shoulder.rotation.z = side * 0.18
    elbow.rotation.x = 1.0
    return { shoulder, elbow }
  }

  return { root, torso, head, eyes, armL: makeArm(-1), armR: makeArm(1) }
}

/* ------------------------------ the room ------------------------------ */

type Built = {
  scene: THREE.Scene
  screen: Screen
  monitor: THREE.Mesh
  screenMat: THREE.MeshStandardMaterial
  rig: Rig
  seat: THREE.Group
  clock: { hour: THREE.Object3D; minute: THREE.Object3D }
  leds: THREE.Mesh[]
  steam: THREE.Mesh[]
  lamp: THREE.PointLight
  lampBulb: THREE.MeshStandardMaterial
  sun: THREE.DirectionalLight
  hemi: THREE.HemisphereLight
  sky: THREE.MeshBasicMaterial
  skyline: THREE.MeshBasicMaterial
  plant: THREE.Group
  surfaces: { wall: THREE.MeshStandardMaterial; side: THREE.MeshStandardMaterial; floor: THREE.MeshStandardMaterial; plinth: THREE.MeshStandardMaterial }
}

function buildRoom(): Built {
  const scene = new THREE.Scene()

  // plinth + floor: the room stands on a dark slab, like a model on a table
  const plinth = box(4.0, 0.3, 4.0, mat(C.plinth, { roughness: 0.6 }))
  plinth.position.y = -0.15
  scene.add(plinth)
  const floor = box(3.8, 0.04, 3.8, mat(C.floor, { roughness: 0.9 }))
  floor.position.y = 0.02
  scene.add(floor)
  const rug = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.012, 48), mat(C.mint, { roughness: 1 }))
  rug.position.set(0.1, 0.045, 0.25)
  rug.receiveShadow = true
  scene.add(rug)

  // two walls: back (−z) and left (−x)
  const back = box(3.8, 3.0, 0.14, mat(C.wall))
  back.position.set(0, 1.52, -1.83)
  scene.add(back)
  const left = box(0.14, 3.0, 3.8, mat(C.wallSide))
  left.position.set(-1.83, 1.52, 0)
  scene.add(left)

  // window in the back wall: sky + a strip of Beirut skyline
  const win = new THREE.Group()
  win.position.set(0.72, 1.92, -1.75)
  scene.add(win)
  const frame = box(1.5, 1.1, 0.06, mat(C.ink, { roughness: 0.5 }))
  win.add(frame)
  const sky = new THREE.MeshBasicMaterial({ color: 0xbfe3f5 })
  const skyPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.38, 0.98), sky)
  skyPlane.position.z = 0.032
  win.add(skyPlane)
  const skyline = new THREE.MeshBasicMaterial({ color: 0x9fb3bf })
  const heights = [0.18, 0.3, 0.22, 0.42, 0.26, 0.16, 0.34, 0.2, 0.5, 0.24, 0.14, 0.28]
  heights.forEach((h, i) => {
    const b = new THREE.Mesh(new THREE.PlaneGeometry(0.105, h), skyline)
    b.position.set(-0.63 + i * 0.115, -0.49 + h / 2, 0.034)
    win.add(b)
  })
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(1.38, 0.08), new THREE.MeshBasicMaterial({ color: 0x5d7f93 }))
  sea.position.set(0, -0.45, 0.036)
  win.add(sea)
  const mullion = box(0.035, 1.0, 0.04, mat(C.ink))
  mullion.position.z = 0.05
  win.add(mullion)
  const sill = box(1.6, 0.05, 0.18, mat(C.ink))
  sill.position.set(0, -0.58, 0.07)
  win.add(sill)

  // shelf on the left wall with books
  const shelf = box(0.3, 0.04, 1.3, mat(C.ink))
  shelf.position.set(-1.68, 2.15, -0.75)
  scene.add(shelf)
  const bookColors = [C.charcoal, C.light, C.mint, C.grey, C.charcoal, 0xf6f6f6, C.light]
  let z = -1.33
  bookColors.forEach((c, i) => {
    const h = 0.22 + ((i * 37) % 9) / 60
    const w = 0.05 + ((i * 13) % 3) / 60
    const b = box(0.2, h, w, mat(c))
    b.position.set(-1.68, 2.17 + h / 2, z + w / 2)
    if (i === 6) b.rotation.x = 0.28
    z += w + 0.012
    scene.add(b)
  })
  // a small framed print: the cedar, drawn flat
  const print = box(0.04, 0.6, 0.46, mat(C.ink))
  print.position.set(-1.74, 1.5, 0.62)
  scene.add(print)
  const paper = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.52), new THREE.MeshBasicMaterial({ color: 0xfafafa }))
  paper.rotation.y = Math.PI / 2
  paper.position.set(-1.715, 1.5, 0.62)
  scene.add(paper)
  const cedarM = new THREE.MeshBasicMaterial({ color: C.mintDeep })
  ;[0.16, 0.24, 0.32].forEach((w, i) => {
    const tier = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.06), cedarM)
    tier.rotation.y = Math.PI / 2
    tier.position.set(-1.712, 1.65 - i * 0.09, 0.62)
    scene.add(tier)
  })
  const trunk = new THREE.Mesh(new THREE.PlaneGeometry(0.03, 0.14), new THREE.MeshBasicMaterial({ color: C.ink }))
  trunk.rotation.y = Math.PI / 2
  trunk.position.set(-1.712, 1.37, 0.62)
  scene.add(trunk)

  // wall clock on the back wall: its hands show the time in Beirut
  const clockG = new THREE.Group()
  clockG.position.set(-0.95, 2.15, -1.75)
  scene.add(clockG)
  const face = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.04, 40), mat(0xfafafa))
  face.rotation.x = Math.PI / 2
  clockG.add(face)
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.022, 10, 40), mat(C.ink))
  rim.position.z = 0.01
  clockG.add(rim)
  for (let i = 0; i < 12; i++) {
    const tick = new THREE.Mesh(new THREE.BoxGeometry(0.012, i % 3 === 0 ? 0.05 : 0.03, 0.01), mat(C.ink))
    const a = (i / 12) * Math.PI * 2
    tick.position.set(Math.sin(a) * 0.19, Math.cos(a) * 0.19, 0.025)
    tick.rotation.z = -a
    clockG.add(tick)
  }
  const hourHand = new THREE.Group()
  hourHand.position.z = 0.03
  const hh = box(0.022, 0.12, 0.01, mat(C.ink))
  hh.position.y = 0.05
  hourHand.add(hh)
  clockG.add(hourHand)
  const minuteHand = new THREE.Group()
  minuteHand.position.z = 0.036
  const mh = box(0.014, 0.17, 0.01, mat(C.mintDeep))
  mh.position.y = 0.075
  minuteHand.add(mh)
  clockG.add(minuteHand)
  const clock = { hour: hourHand, minute: minuteHand }

  // pinboard on the left wall with notes
  const board = box(0.04, 0.7, 1.0, mat(0xfafafa))
  board.position.set(-1.745, 1.45, -0.55)
  scene.add(board)
  const noteColors = [C.mint, 0xffffff, C.mint, 0xe2e2e2, C.ink, C.mint]
  noteColors.forEach((c, i) => {
    const n = box(0.012, 0.15, 0.15, mat(c))
    n.position.set(-1.72, 1.63 - Math.floor(i / 3) * 0.26, -0.85 + (i % 3) * 0.29)
    n.rotation.x = ((i * 17) % 7) / 40 - 0.07
    n.castShadow = false
    scene.add(n)
  })

  // beanbag in the front-left corner
  const bean = new THREE.Mesh(new THREE.SphereGeometry(0.42, 28, 18), mat(C.charcoal, { roughness: 1 }))
  bean.scale.set(1, 0.62, 1)
  bean.position.set(-1.15, 0.27, 0.95)
  bean.castShadow = true
  bean.receiveShadow = true
  scene.add(bean)
  const dent = new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 12), mat(0x3a3a3a, { roughness: 1 }))
  dent.scale.set(1, 0.35, 1)
  dent.position.set(-1.12, 0.5, 0.97)
  scene.add(dent)

  // tall plant in the back-left corner
  const tall = new THREE.Group()
  tall.position.set(-1.45, 0, -1.45)
  scene.add(tall)
  const tallPot = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.13, 0.36, 24), mat(C.ink))
  tallPot.position.y = 0.2
  tallPot.castShadow = true
  tall.add(tallPot)
  const leafDeep = mat(0x2f7552, { roughness: 0.85 })
  for (let i = 0; i < 9; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), i % 2 ? leafDeep : mat(0x3c8a63))
    leaf.scale.set(0.55, 1.4, 0.25)
    const a = (i / 9) * Math.PI * 2
    leaf.position.set(Math.cos(a) * 0.14, 0.62 + (i % 3) * 0.16, Math.sin(a) * 0.14)
    leaf.rotation.z = Math.cos(a) * 0.5
    leaf.rotation.x = -Math.sin(a) * 0.5
    leaf.castShadow = true
    tall.add(leaf)
  }

  // desk
  const desk = new THREE.Group()
  desk.position.set(0.05, 0, -1.08)
  scene.add(desk)
  const top = box(2.1, 0.06, 0.9, mat(C.wood, { roughness: 0.7 }), 0.02)
  top.position.y = 0.92
  desk.add(top)
  for (const [x, zz] of [
    [-1, -0.38],
    [1, -0.38],
    [-1, 0.38],
    [1, 0.38],
  ]) {
    const leg = box(0.05, 0.9, 0.05, mat(C.ink))
    leg.position.set(x, 0.45, zz)
    desk.add(leg)
  }

  // monitor
  const stand = box(0.08, 0.32, 0.06, mat(C.ink))
  stand.position.set(0, 1.11, -0.2)
  desk.add(stand)
  const foot = box(0.34, 0.025, 0.22, mat(C.ink))
  foot.position.set(0, 0.96, -0.18)
  desk.add(foot)
  const bezel = box(1.08, 0.66, 0.05, mat(0x1a1a1a, { roughness: 0.4 }), 0.015)
  bezel.position.set(0, 1.42, -0.2)
  desk.add(bezel)
  const screen = new Screen()
  const screenMat = new THREE.MeshStandardMaterial({
    map: screen.texture,
    emissiveMap: screen.texture,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.9,
    roughness: 0.35,
  })
  const monitor = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.585), screenMat)
  monitor.position.set(0, 1.42, -0.172)
  monitor.name = 'monitor'
  desk.add(monitor)

  // keyboard + keys + mouse
  const kb = box(0.62, 0.025, 0.2, mat(0x2a2a2a), 0.008)
  kb.position.set(0, 0.965, 0.12)
  desk.add(kb)
  const keyGeo = new THREE.BoxGeometry(0.036, 0.012, 0.034)
  const keys = new THREE.InstancedMesh(keyGeo, mat(0xe9e9e9, { roughness: 0.6 }), 4 * 14)
  let k = 0
  const m4 = new THREE.Matrix4()
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 14; c++) {
      m4.makeTranslation(-0.27 + c * 0.0415, 0.983, 0.055 + r * 0.043)
      keys.setMatrixAt(k++, m4)
    }
  desk.add(keys)
  const mouse = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), mat(0xe9e9e9))
  mouse.scale.set(0.75, 0.4, 1.1)
  mouse.position.set(0.48, 0.965, 0.14)
  mouse.castShadow = true
  desk.add(mouse)
  const pad = box(0.26, 0.006, 0.22, mat(C.mint, { roughness: 1 }))
  pad.position.set(0.48, 0.953, 0.14)
  desk.add(pad)

  // mug with steam
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.12, 20), mat(0xf7f7f7))
  mug.position.set(-0.62, 1.01, 0.12)
  mug.castShadow = true
  desk.add(mug)
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.01, 8, 16), mat(0xf7f7f7))
  handle.position.set(-0.68, 1.01, 0.12)
  handle.rotation.y = Math.PI / 2
  desk.add(handle)
  const steamMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false })
  const steam: THREE.Mesh[] = []
  for (let i = 0; i < 4; i++) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), steamMat.clone())
    s.position.set(-0.62, 1.1 + i * 0.06, 0.12)
    s.userData.phase = i / 4
    desk.add(s)
    steam.push(s)
  }

  // desk lamp
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.03, 24), mat(C.ink))
  lampBase.position.set(-0.85, 0.965, -0.25)
  desk.add(lampBase)
  const arm1 = capsule(0.014, 0.42, mat(C.ink))
  arm1.position.set(-0.85, 1.19, -0.27)
  arm1.rotation.x = -0.25
  desk.add(arm1)
  const arm2 = capsule(0.014, 0.34, mat(C.ink))
  arm2.position.set(-0.78, 1.43, -0.18)
  arm2.rotation.z = -1.1
  arm2.rotation.x = 0.3
  desk.add(arm2)
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.14, 20, 1, true), mat(C.ink, { side: THREE.DoubleSide }))
  shade.position.set(-0.64, 1.45, -0.12)
  shade.rotation.z = 0.5
  desk.add(shade)
  const lampBulb = new THREE.MeshStandardMaterial({ color: 0xfff3d6, emissive: new THREE.Color(0xffe2a8), emissiveIntensity: 0 })
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 10), lampBulb)
  bulb.position.set(-0.62, 1.41, -0.11)
  desk.add(bulb)
  const lamp = new THREE.PointLight(0xffd9a0, 0, 3.2, 1.6)
  lamp.position.set(-0.6, 1.35, -0.05)
  desk.add(lamp)

  // plant
  const plant = new THREE.Group()
  plant.position.set(0.86, 0.95, -0.22)
  desk.add(plant)
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.065, 0.14, 20), mat(0xf4f4f4))
  pot.position.y = 0.07
  pot.castShadow = true
  plant.add(pot)
  const leafM = mat(0x3c8a63, { roughness: 0.8 })
  for (let i = 0; i < 7; i++) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.26, 6), leafM)
    const a = (i / 7) * Math.PI * 2
    leaf.position.set(Math.cos(a) * 0.03, 0.26, Math.sin(a) * 0.03)
    leaf.rotation.z = Math.cos(a) * 0.35
    leaf.rotation.x = Math.sin(a) * 0.35
    leaf.castShadow = true
    plant.add(leaf)
  }

  // home server tower beside the desk, with blinking LEDs
  const tower = box(0.32, 0.72, 0.6, mat(0x262626, { roughness: 0.5 }), 0.02)
  tower.position.set(1.3, 0.38, -1.2)
  scene.add(tower)
  const leds: THREE.Mesh[] = []
  for (let i = 0; i < 6; i++) {
    const bay = box(0.26, 0.07, 0.01, mat(0x323232))
    bay.position.set(1.3, 0.6 - i * 0.085, -0.895)
    scene.add(bay)
    const led = new THREE.Mesh(
      new THREE.BoxGeometry(0.024, 0.016, 0.01),
      new THREE.MeshStandardMaterial({ color: C.mint, emissive: new THREE.Color(C.mintDeep), emissiveIntensity: 1.2 }),
    )
    led.position.set(1.4, 0.6 - i * 0.085, -0.888)
    led.userData.rate = 2 + ((i * 7) % 5)
    led.userData.phase = i * 1.3
    scene.add(led)
    leds.push(led)
  }

  // chair
  const seat = new THREE.Group()
  seat.position.set(0.05, 0, -0.08)
  scene.add(seat)
  const chair = new THREE.Group()
  seat.add(chair)
  const chairM = mat(C.ink, { roughness: 0.6 })
  const cushion = box(0.56, 0.08, 0.52, chairM, 0.03)
  cushion.position.y = 0.5
  chair.add(cushion)
  const backrest = box(0.5, 0.42, 0.06, chairM, 0.03)
  backrest.position.set(0, 0.84, 0.3)
  backrest.rotation.x = -0.1
  chair.add(backrest)
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.36, 12), mat(0x9a9a9a, { metalness: 0.5, roughness: 0.3 }))
  pole.position.y = 0.28
  chair.add(pole)
  for (let i = 0; i < 5; i++) {
    const legM = box(0.32, 0.03, 0.05, chairM)
    const a = (i / 5) * Math.PI * 2
    legM.position.set(Math.cos(a) * 0.16, 0.08, Math.sin(a) * 0.16)
    legM.rotation.y = -a
    chair.add(legM)
  }

  const rig = buildCharacter()
  rig.root.position.set(0, 0, -0.02)
  seat.add(rig.root)

  // light
  const hemi = new THREE.HemisphereLight(0xffffff, 0xd8d8d8, 1.4)
  scene.add(hemi)
  const sun = new THREE.DirectionalLight(0xffffff, 2.2)
  sun.position.set(3.5, 6, 4)
  sun.castShadow = true
  sun.shadow.mapSize.set(1024, 1024)
  sun.shadow.camera.left = -3.2
  sun.shadow.camera.right = 3.2
  sun.shadow.camera.top = 3.2
  sun.shadow.camera.bottom = -3.2
  sun.shadow.camera.near = 1
  sun.shadow.camera.far = 16
  sun.shadow.bias = -0.0006
  sun.shadow.normalBias = 0.02
  scene.add(sun)

  const surfaces = {
    wall: back.material as THREE.MeshStandardMaterial,
    side: left.material as THREE.MeshStandardMaterial,
    floor: floor.material as THREE.MeshStandardMaterial,
    plinth: plinth.material as THREE.MeshStandardMaterial,
  }
  return { surfaces, scene, screen, monitor, screenMat, rig, seat, leds, steam, lamp, lampBulb, sun, hemi, sky, skyline, plant, clock }
}

/* ------------------------------ the stage ------------------------------ */

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const damp = (a: number, b: number, lambda: number, dt: number) => lerp(a, b, 1 - Math.exp(-lambda * dt))

export class DeskScene {
  private renderer: THREE.WebGLRenderer
  private camera: THREE.PerspectiveCamera
  private built: Built
  private host: HTMLElement
  private clock = new THREE.Clock()
  private raf = 0
  private running = false
  private visible = true
  private pointer = new THREE.Vector2(0, 0)
  private pointerTarget = new THREE.Vector2(0, 0)
  private ray = new THREE.Raycaster()
  private hovering = false
  private focus = 0
  private focusTarget = 0
  private opts: DeskOptions
  private io?: IntersectionObserver
  private ro?: ResizeObserver
  private t = 0
  private blinkIn = 2.5
  private lastMove = -10
  private swivel = 0
  private coarse = matchMedia('(pointer: coarse)').matches
  private disposed = false

  constructor(host: HTMLElement, opts: DeskOptions) {
    this.host = host
    this.opts = opts
    const light = this.coarse || window.innerWidth < 760
    this.renderer = new THREE.WebGLRenderer({ antialias: !light || window.devicePixelRatio < 2, alpha: true, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, light ? 1.5 : 1.75))
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.05
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.setClearColor(0x000000, 0)
    const canvas = this.renderer.domElement
    canvas.setAttribute('aria-hidden', 'true')
    canvas.style.display = 'block'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    host.appendChild(canvas)

    this.camera = new THREE.PerspectiveCamera(26, 1, 0.1, 60)
    this.built = buildRoom()
    if (light) this.built.sun.shadow.mapSize.set(512, 512)
    this.setDark(opts.dark)
    this.setHour(opts.hour)
    this.resize()

    canvas.addEventListener('pointermove', this.onPointerMove)
    canvas.addEventListener('pointerleave', this.onPointerLeave)
    canvas.addEventListener('click', this.onClick)
    window.addEventListener('pointermove', this.onWindowPointer, { passive: true })

    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(host)
    this.io = new IntersectionObserver(([e]) => {
      this.visible = e.isIntersecting
      this.syncLoop()
    })
    this.io.observe(host)
    document.addEventListener('visibilitychange', this.syncLoop)
  }

  /** Compiles shaders off the main thread where the GPU allows it, then starts drawing. */
  async start() {
    try {
      await this.renderer.compileAsync(this.built.scene, this.camera)
    } catch {
      /* falls back to compiling on first render */
    }
    if (this.disposed) return
    this.started = true
    this.renderOnce()
    this.syncLoop()
  }
  private started = false

  private hour = 12

  /** Dark mode: the room is repainted in the page's dark greys. */
  setDark(dark: boolean) {
    this.opts.dark = dark
    const s = this.built.surfaces
    s.wall.color.setHex(dark ? 0x2b2d2c : C.wall)
    s.side.color.setHex(dark ? 0x242625 : C.wallSide)
    s.floor.color.setHex(dark ? 0x1d1f1e : C.floor)
    s.plinth.color.setHex(dark ? 0x0b0c0b : C.plinth)
    this.setHour(this.hour)
  }

  /** Sky, sun and lamp follow the hour in Beirut. */
  setHour(hour: number) {
    this.hour = hour
    const dark = this.opts.dark
    const b = this.built
    const night = hour < 5.5 || hour >= 19.5
    const dawn = hour >= 5.5 && hour < 8
    const dusk = hour >= 17.5 && hour < 19.5
    const skyC = night ? 0x1d2b3b : dawn ? 0xf3c9a6 : dusk ? 0xf0a77e : 0xbfe3f5
    const lineC = night ? 0x3b4d60 : dusk ? 0x8a6f68 : 0x9fb3bf
    b.sky.color.setHex(skyC)
    b.skyline.color.setHex(lineC)
    b.sun.intensity = night ? 0.55 : dawn || dusk ? 1.5 : 2.3
    b.sun.color.setHex(night ? 0xaac4ff : dusk ? 0xffc59a : 0xffffff)
    b.hemi.intensity = night ? 0.75 : dark ? 0.9 : 1.4
    b.hemi.color.setHex(dark ? 0xc9d6e8 : 0xffffff)
    b.hemi.groundColor.setHex(dark ? 0x1a1a1a : 0xd8d8d8)
    if (dark) b.sun.intensity *= 0.6
    const lampOn = night || dusk || dark
    b.lamp.intensity = lampOn ? 2.6 : 0
    b.lampBulb.emissiveIntensity = lampOn ? 2.2 : 0
    b.screenMat.emissiveIntensity = night ? 1.25 : 0.9
    b.screenMat.userData.base = b.screenMat.emissiveIntensity
    // clock hands (12 o'clock is +y; clockwise is −z rotation)
    b.clock.hour.rotation.z = -((hour % 12) / 12) * Math.PI * 2
    b.clock.minute.rotation.z = -((hour % 1) * Math.PI * 2)
    if (!this.running) this.renderOnce()
  }

  setFocus(on: boolean) {
    this.focusTarget = on ? 1 : 0
    if (this.opts.reducedMotion) this.focus = this.focusTarget
    this.syncLoop()
    if (!this.running) this.renderOnce()
  }

  private onWindowPointer = (e: PointerEvent) => {
    this.pointerTarget.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1)
  }

  private ndc(e: PointerEvent | MouseEvent) {
    const r = this.renderer.domElement.getBoundingClientRect()
    return new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
  }

  private hitMonitor(e: PointerEvent | MouseEvent) {
    this.ray.setFromCamera(this.ndc(e), this.camera)
    return this.ray.intersectObject(this.built.monitor, false).length > 0
  }

  private onPointerMove = (e: PointerEvent) => {
    this.lastMove = this.t
    const hit = this.hitMonitor(e)
    if (hit !== this.hovering) {
      this.hovering = hit
      this.renderer.domElement.style.cursor = hit ? 'pointer' : ''
      this.opts.onHoverChange?.(hit)
    }
  }

  private onPointerLeave = () => {
    if (this.hovering) {
      this.hovering = false
      this.renderer.domElement.style.cursor = ''
      this.opts.onHoverChange?.(false)
    }
  }

  private onClick = (e: MouseEvent) => {
    if (this.hitMonitor(e)) this.opts.onMonitorClick?.()
  }

  private syncLoop = () => {
    const should =
      this.started &&
      !this.disposed && this.visible && document.visibilityState === 'visible' && (!this.opts.reducedMotion || this.focus !== this.focusTarget)
    if (should && !this.running) {
      this.running = true
      this.clock.getDelta()
      this.raf = requestAnimationFrame(this.loop)
    } else if (!should && this.running) {
      this.running = false
      cancelAnimationFrame(this.raf)
    }
  }

  private resize() {
    const w = this.host.clientWidth
    const h = this.host.clientHeight
    if (!w || !h) return
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    if (!this.running) this.renderOnce()
  }

  private placeCamera(dt: number) {
    const aspect = this.camera.aspect
    // pull back on narrow screens so the whole room fits
    const dist = aspect < 0.8 ? 14.5 : aspect < 1.2 ? 11.6 : 9.6
    const px = this.opts.reducedMotion ? 0 : this.pointer.x
    const py = this.opts.reducedMotion ? 0 : this.pointer.y
    const az = 0.68 + px * 0.12
    const el = 0.42 + py * 0.05
    const orbit = new THREE.Vector3(
      Math.sin(az) * Math.cos(el) * dist,
      Math.sin(el) * dist + 1.2,
      Math.cos(az) * Math.cos(el) * dist,
    )
    const orbitLook = new THREE.Vector3(0.0, 0.95, -0.25)
    // close-up on the monitor
    const close = new THREE.Vector3(0.62, 1.68, -0.05)
    const closeLook = new THREE.Vector3(0.05, 1.42, -1.3)
    const f = this.easeInOut(this.focus)
    this.camera.position.lerpVectors(orbit, close, f)
    const look = orbitLook.clone().lerp(closeLook, f)
    this.camera.lookAt(look)
    this.camera.fov = lerp(26, 34, f)
    this.camera.updateProjectionMatrix()
    void dt
  }

  private easeInOut(x: number) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
  }

  private animate(dt: number) {
    const b = this.built
    const { rig } = b
    this.t += dt
    const t = this.t
    this.pointer.x = damp(this.pointer.x, this.pointerTarget.x, 3, dt)
    this.pointer.y = damp(this.pointer.y, this.pointerTarget.y, 3, dt)

    // the monitor types
    b.screen.tick(dt)

    // swivel round to face the visitor while they move the pointer over the room
    // (on touch screens: now and then, on its own)
    const attentive = this.coarse ? Math.sin(t * 0.45) > 0.55 : t - this.lastMove < 2.6
    const swivelTarget = attentive && this.focusTarget === 0 ? 1 : 0
    this.swivel = damp(this.swivel, swivelTarget, swivelTarget ? 2.6 : 1.8, dt)
    const sv = this.swivel
    b.seat.rotation.y = -1.55 * this.easeInOut(Math.min(1, sv))
    rig.armL.shoulder.rotation.x = lerp(0.55, 0.12, sv)
    rig.armR.shoulder.rotation.x = lerp(0.55, 0.12, sv)

    // typing: forearms tap, alternating
    const tapL = Math.max(0, Math.sin(t * 13.0)) * 0.08 + Math.sin(t * 2.1) * 0.02
    const tapR = Math.max(0, Math.sin(t * 11.0 + 1.7)) * 0.08 + Math.sin(t * 1.7) * 0.02
    rig.armL.elbow.rotation.x = lerp(1.0 + tapL, 1.35, sv)
    rig.armR.elbow.rotation.x = lerp(1.0 + tapR, 1.35, sv)
    // breathing
    rig.torso.scale.y = 1 + Math.sin(t * 1.6) * 0.008
    rig.torso.rotation.x = Math.sin(t * 0.5) * 0.015

    // head: glance at the visitor's pointer, or turn to the camera when focused
    const lookYaw = -this.pointer.x * 0.55 + 0.55
    const lookPitch = this.pointer.y * 0.18
    const glance = 0.35 + 0.35 * Math.max(0, Math.sin(t * 0.33))
    const deskYaw = lerp(lerp(0, lookYaw, glance), 0.0, this.focus)
    const visitorYaw = -0.75 - this.pointer.x * 0.35
    const yaw = lerp(deskYaw, visitorYaw, sv)
    rig.head.rotation.y = damp(rig.head.rotation.y, yaw, 4, dt)
    rig.head.rotation.x = damp(rig.head.rotation.x, lerp(-0.12 + lookPitch * glance, -0.05, this.focus), 4, dt)

    // blink
    this.blinkIn -= dt
    const closing = this.blinkIn < 0.12 && this.blinkIn > 0
    rig.eyes.forEach((e) => (e.scale.y = closing ? 0.15 : 1))
    if (this.blinkIn <= 0) this.blinkIn = 2.2 + Math.random() * 3

    // server LEDs
    b.leds.forEach((l) => {
      const v = Math.sin(t * l.userData.rate + l.userData.phase)
      ;(l.material as THREE.MeshStandardMaterial).emissiveIntensity = v > 0.2 ? 1.6 : 0.15
    })
    // steam
    b.steam.forEach((s) => {
      const p = (t * 0.25 + s.userData.phase) % 1
      s.position.y = 1.08 + p * 0.3
      s.position.x = -0.62 + Math.sin((p + s.userData.phase) * 6) * 0.02
      s.scale.setScalar(0.6 + p * 1.4)
      ;(s.material as THREE.MeshBasicMaterial).opacity = 0.5 * (1 - p)
    })
    // plant sways
    b.plant.rotation.z = Math.sin(t * 0.8) * 0.03
    // monitor glows under the pointer
    const targetGlow = this.hovering ? 1.4 : b.screenMat.userData.base ?? b.screenMat.emissiveIntensity
    if (b.screenMat.userData.base === undefined) b.screenMat.userData.base = b.screenMat.emissiveIntensity
    b.screenMat.emissiveIntensity = damp(b.screenMat.emissiveIntensity, targetGlow, 8, dt)
  }

  private loop = () => {
    if (!this.running) return
    const dt = Math.min(this.clock.getDelta(), 0.05)
    if (!this.opts.reducedMotion) this.animate(dt)
    this.focus = this.opts.reducedMotion ? this.focusTarget : damp(this.focus, this.focusTarget, 3.2, dt)
    if (Math.abs(this.focus - this.focusTarget) < 0.001) this.focus = this.focusTarget
    this.placeCamera(dt)
    this.renderer.render(this.built.scene, this.camera)
    if (this.opts.reducedMotion && this.focus === this.focusTarget) {
      this.running = false
      return
    }
    this.raf = requestAnimationFrame(this.loop)
  }

  private renderOnce() {
    if (!this.started) return
    this.placeCamera(0)
    this.renderer.render(this.built.scene, this.camera)
  }

  dispose() {
    this.disposed = true
    this.running = false
    cancelAnimationFrame(this.raf)
    this.io?.disconnect()
    this.ro?.disconnect()
    document.removeEventListener('visibilitychange', this.syncLoop)
    window.removeEventListener('pointermove', this.onWindowPointer)
    const canvas = this.renderer.domElement
    canvas.removeEventListener('pointermove', this.onPointerMove)
    canvas.removeEventListener('pointerleave', this.onPointerLeave)
    canvas.removeEventListener('click', this.onClick)
    this.built.scene.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.geometry) m.geometry.dispose()
      const mm = m.material as THREE.Material | THREE.Material[] | undefined
      if (Array.isArray(mm)) mm.forEach((x) => x.dispose())
      else mm?.dispose()
    })
    this.built.screen.texture.dispose()
    this.renderer.dispose()
    canvas.remove()
  }
}

export function webglAvailable() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}
