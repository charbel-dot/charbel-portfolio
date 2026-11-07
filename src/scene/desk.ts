/**
 * The desk scene: renderer, camera and interaction. Loaded lazily; the page
 * shows a still poster of the room until `start()` resolves.
 */
import * as THREE from 'three'
import { Animator } from './character'
import { buildRoom, type Room } from './room'
import { C, damp, easeInOut, lerp } from './kit'
import { isCardSpot, type SpotId } from './hotspots'

export type DeskOptions = {
  reducedMotion: boolean
  dark: boolean
  /** Beirut hour as a float, 0–24. */
  hour: number
  onSelect?: (id: SpotId) => void
  onHover?: (id: SpotId | null, x: number, y: number) => void
}

type View = { pos: THREE.Vector3; look: THREE.Vector3; fov: number }

const HIGHLIGHT = new THREE.Color(C.mint)

export class DeskScene {
  private renderer: THREE.WebGLRenderer
  private camera: THREE.PerspectiveCamera
  private room: Room
  private anim: Animator
  private host: HTMLElement
  private opts: DeskOptions
  private clock = new THREE.Clock()
  private raf = 0
  private running = false
  private started = false
  private visible = true
  private disposed = false
  private io?: IntersectionObserver
  private ro?: ResizeObserver
  private coarse = matchMedia('(pointer: coarse)').matches

  private pointer = new THREE.Vector2()
  private pointerTarget = new THREE.Vector2()
  private ray = new THREE.Raycaster()
  private hovered: SpotId | null = null
  private t = 0
  private lastMove = -10
  private swivel = 0

  // focus: 0 = the whole room, 1 = flown to `target`
  private focus = 0
  private focusTarget = 0
  private target: SpotId | null = null
  private targetView: View | null = null
  private panel: 'right' | 'bottom' | null = null
  private offset = 0

  private hour = 12
  private hourStamp = performance.now()
  private lampOverride: boolean | null = null
  private plantKick = 0
  private beanKick = 0
  private phoneBuzz = 0
  private phoneLit = 0
  private nextBuzz = 9
  private burst = 0

  constructor(host: HTMLElement, opts: DeskOptions) {
    this.host = host
    this.opts = opts
    const light = this.coarse || window.innerWidth < 760
    this.renderer = new THREE.WebGLRenderer({
      antialias: !light || window.devicePixelRatio < 2,
      alpha: true,
      powerPreference: 'high-performance',
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, light ? 1.5 : 1.75))
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.05
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.setClearColor(0x000000, 0)
    const canvas = this.renderer.domElement
    canvas.setAttribute('aria-hidden', 'true')
    Object.assign(canvas.style, { display: 'block', width: '100%', height: '100%', touchAction: 'pan-y' })
    host.appendChild(canvas)

    this.camera = new THREE.PerspectiveCamera(26, 1, 0.1, 60)
    this.room = buildRoom()
    if (light) this.room.sun.shadow.mapSize.set(512, 512)
    this.anim = new Animator(this.room.rig)
    this.anim.attachMug(this.room.mug)
    const mouseHome = this.room.mouse.userData.home as THREE.Vector3
    this.anim.onMouseMove = (dx, dz) => this.room.mouse.position.set(mouseHome.x + dx, mouseHome.y, mouseHome.z + dz)

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

  /** Compiles shaders (in parallel where the GPU allows), then starts drawing. */
  async start() {
    try {
      await this.renderer.compileAsync(this.room.scene, this.camera)
    } catch {
      /* compiled on first render instead */
    }
    if (this.disposed) return
    this.started = true
    this.renderOnce()
    this.syncLoop()
  }

  /* ------------------------------ public API ------------------------------ */

  setDark(dark: boolean) {
    this.opts.dark = dark
    const s = this.room.surfaces
    s.wall.color.setHex(dark ? 0x2b2d2c : C.wall)
    s.side.color.setHex(dark ? 0x242625 : C.wallSide)
    s.floor.color.setHex(dark ? 0x1d1f1e : C.floor)
    s.plinth.color.setHex(dark ? 0x0b0c0b : C.plinth)
    this.setHour(this.hour)
  }

  /** Sky, sun, lamp and clock follow the hour in Beirut. */
  setHour(hour: number) {
    this.hour = hour
    this.hourStamp = performance.now()
    const r = this.room
    const dark = this.opts.dark
    const night = hour < 5.5 || hour >= 19.5
    const dawn = hour >= 5.5 && hour < 8
    const dusk = hour >= 17.5 && hour < 19.5
    r.sky.color.setHex(night ? 0x1d2b3b : dawn ? 0xf3c9a6 : dusk ? 0xf0a77e : 0xbfe3f5)
    r.skyline.color.setHex(night ? 0x3b4d60 : dusk ? 0x8a6f68 : 0x9fb3bf)
    r.clouds.forEach((c) => ((c.material as THREE.MeshBasicMaterial).opacity = night ? 0.12 : 0.9))
    r.sun.intensity = (night ? 0.55 : dawn || dusk ? 1.5 : 2.3) * (dark ? 0.6 : 1)
    r.sun.color.setHex(night ? 0xaac4ff : dusk ? 0xffc59a : 0xffffff)
    r.hemi.intensity = night ? 0.75 : dark ? 0.9 : 1.4
    r.hemi.color.setHex(dark ? 0xc9d6e8 : 0xffffff)
    r.hemi.groundColor.setHex(dark ? 0x1a1a1a : 0xd8d8d8)
    this.applyLamp()
    r.screenMat.emissiveIntensity = night ? 1.25 : 0.9
    r.screenMat.userData.base = r.screenMat.emissiveIntensity
    this.placeClock()
    if (!this.running) this.renderOnce()
  }

  /**
   * Fly to one object (or back to the room with `null`). `panel` says where the
   * page's card sits, so the object is framed in the space left free.
   */
  focusOn(id: SpotId | null, panel: 'right' | 'bottom' | null = null) {
    this.panel = panel
    if (id) {
      this.target = id
      this.targetView = this.viewFor(id)
      this.focusTarget = 1
      if (id === 'charbel') this.anim.play('wave')
    } else this.focusTarget = 0
    if (this.opts.reducedMotion) this.focus = this.focusTarget
    this.syncLoop()
    if (!this.running) this.renderOnce()
  }

  /** Small things that react without a card. */
  toy(id: SpotId) {
    if (id === 'lamp') {
      const on = this.room.lamp.intensity > 0
      this.lampOverride = !on
      this.applyLamp()
    } else if (id === 'mug') {
      this.anim.play('sip')
      this.burst = 1
    } else if (id === 'plant') this.plantKick = 1
    else if (id === 'beanbag') this.beanKick = 1
    this.lastMove = this.t
    this.syncLoop()
    if (!this.running) this.renderOnce()
  }

  /* ------------------------------ internals ------------------------------ */

  private applyLamp() {
    const h = this.hour
    const auto = h < 5.5 || h >= 17.5 || this.opts.dark
    const on = this.lampOverride ?? auto
    this.room.lamp.intensity = on ? 2.6 : 0
    this.room.lampBulb.emissiveIntensity = on ? 2.2 : 0
  }

  private placeClock() {
    const hour = this.hour + (performance.now() - this.hourStamp) / 3_600_000
    const c = this.room.clock
    c.hour.rotation.z = -((hour % 12) / 12) * Math.PI * 2
    c.minute.rotation.z = -(hour % 1) * Math.PI * 2
    const sec = Math.floor((Date.now() / 1000) % 60)
    c.second.rotation.z = -(sec / 60) * Math.PI * 2
  }

  /** A view that keeps the room's angle and comes close enough to fill the frame. */
  private viewFor(id: SpotId): View {
    if (id === 'monitor') {
      return { pos: new THREE.Vector3(0.62, 1.68, -0.05), look: new THREE.Vector3(0.05, 1.42, -1.3), fov: 34 }
    }
    const obj = this.room.spots.get(id)!
    const bbox = new THREE.Box3().setFromObject(obj)
    const center = bbox.getCenter(new THREE.Vector3())
    const size = bbox.getSize(new THREE.Vector3()).length()
    const dir = new THREE.Vector3(0.62, 0.36, 0.7).normalize()
    // walls face into the room: look at them more squarely
    if (id === 'board' || id === 'print' || id === 'books') dir.set(0.92, 0.22, 0.32).normalize()
    if (id === 'clock' || id === 'window') dir.set(0.3, 0.12, 0.95).normalize()
    // the phone sits behind his shoulder from the usual angle: look from above, on the left
    if (id === 'phone') dir.set(-0.32, 0.82, 0.48).normalize()
    if (id === 'server') {
      center.y += 0.15
      dir.set(0.5, 0.22, 0.84).normalize()
    }
    if (id === 'charbel') {
      center.y += 0.25
      dir.set(0.75, 0.18, 0.64).normalize()
    }
    const dist = Math.max(1.75, size * 1.6)
    return { pos: center.clone().addScaledVector(dir, dist), look: center, fov: 30 }
  }

  private onWindowPointer = (e: PointerEvent) => {
    this.pointerTarget.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1)
  }

  private pick(e: PointerEvent | MouseEvent): SpotId | null {
    const r = this.renderer.domElement.getBoundingClientRect()
    const ndc = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    this.ray.setFromCamera(ndc, this.camera)
    const hits = this.ray.intersectObjects([...this.room.spots.values()], true)
    for (const h of hits) {
      let o: THREE.Object3D | null = h.object
      while (o && !o.userData.spot) o = o.parent
      if (o) return o.userData.spot as SpotId
    }
    return null
  }

  private onPointerMove = (e: PointerEvent) => {
    this.lastMove = this.t
    if (e.pointerType === 'touch') return
    const id = this.pick(e)
    if (id !== this.hovered) {
      this.highlight(this.hovered, false)
      this.highlight(id, true)
      this.hovered = id
      this.renderer.domElement.style.cursor = id ? 'pointer' : ''
      if (!this.running) this.renderOnce()
    }
    const r = this.host.getBoundingClientRect()
    this.opts.onHover?.(id, e.clientX - r.left, e.clientY - r.top)
  }

  private onPointerLeave = () => {
    this.highlight(this.hovered, false)
    this.hovered = null
    this.renderer.domElement.style.cursor = ''
    this.opts.onHover?.(null, 0, 0)
  }

  private onClick = (e: MouseEvent) => {
    const id = this.pick(e)
    if (!id) return
    if (isCardSpot(id) || id === 'monitor') this.opts.onSelect?.(id)
    else this.toy(id)
  }

  private highlight(id: SpotId | null, on: boolean) {
    if (!id) return
    this.room.spots.get(id)?.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[] | undefined
      const list = Array.isArray(m) ? m : m ? [m] : []
      for (const mm of list) {
        if (!(mm as THREE.MeshStandardMaterial).isMeshStandardMaterial || mm.emissiveMap) continue
        if (mm.userData.hl === undefined) mm.userData.hl = { c: mm.emissive.clone(), i: mm.emissiveIntensity }
        if (on) {
          mm.emissive.copy(HIGHLIGHT)
          mm.emissiveIntensity = 0.16
        } else {
          mm.emissive.copy(mm.userData.hl.c)
          mm.emissiveIntensity = mm.userData.hl.i
        }
      }
    })
  }

  private syncLoop = () => {
    const animating = !this.opts.reducedMotion || this.focus !== this.focusTarget
    const should = this.started && !this.disposed && this.visible && document.visibilityState === 'visible' && animating
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
    const dist = aspect < 0.8 ? 14.5 : aspect < 1.2 ? 11.6 : 9.6
    const px = this.opts.reducedMotion ? 0 : this.pointer.x
    const py = this.opts.reducedMotion ? 0 : this.pointer.y
    const az = 0.68 + px * 0.12
    const el = 0.42 + py * 0.05
    const orbit = new THREE.Vector3(Math.sin(az) * Math.cos(el) * dist, Math.sin(el) * dist + 1.2, Math.cos(az) * Math.cos(el) * dist)
    const orbitLook = new THREE.Vector3(0, 0.95, -0.25)
    const f = easeInOut(this.focus)
    const v = this.targetView
    const pos = v ? orbit.clone().lerp(v.pos, f) : orbit
    const look = v ? orbitLook.clone().lerp(v.look, f) : orbitLook
    this.camera.position.copy(pos)
    this.camera.lookAt(look)
    this.camera.fov = lerp(26, v?.fov ?? 26, f)

    // leave room for the card: shift the picture away from it
    const goal = this.panel && this.focusTarget ? 1 : 0
    this.offset = this.opts.reducedMotion ? goal : damp(this.offset, goal, 4, dt)
    const w = this.host.clientWidth
    const h = this.host.clientHeight
    if (this.offset > 0.001 && w && h) {
      const ox = this.panel === 'right' ? w * 0.2 * this.offset : 0
      const oy = this.panel === 'bottom' ? h * 0.08 * this.offset : 0
      this.camera.setViewOffset(w, h, ox, oy, w, h)
    } else this.camera.clearViewOffset()
    this.camera.updateProjectionMatrix()
  }

  private animate(dt: number) {
    const r = this.room
    this.t += dt
    const t = this.t
    this.pointer.x = damp(this.pointer.x, this.pointerTarget.x, 3, dt)
    this.pointer.y = damp(this.pointer.y, this.pointerTarget.y, 3, dt)

    // turn round to the visitor while they move over the room, or when greeted
    const greeting = this.target === 'charbel' && this.focusTarget === 1
    const attentive = this.coarse ? Math.sin(t * 0.45) > 0.55 : t - this.lastMove < 2.6
    const wantSwivel = greeting || (attentive && this.focusTarget === 0 && !this.anim.current.match(/sip|mouse/))
    this.swivel = damp(this.swivel, wantSwivel ? 1 : 0, wantSwivel ? 2.6 : 1.8, dt)
    const sv = easeInOut(Math.min(1, this.swivel))
    r.seat.rotation.y = -1.55 * sv

    const onMonitor = this.target === 'monitor' && this.focusTarget === 1
    this.anim.update(dt, t, this.swivel, this.focusTarget === 0)

    // head: the action's angles, plus a glance at the visitor
    const head = r.rig.neck
    const visitorYaw = -0.75 - this.pointer.x * 0.35
    const glance = 0.3 * Math.max(0, Math.sin(t * 0.33)) * (1 - this.swivel)
    const yaw = this.anim.headY + lerp(-this.pointer.x * 0.5 * glance, visitorYaw, this.swivel)
    head.rotation.y = damp(head.rotation.y, onMonitor ? 0 : yaw, 4, dt)
    head.rotation.x = damp(head.rotation.x, lerp(this.anim.headX, -0.02 + this.pointer.y * 0.12, this.swivel * 0.7), 4, dt)
    r.rig.pupils.forEach((p) => {
      p.rotation.y = -this.pointer.x * 0.35 * this.swivel
      p.rotation.x = -this.pointer.y * 0.25 * this.swivel
    })

    // screens
    r.terminal.tick(dt, onMonitor ? 0 : 1)
    r.graph.tick(dt)
    const glowGoal = this.hovered === 'monitor' ? 1.4 : (r.screenMat.userData.base as number)
    r.screenMat.emissiveIntensity = damp(r.screenMat.emissiveIntensity, glowGoal, 8, dt)

    // server LEDs (busier when you look at it)
    const busy = this.target === 'server' && this.focusTarget ? 2.2 : 1
    r.leds.forEach((l) => {
      const v = Math.sin(t * l.userData.rate * busy + l.userData.phase)
      ;(l.material as THREE.MeshStandardMaterial).emissiveIntensity = v > 0.2 ? 1.6 : 0.15
    })

    // steam, with a puff after a sip
    this.burst = Math.max(0, this.burst - dt * 0.4)
    r.steam.forEach((s) => {
      const p = (t * (0.25 + this.burst * 0.3) + s.userData.phase) % 1
      s.position.set(Math.sin((p + s.userData.phase) * 6) * 0.02, 0.07 + p * 0.3, 0)
      s.scale.setScalar(0.6 + p * (1.4 + this.burst))
      ;(s.material as THREE.MeshBasicMaterial).opacity = (0.45 + this.burst * 0.3) * (1 - p) * (r.mug.parent === r.rig.armL.wrist ? 0.4 : 1)
    })

    // clouds drift across the window and wrap
    r.clouds.forEach((c) => {
      c.position.x += c.userData.speed * dt
      if (c.position.x > 0.55) c.position.x = -0.55
      const edge = Math.min(1, (0.55 - Math.abs(c.position.x)) / 0.15)
      ;(c.material as THREE.MeshBasicMaterial).opacity = edge * (this.hour < 5.5 || this.hour >= 19.5 ? 0.12 : 0.9)
    })

    // phone: buzzes now and then, lights up, and that's the hint
    this.nextBuzz -= dt
    if (this.nextBuzz <= 0) {
      this.phoneBuzz = 1.1
      this.phoneLit = 5
      this.nextBuzz = 14 + Math.random() * 10
      r.phoneScreen.draw(true, this.timeLabel())
    }
    if (this.phoneBuzz > 0) {
      this.phoneBuzz -= dt
      const on = Math.sin(t * 60) * (Math.floor(this.phoneBuzz * 4) % 2 ? 1 : 0)
      r.phone.position.x = -0.42 + on * 0.004
      r.phone.rotation.y = 0.35 + on * 0.04
    }
    if (this.phoneLit > 0) {
      this.phoneLit -= dt
      if (this.phoneLit <= 0) r.phoneScreen.draw(false)
    }

    // plants and the beanbag spring back after a poke
    this.plantKick = Math.max(0, this.plantKick - dt * 0.8)
    r.plant.rotation.z = Math.sin(t * 0.8) * 0.03 + Math.sin(t * 18) * 0.25 * this.plantKick
    r.plant.scale.setScalar(1 + Math.sin(this.plantKick * Math.PI) * 0.12)
    r.tallPlant.rotation.z = Math.sin(t * 0.5 + 1) * 0.015
    this.beanKick = Math.max(0, this.beanKick - dt * 1.2)
    const squish = Math.sin(this.beanKick * Math.PI * 3) * this.beanKick
    r.beanbag.scale.set(1 + squish * 0.08, 1 - squish * 0.14, 1 + squish * 0.08)

    // books slide out a little on hover
    r.books.forEach((b, i) => {
      const out = this.hovered === 'books' || (this.target === 'books' && this.focusTarget) ? Math.max(0, Math.sin(t * 2 - i * 0.6)) * 0.05 : 0
      b.position.x = damp(b.position.x, (b.userData.home as number) + out, 6, dt)
    })

    this.placeClock()
  }

  private timeLabel() {
    const h = this.hour + (performance.now() - this.hourStamp) / 3_600_000
    const hh = Math.floor(h) % 24
    const mm = Math.floor((h % 1) * 60)
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
  }

  private loop = () => {
    if (!this.running) return
    const dt = Math.min(this.clock.getDelta(), 0.05)
    if (!this.opts.reducedMotion) this.animate(dt)
    this.focus = this.opts.reducedMotion ? this.focusTarget : damp(this.focus, this.focusTarget, 3.2, dt)
    if (Math.abs(this.focus - this.focusTarget) < 0.001) {
      this.focus = this.focusTarget
      if (!this.focusTarget) this.target = null
    }
    this.placeCamera(dt)
    this.renderer.render(this.room.scene, this.camera)
    if (this.opts.reducedMotion && this.focus === this.focusTarget) {
      this.running = false
      return
    }
    this.raf = requestAnimationFrame(this.loop)
  }

  private renderOnce() {
    if (!this.started) return
    this.placeCamera(1)
    this.renderer.render(this.room.scene, this.camera)
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
    this.room.scene.traverse((o) => {
      const m = o as THREE.Mesh
      m.geometry?.dispose()
      const mm = m.material as THREE.Material | THREE.Material[] | undefined
      const list = Array.isArray(mm) ? mm : mm ? [mm] : []
      list.forEach((x) => {
        ;(x as THREE.MeshStandardMaterial).map?.dispose()
        x.dispose()
      })
    })
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
