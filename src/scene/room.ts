/**
 * The room: a cut-away corner on a dark plinth. Every object a visitor can
 * open is a group tagged with `userData.spot`.
 */
import * as THREE from 'three'
import { C, box, capsule, mat, sphere } from './kit'
import { buildCharacter, type Rig } from './character'
import { GraphScreen, PhoneScreen, TerminalScreen } from './screens'
import type { SpotId } from './hotspots'

export type Room = {
  scene: THREE.Scene
  spots: Map<SpotId, THREE.Object3D>
  terminal: TerminalScreen
  graph: GraphScreen
  phoneScreen: PhoneScreen
  phone: THREE.Group
  screenMat: THREE.MeshStandardMaterial
  rig: Rig
  seat: THREE.Group
  mug: THREE.Group
  mouse: THREE.Mesh
  leds: THREE.Mesh[]
  steam: THREE.Mesh[]
  clouds: THREE.Mesh[]
  lamp: THREE.PointLight
  lampBulb: THREE.MeshStandardMaterial
  sun: THREE.DirectionalLight
  hemi: THREE.HemisphereLight
  sky: THREE.MeshBasicMaterial
  skyline: THREE.MeshBasicMaterial
  plant: THREE.Group
  tallPlant: THREE.Group
  beanbag: THREE.Group
  books: THREE.Mesh[]
  clock: { hour: THREE.Object3D; minute: THREE.Object3D; second: THREE.Object3D }
  surfaces: Record<'wall' | 'side' | 'floor' | 'plinth', THREE.MeshStandardMaterial>
}

function spot(id: SpotId, parent: THREE.Object3D, spots: Map<SpotId, THREE.Object3D>) {
  const g = new THREE.Group()
  g.userData.spot = id
  g.name = id
  parent.add(g)
  spots.set(id, g)
  return g
}

/** A small canvas texture with a few words, for notes and book spines. */
function label(text: string, bg: string, fg: string, w = 256, h = 256, size = 44, lines?: string[]) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const x = c.getContext('2d')!
  x.fillStyle = bg
  x.fillRect(0, 0, w, h)
  x.fillStyle = fg
  x.font = `600 ${size}px ui-sans-serif, system-ui, sans-serif`
  x.textAlign = 'center'
  x.textBaseline = 'middle'
  const ls = lines ?? [text]
  ls.forEach((l, i) => x.fillText(l, w / 2, h / 2 + (i - (ls.length - 1) / 2) * size * 1.15))
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export function buildRoom(): Room {
  const scene = new THREE.Scene()
  const spots = new Map<SpotId, THREE.Object3D>()

  /* plinth, floor, walls */
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
  const back = box(3.8, 3.0, 0.14, mat(C.wall))
  back.position.set(0, 1.52, -1.83)
  scene.add(back)
  const left = box(0.14, 3.0, 3.8, mat(C.wallSide))
  left.position.set(-1.83, 1.52, 0)
  scene.add(left)
  // skirting
  const skirtB = box(3.8, 0.08, 0.03, mat(C.ink))
  skirtB.position.set(0, 0.08, -1.75)
  scene.add(skirtB)
  const skirtL = box(0.03, 0.08, 3.8, mat(C.ink))
  skirtL.position.set(-1.75, 0.08, 0)
  scene.add(skirtL)

  /* window: sky, drifting clouds, the Beirut skyline and the sea */
  const win = spot('window', scene, spots)
  win.position.set(0.72, 1.92, -1.75)
  win.add(box(1.5, 1.1, 0.06, mat(C.ink, { roughness: 0.5 })))
  const sky = new THREE.MeshBasicMaterial({ color: 0xbfe3f5 })
  const skyPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.38, 0.98), sky)
  skyPlane.position.z = 0.032
  win.add(skyPlane)
  const cloudM = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })
  const clouds: THREE.Mesh[] = []
  for (let i = 0; i < 3; i++) {
    const cl = new THREE.Mesh(new THREE.CircleGeometry(0.06, 20), cloudM.clone())
    cl.scale.set(2.2 + i * 0.4, 0.8, 1)
    cl.position.set(-0.5 + i * 0.45, 0.28 - i * 0.09, 0.033)
    cl.userData.speed = 0.035 + i * 0.012
    win.add(cl)
    clouds.push(cl)
  }
  const skyline = new THREE.MeshBasicMaterial({ color: 0x9fb3bf })
  ;[0.18, 0.3, 0.22, 0.42, 0.26, 0.16, 0.34, 0.2, 0.5, 0.24, 0.14, 0.28].forEach((h, i) => {
    const b = new THREE.Mesh(new THREE.PlaneGeometry(0.105, h), skyline)
    b.position.set(-0.63 + i * 0.115, -0.49 + h / 2, 0.035)
    win.add(b)
  })
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(1.38, 0.08), new THREE.MeshBasicMaterial({ color: 0x5d7f93 }))
  sea.position.set(0, -0.45, 0.037)
  win.add(sea)
  const mullion = box(0.035, 1.0, 0.04, mat(C.ink))
  mullion.position.z = 0.05
  win.add(mullion)
  const sill = box(1.6, 0.05, 0.18, mat(C.ink))
  sill.position.set(0, -0.58, 0.07)
  win.add(sill)

  /* bookshelf on the left wall: the stack, on the spines */
  const shelfG = spot('books', scene, spots)
  const shelf = box(0.3, 0.04, 1.3, mat(C.ink))
  shelf.position.set(-1.68, 2.15, -0.75)
  shelfG.add(shelf)
  const titles = ['WordPress', 'WooCommerce', 'React', 'ERPNext', 'Linux', 'Docker', 'Proxmox']
  const bookColors = ['#2e2e2e', '#bdbdbd', '#a1ffcb', '#8a8a8a', '#232323', '#f6f6f6', '#5fe3a1']
  const books: THREE.Mesh[] = []
  let z = -1.33
  titles.forEach((title, i) => {
    const h = 0.24 + ((i * 37) % 9) / 70
    const w = 0.065 + ((i * 13) % 3) / 90
    const bg = bookColors[i]
    const dark = ['#2e2e2e', '#232323', '#8a8a8a'].includes(bg)
    // the spine (+x face, into the room) carries the title; the other faces share one material
    const spine = label('', bg, dark ? '#f2f2f2' : '#232323', 320, 64, 30, [title])
    const cover = mat(parseInt(bg.slice(1), 16))
    const mats = [new THREE.MeshStandardMaterial({ map: spine, roughness: 0.8 }), cover, cover, cover, cover, cover]
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.2, h, w), mats)
    b.castShadow = true
    b.position.set(-1.68, 2.17 + h / 2, z + w / 2)
    b.userData.home = b.position.x
    z += w + 0.012
    shelfG.add(b)
    books.push(b)
  })
  // rotate the spine text so it reads bottom-to-top
  books.forEach((b) => {
    const m = (b.material as THREE.MeshStandardMaterial[])[0]
    if (m.map) {
      m.map.center.set(0.5, 0.5)
      m.map.rotation = Math.PI / 2
    }
  })

  /* the cedar print */
  const printG = spot('print', scene, spots)
  printG.position.set(-1.74, 1.5, 0.62)
  printG.add(box(0.04, 0.6, 0.46, mat(C.ink)))
  const paper = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.52), new THREE.MeshBasicMaterial({ color: 0xfafafa }))
  paper.rotation.y = Math.PI / 2
  paper.position.x = 0.025
  printG.add(paper)
  const cedarM = new THREE.MeshBasicMaterial({ color: C.mintDeep })
  ;[0.16, 0.24, 0.32].forEach((w, i) => {
    const tier = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.06), cedarM)
    tier.rotation.y = Math.PI / 2
    tier.position.set(0.028, 0.15 - i * 0.09, 0)
    printG.add(tier)
  })
  const trunk = new THREE.Mesh(new THREE.PlaneGeometry(0.03, 0.14), new THREE.MeshBasicMaterial({ color: C.ink }))
  trunk.rotation.y = Math.PI / 2
  trunk.position.set(0.028, -0.13, 0)
  printG.add(trunk)

  /* the clock: hours, minutes and a ticking second hand, all on Beirut time */
  const clockG = spot('clock', scene, spots)
  clockG.position.set(-0.95, 2.15, -1.75)
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
  const hand = (w: number, l: number, color: number, zz: number) => {
    const g = new THREE.Group()
    g.position.z = zz
    const m = box(w, l, 0.008, mat(color))
    m.position.y = l / 2 - 0.02
    m.castShadow = false
    g.add(m)
    clockG.add(g)
    return g
  }
  const clock = { hour: hand(0.022, 0.14, C.ink, 0.03), minute: hand(0.014, 0.2, C.ink, 0.036), second: hand(0.006, 0.21, C.mintDeep, 0.042) }
  const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.02, 12), mat(C.mintDeep))
  pin.rotation.x = Math.PI / 2
  pin.position.z = 0.048
  clockG.add(pin)

  /* pinboard: notes for the three projects */
  const boardG = spot('board', scene, spots)
  boardG.position.set(-1.745, 1.45, -0.55)
  boardG.add(box(0.04, 0.7, 1.0, mat(0xfafafa)))
  const notes: [string[], string, string][] = [
    [['HÚM'], '#a1ffcb', '#232323'],
    [['URY', 'POS'], '#ffffff', '#232323'],
    [['Mobi', 'Touch'], '#a1ffcb', '#232323'],
    [['ERP', 'Next'], '#e2e2e2', '#232323'],
    [['open', 'for work'], '#232323', '#a1ffcb'],
    [['Linux'], '#a1ffcb', '#232323'],
  ]
  notes.forEach(([lines, bg, fg], i) => {
    const tex = label('', bg, fg, 256, 256, 58, lines)
    const n = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.16), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }))
    n.rotation.y = Math.PI / 2
    n.rotation.z = (((i * 17) % 7) / 40 - 0.07) * 1.5
    n.position.set(0.026, 0.18 - Math.floor(i / 3) * 0.28, -0.3 + (i % 3) * 0.3)
    boardG.add(n)
    const tack = sphere(0.012, mat(C.ink))
    tack.position.set(0.034, n.position.y + 0.06, n.position.z)
    boardG.add(tack)
  })

  /* beanbag */
  const beanbag = spot('beanbag', scene, spots) as THREE.Group
  beanbag.position.set(-1.15, 0, 0.95)
  const bean = sphere(0.42, mat(C.charcoal, { roughness: 1 }), 1, 0.62, 1)
  bean.position.y = 0.27
  bean.receiveShadow = true
  beanbag.add(bean)
  const dent = sphere(0.28, mat(0x3a3a3a, { roughness: 1 }), 1, 0.35, 1)
  dent.position.set(0.03, 0.5, 0.02)
  beanbag.add(dent)

  /* tall plant in the back-left corner */
  const tallPlant = new THREE.Group()
  tallPlant.position.set(-1.45, 0, -1.45)
  scene.add(tallPlant)
  const tallPot = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.13, 0.36, 24), mat(C.ink))
  tallPot.position.y = 0.2
  tallPot.castShadow = true
  tallPlant.add(tallPot)
  for (let i = 0; i < 9; i++) {
    const leaf = sphere(0.16, mat(i % 2 ? 0x2f7552 : 0x3c8a63, { roughness: 0.85 }), 0.55, 1.4, 0.25)
    const a = (i / 9) * Math.PI * 2
    leaf.position.set(Math.cos(a) * 0.14, 0.62 + (i % 3) * 0.16, Math.sin(a) * 0.14)
    leaf.rotation.z = Math.cos(a) * 0.5
    leaf.rotation.x = -Math.sin(a) * 0.5
    tallPlant.add(leaf)
  }

  /* desk */
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
  // cable tray under the desk
  const tray = box(1.2, 0.05, 0.12, mat(C.ink))
  tray.position.set(0, 0.82, -0.32)
  desk.add(tray)

  /* the main monitor (opens the terminal) */
  const monitorG = spot('monitor', desk, spots)
  const stand = box(0.08, 0.32, 0.06, mat(C.ink))
  stand.position.set(0, 1.11, -0.2)
  monitorG.add(stand)
  const foot = box(0.34, 0.025, 0.22, mat(C.ink))
  foot.position.set(0, 0.96, -0.18)
  monitorG.add(foot)
  const bezel = box(1.08, 0.66, 0.05, mat(0x1a1a1a, { roughness: 0.4 }), 0.015)
  bezel.position.set(0, 1.42, -0.2)
  monitorG.add(bezel)
  const terminal = new TerminalScreen()
  const screenMat = new THREE.MeshStandardMaterial({
    map: terminal.texture,
    emissiveMap: terminal.texture,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.9,
    roughness: 0.35,
  })
  const monitorPanel = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.585), screenMat)
  monitorPanel.position.set(0, 1.42, -0.172)
  monitorG.add(monitorPanel)

  /* second, vertical screen: the server's load (opens the server card) */
  const serverG = spot('server', scene, spots)
  const vert = new THREE.Group()
  vert.position.set(0.82, 0, -1.22)
  vert.rotation.y = -0.42
  serverG.add(vert)
  const vStand = box(0.06, 0.3, 0.05, mat(C.ink))
  vStand.position.set(0, 1.1, 0)
  vert.add(vStand)
  const vFoot = box(0.26, 0.02, 0.18, mat(C.ink))
  vFoot.position.set(0, 0.96, 0.01)
  vert.add(vFoot)
  const vBezel = box(0.36, 0.6, 0.04, mat(0x1a1a1a, { roughness: 0.4 }), 0.012)
  vBezel.position.set(0, 1.42, 0)
  vert.add(vBezel)
  const graph = new GraphScreen()
  const vScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.32, 0.54),
    new THREE.MeshStandardMaterial({ map: graph.texture, emissiveMap: graph.texture, emissive: new THREE.Color(0xffffff), emissiveIntensity: 0.85 }),
  )
  vScreen.position.set(0, 1.42, 0.022)
  vert.add(vScreen)

  /* keyboard, mouse */
  const kb = box(0.62, 0.025, 0.2, mat(0x2a2a2a), 0.008)
  kb.position.set(0, 0.965, 0.12)
  desk.add(kb)
  const keys = new THREE.InstancedMesh(new THREE.BoxGeometry(0.036, 0.012, 0.034), mat(0xe9e9e9, { roughness: 0.6 }), 56)
  const m4 = new THREE.Matrix4()
  let k = 0
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 14; c++) {
      m4.makeTranslation(-0.27 + c * 0.0415, 0.983, 0.055 + r * 0.043)
      keys.setMatrixAt(k++, m4)
    }
  desk.add(keys)
  const pad = box(0.26, 0.006, 0.22, mat(C.mint, { roughness: 1 }))
  pad.position.set(0.48, 0.953, 0.14)
  desk.add(pad)
  const mouse = sphere(0.045, mat(0xe9e9e9), 0.75, 0.4, 1.1)
  mouse.position.set(0.48, 0.965, 0.14)
  mouse.userData.home = mouse.position.clone()
  desk.add(mouse)

  /* the mug (a toy: he takes a sip) */
  const mugSpot = spot('mug', desk, spots)
  const mug = new THREE.Group()
  mug.position.set(-0.62, 1.01, 0.12)
  mugSpot.add(mug)
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.12, 20), mat(0xf7f7f7))
  cup.castShadow = true
  mug.add(cup)
  const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.048, 20), mat(0x3b2416))
  coffee.rotation.x = -Math.PI / 2
  coffee.position.y = 0.05
  mug.add(coffee)
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.01, 8, 16), mat(0xf7f7f7))
  handle.position.x = -0.06
  handle.rotation.y = Math.PI / 2
  mug.add(handle)
  const steamMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false })
  const steam: THREE.Mesh[] = []
  for (let i = 0; i < 4; i++) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), steamMat.clone())
    s.userData.phase = i / 4
    mug.add(s)
    steam.push(s)
  }

  /* the phone (opens the contact card); buzzes now and then */
  const phoneSpot = spot('phone', desk, spots)
  const phone = new THREE.Group()
  phone.position.set(-0.42, 0.955, 0.26)
  phone.rotation.y = 0.35
  phoneSpot.add(phone)
  phone.add(box(0.09, 0.012, 0.18, mat(0x1a1a1a, { roughness: 0.3 }), 0.005))
  const phoneScreen = new PhoneScreen()
  const pScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.08, 0.165),
    new THREE.MeshStandardMaterial({ map: phoneScreen.texture, emissiveMap: phoneScreen.texture, emissive: new THREE.Color(0xffffff), emissiveIntensity: 1 }),
  )
  pScreen.rotation.x = -Math.PI / 2
  pScreen.position.y = 0.007
  phone.add(pScreen)

  /* desk lamp (a toy: switches on and off) */
  const lampG = spot('lamp', desk, spots)
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.03, 24), mat(C.ink))
  lampBase.position.set(-0.85, 0.965, -0.25)
  lampG.add(lampBase)
  const arm1 = capsule(0.014, 0.42, mat(C.ink))
  arm1.position.set(-0.85, 1.19, -0.27)
  arm1.rotation.x = -0.25
  lampG.add(arm1)
  const arm2 = capsule(0.014, 0.34, mat(C.ink))
  arm2.position.set(-0.78, 1.43, -0.18)
  arm2.rotation.z = -1.1
  arm2.rotation.x = 0.3
  lampG.add(arm2)
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.14, 20, 1, true), mat(C.ink, { side: THREE.DoubleSide }))
  shade.position.set(-0.64, 1.45, -0.12)
  shade.rotation.z = 0.5
  lampG.add(shade)
  const lampBulb = new THREE.MeshStandardMaterial({ color: 0xfff3d6, emissive: new THREE.Color(0xffe2a8), emissiveIntensity: 0 })
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 10), lampBulb)
  bulb.position.set(-0.62, 1.41, -0.11)
  lampG.add(bulb)
  const lamp = new THREE.PointLight(0xffd9a0, 0, 3.2, 1.6)
  lamp.position.set(-0.6, 1.35, -0.05)
  desk.add(lamp)

  /* small plant on the desk (a toy: it wiggles) */
  const plantSpot = spot('plant', desk, spots)
  const plant = new THREE.Group()
  plant.position.set(0.95, 0.95, 0.22)
  plantSpot.add(plant)
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.056, 0.12, 20), mat(0xf4f4f4))
  pot.position.y = 0.06
  pot.castShadow = true
  plant.add(pot)
  const leafM = mat(0x3c8a63, { roughness: 0.8 })
  for (let i = 0; i < 7; i++) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.026, 0.22, 6), leafM)
    const a = (i / 7) * Math.PI * 2
    leaf.position.set(Math.cos(a) * 0.026, 0.22, Math.sin(a) * 0.026)
    leaf.rotation.z = Math.cos(a) * 0.35
    leaf.rotation.x = Math.sin(a) * 0.35
    leaf.castShadow = true
    plant.add(leaf)
  }

  /* home server tower beside the desk (part of the server spot) */
  const tower = box(0.32, 0.72, 0.6, mat(0x262626, { roughness: 0.5 }), 0.02)
  tower.position.set(1.3, 0.38, -1.2)
  serverG.add(tower)
  const leds: THREE.Mesh[] = []
  for (let i = 0; i < 6; i++) {
    const bay = box(0.26, 0.07, 0.01, mat(0x323232))
    bay.position.set(1.3, 0.6 - i * 0.085, -0.895)
    serverG.add(bay)
    const led = new THREE.Mesh(
      new THREE.BoxGeometry(0.024, 0.016, 0.01),
      new THREE.MeshStandardMaterial({ color: C.mint, emissive: new THREE.Color(C.mintDeep), emissiveIntensity: 1.2 }),
    )
    led.position.set(1.4, 0.6 - i * 0.085, -0.888)
    led.userData.rate = 2 + ((i * 7) % 5)
    led.userData.phase = i * 1.3
    serverG.add(led)
    leds.push(led)
  }

  /* chair and the developer (Charbel) */
  const seat = new THREE.Group()
  seat.position.set(0.05, 0, -0.08)
  scene.add(seat)
  const chairM = mat(C.ink, { roughness: 0.6 })
  const cushion = box(0.56, 0.08, 0.52, chairM, 0.03)
  cushion.position.y = 0.5
  seat.add(cushion)
  const backrest = box(0.5, 0.42, 0.06, chairM, 0.03)
  backrest.position.set(0, 0.84, 0.3)
  backrest.rotation.x = -0.1
  seat.add(backrest)
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.36, 12), mat(0x9a9a9a, { metalness: 0.5, roughness: 0.3 }))
  pole.position.y = 0.28
  seat.add(pole)
  for (let i = 0; i < 5; i++) {
    const legM = box(0.32, 0.03, 0.05, chairM)
    const a = (i / 5) * Math.PI * 2
    legM.position.set(Math.cos(a) * 0.16, 0.08, Math.sin(a) * 0.16)
    legM.rotation.y = -a
    seat.add(legM)
    const wheel = sphere(0.03, chairM)
    wheel.position.set(Math.cos(a) * 0.3, 0.04, -Math.sin(a) * 0.3)
    seat.add(wheel)
  }
  const charbel = spot('charbel', seat, spots)
  const rig = buildCharacter()
  rig.root.position.set(0, 0, -0.02)
  charbel.add(rig.root)

  /* light */
  const hemi = new THREE.HemisphereLight(0xffffff, 0xd8d8d8, 1.4)
  scene.add(hemi)
  const sun = new THREE.DirectionalLight(0xffffff, 2.2)
  sun.position.set(3.5, 6, 4)
  sun.castShadow = true
  sun.shadow.mapSize.set(1024, 1024)
  Object.assign(sun.shadow.camera, { left: -3.2, right: 3.2, top: 3.2, bottom: -3.2, near: 1, far: 16 })
  sun.shadow.bias = -0.0006
  sun.shadow.normalBias = 0.02
  scene.add(sun)

  return {
    scene,
    spots,
    terminal,
    graph,
    phoneScreen,
    phone,
    screenMat,
    rig,
    seat,
    mug,
    mouse,
    leds,
    steam,
    clouds,
    lamp,
    lampBulb,
    sun,
    hemi,
    sky,
    skyline,
    plant,
    tallPlant,
    beanbag,
    books,
    clock,
    surfaces: {
      wall: back.material as THREE.MeshStandardMaterial,
      side: left.material as THREE.MeshStandardMaterial,
      floor: floor.material as THREE.MeshStandardMaterial,
      plinth: plinth.material as THREE.MeshStandardMaterial,
    },
  }
}
