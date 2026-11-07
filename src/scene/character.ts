/**
 * The developer at the desk: a stylised figure built from primitives, with a
 * small action system (typing by default; now and then he sips his coffee,
 * uses the mouse, stretches or thinks; he waves when a visitor says hello).
 */
import * as THREE from 'three'
import { C, box, capsule, lerp, mat, smooth, sphere } from './kit'

type Arm = {
  shoulder: THREE.Group
  elbow: THREE.Group
  wrist: THREE.Group
  fingers: THREE.Group[]
}

export type Rig = {
  root: THREE.Group
  hips: THREE.Group
  torso: THREE.Group
  neck: THREE.Group
  head: THREE.Group
  lids: THREE.Mesh[]
  brows: THREE.Mesh[]
  pupils: THREE.Group[]
  mouth: THREE.Mesh
  armL: Arm
  armR: Arm
}

export type Action = 'type' | 'sip' | 'mouse' | 'stretch' | 'think' | 'wave'

const DUR: Record<Exclude<Action, 'type'>, number> = { sip: 4.2, mouse: 3.6, stretch: 3.4, think: 3.8, wave: 3.4 }

export function buildCharacter(): Rig {
  const root = new THREE.Group()
  const skin = mat(C.skin, { roughness: 0.62 })
  const skinShade = mat(C.skinShade, { roughness: 0.7 })
  const hoodie = mat(C.hoodie, { roughness: 0.92 })
  const hoodieDark = mat(C.hoodieDark, { roughness: 0.95 })
  const jeans = mat(C.jeans, { roughness: 0.9 })
  const hairM = mat(C.hair, { roughness: 0.95 })
  const beardM = mat(C.beard, { roughness: 1 })
  const white = mat(0xf8f8f8, { roughness: 0.35 })
  const black = mat(0x101010, { roughness: 0.3 })
  const mint = mat(C.mint, { roughness: 0.4, emissive: new THREE.Color(C.mint), emissiveIntensity: 0.06 })
  const sole = mat(C.mintDeep, { roughness: 0.6 })

  /* hips and legs (seated) */
  const hips = new THREE.Group()
  hips.position.set(0, 0.6, 0)
  root.add(hips)
  const pelvis = box(0.38, 0.17, 0.3, jeans, 0.07)
  hips.add(pelvis)
  for (const side of [-1, 1]) {
    const thigh = capsule(0.08, 0.3, jeans)
    thigh.rotation.x = Math.PI / 2
    thigh.position.set(side * 0.105, 0, -0.21)
    hips.add(thigh)
    const knee = sphere(0.083, jeans)
    knee.position.set(side * 0.105, 0, -0.38)
    hips.add(knee)
    const shin = capsule(0.07, 0.32, jeans)
    shin.position.set(side * 0.105, -0.22, -0.4)
    hips.add(shin)
    const shoe = box(0.13, 0.08, 0.24, white, 0.035)
    shoe.position.set(side * 0.105, -0.46, -0.45)
    hips.add(shoe)
    const shoeSole = box(0.135, 0.02, 0.245, sole, 0.008)
    shoeSole.position.set(side * 0.105, -0.5, -0.45)
    hips.add(shoeSole)
  }

  /* torso: a lathed hoodie, slightly flattened front to back */
  const torso = new THREE.Group()
  torso.position.set(0, 0.06, 0.02)
  hips.add(torso)
  const profile = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.2, 0.0),
    new THREE.Vector2(0.215, 0.08),
    new THREE.Vector2(0.23, 0.22),
    new THREE.Vector2(0.245, 0.36),
    new THREE.Vector2(0.235, 0.44),
    new THREE.Vector2(0.17, 0.5),
    new THREE.Vector2(0.08, 0.53),
    new THREE.Vector2(0.0, 0.535),
  ]
  const body = new THREE.Mesh(new THREE.LatheGeometry(profile, 28), hoodie)
  body.scale.set(1, 1, 0.68)
  body.castShadow = true
  torso.add(body)
  // kangaroo pocket and hood
  const pocket = box(0.26, 0.11, 0.03, hoodieDark, 0.012)
  pocket.position.set(0, 0.12, -0.155)
  torso.add(pocket)
  const hood = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.05, 12, 24), hoodie)
  hood.rotation.x = Math.PI / 2 + 0.35
  hood.position.set(0, 0.52, 0.05)
  hood.scale.set(1.2, 1, 0.9)
  hood.castShadow = true
  torso.add(hood)
  for (const side of [-1, 1]) {
    const string = capsule(0.008, 0.11, mint)
    string.position.set(side * 0.045, 0.4, -0.16)
    torso.add(string)
    const tip = sphere(0.012, mint)
    tip.position.set(side * 0.045, 0.33, -0.162)
    torso.add(tip)
  }

  /* neck and head */
  const neck = new THREE.Group()
  neck.position.set(0, 0.53, 0)
  torso.add(neck)
  const neckMesh = capsule(0.055, 0.05, skin)
  neckMesh.position.y = 0.03
  neck.add(neckMesh)

  const head = new THREE.Group()
  head.position.set(0, 0.2, -0.01)
  head.scale.setScalar(1.28)
  neck.add(head)
  const skull = sphere(0.15, skin, 1, 1.08, 1.02)
  head.add(skull)
  const jaw = sphere(0.125, skin, 1, 0.8, 0.98)
  jaw.position.set(0, -0.07, -0.012)
  head.add(jaw)
  // hair: a cap with a little volume at the front, short on the sides
  const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.158, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.46), hairM)
  hairCap.scale.set(1.02, 1.05, 1.06)
  hairCap.position.set(0, 0.035, 0.012)
  hairCap.rotation.x = 0.32
  hairCap.castShadow = true
  head.add(hairCap)
  const quiff = sphere(0.075, hairM, 1.5, 0.55, 0.9)
  quiff.position.set(0.02, 0.15, -0.06)
  quiff.rotation.z = -0.15
  head.add(quiff)
  const nape = sphere(0.13, hairM, 1.05, 0.7, 0.8)
  nape.position.set(0, 0.0, 0.07)
  head.add(nape)
  // beard and moustache
  const beard = new THREE.Mesh(
    new THREE.SphereGeometry(0.152, 28, 14, 0, Math.PI * 2, Math.PI * 0.7, Math.PI * 0.3),
    beardM,
  )
  beard.scale.set(1.02, 1.15, 1.06)
  beard.position.set(0, -0.012, -0.006)
  head.add(beard)
  const stache = capsule(0.012, 0.06, beardM)
  stache.rotation.z = Math.PI / 2
  stache.position.set(0, -0.062, -0.158)
  head.add(stache)
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.006, 6, 14, Math.PI), mat(0x5a2e26))
  mouth.rotation.z = Math.PI
  mouth.position.set(0, -0.09, -0.166)
  head.add(mouth)
  // ears and nose
  for (const side of [-1, 1]) {
    const ear = sphere(0.036, skinShade, 0.45, 1, 0.8)
    ear.position.set(side * 0.15, -0.005, 0.01)
    head.add(ear)
  }
  const nose = sphere(0.024, skinShade, 0.85, 1, 1.1)
  nose.position.set(0, -0.022, -0.158)
  head.add(nose)
  // eyes: whites, a pupil group that can look around, lids that blink
  const lids: THREE.Mesh[] = []
  const brows: THREE.Mesh[] = []
  const pupils: THREE.Group[] = []
  for (const side of [-1, 1]) {
    const eyeWhite = sphere(0.025, white, 1, 1, 0.55)
    eyeWhite.position.set(side * 0.056, 0.022, -0.138)
    head.add(eyeWhite)
    const pupilG = new THREE.Group()
    pupilG.position.set(side * 0.056, 0.022, -0.138)
    head.add(pupilG)
    const pupil = sphere(0.014, black, 1, 1, 0.6)
    pupil.position.z = -0.011
    pupilG.add(pupil)
    const glint = sphere(0.004, white)
    glint.position.set(0.004, 0.005, -0.019)
    pupilG.add(glint)
    pupils.push(pupilG)
    const lid = new THREE.Mesh(new THREE.SphereGeometry(0.027, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), skin)
    lid.position.set(side * 0.056, 0.022, -0.136)
    lid.rotation.x = -Math.PI / 2 + 0.25
    lid.scale.set(1, 0.25, 1)
    head.add(lid)
    lids.push(lid)
    const brow = box(0.058, 0.013, 0.02, hairM)
    brow.position.set(side * 0.057, 0.068, -0.146)
    brow.rotation.z = side * -0.1
    brow.castShadow = false
    head.add(brow)
    brows.push(brow)
  }
  // mint headphones
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.168, 0.016, 10, 32, Math.PI), mint)
  band.position.set(0, 0.02, 0.01)
  band.castShadow = true
  head.add(band)
  for (const side of [-1, 1]) {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.045, 24), mint)
    cup.rotation.z = Math.PI / 2
    cup.position.set(side * 0.172, 0, 0.01)
    cup.castShadow = true
    head.add(cup)
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.047, 0.047, 0.02, 20), mat(0x1c1c1c))
    pad.rotation.z = Math.PI / 2
    pad.position.set(side * 0.202, 0, 0.01)
    head.add(pad)
  }

  /* arms: shoulder → upper arm → elbow → forearm → wrist → hand with fingers */
  const makeArm = (side: number): Arm => {
    const shoulder = new THREE.Group()
    shoulder.position.set(side * 0.255, 0.44, 0)
    torso.add(shoulder)
    const cap = sphere(0.075, hoodie)
    shoulder.add(cap)
    const upper = capsule(0.064, 0.2, hoodie)
    upper.position.y = -0.13
    shoulder.add(upper)
    const elbow = new THREE.Group()
    elbow.position.y = -0.27
    shoulder.add(elbow)
    const fore = capsule(0.056, 0.19, hoodie)
    fore.position.y = -0.12
    elbow.add(fore)
    const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.016, 8, 16), hoodieDark)
    cuff.rotation.x = Math.PI / 2
    cuff.position.y = -0.235
    elbow.add(cuff)
    const wrist = new THREE.Group()
    wrist.position.y = -0.25
    elbow.add(wrist)
    const palm = box(0.075, 0.07, 0.035, skin, 0.016)
    palm.position.y = -0.035
    wrist.add(palm)
    const fingers: THREE.Group[] = []
    for (let i = 0; i < 4; i++) {
      const f = new THREE.Group()
      f.position.set(-0.027 + i * 0.018, -0.07, 0)
      wrist.add(f)
      const seg = capsule(0.0085, 0.032, skin)
      seg.position.y = -0.02
      f.add(seg)
      fingers.push(f)
    }
    const thumb = capsule(0.01, 0.03, skin)
    thumb.position.set(-side * 0.045, -0.035, -0.01)
    thumb.rotation.z = -side * 0.7
    wrist.add(thumb)
    return { shoulder, elbow, wrist, fingers }
  }

  return { root, hips, torso, neck, head, lids, brows, pupils, mouth, armL: makeArm(-1), armR: makeArm(1) }
}

/* ------------------------------ animation ------------------------------ */

type Pose = {
  ls: [number, number] // left shoulder x, z
  le: number // left elbow x
  rs: [number, number]
  re: number
  rez: number // right elbow z (for the wave)
  lean: number
  headX: number
  headY: number
}

const TYPING: Pose = { ls: [0.55, -0.18], le: 1.0, rs: [0.55, 0.18], re: 1.0, rez: 0, lean: 0, headX: -0.12, headY: 0 }

const envelope = (p: number, a = 0.18, b = 0.82) => smooth(p / a) * (1 - smooth((p - b) / (1 - b)))

function actionPose(action: Exclude<Action, 'type'>, p: number, t: number): Partial<Pose> {
  switch (action) {
    case 'sip': {
      // reach for the mug, lift to the mouth, put it back
      const toMouth = smooth((p - 0.3) / 0.15) * (1 - smooth((p - 0.62) / 0.15))
      return {
        ls: [lerp(0.62, 1.05, toMouth), lerp(-0.42, -0.12, toMouth)],
        le: lerp(1.0, 2.35, toMouth),
        headX: lerp(-0.08, 0.12, toMouth),
        headY: lerp(-0.25, 0, toMouth),
      }
    }
    case 'mouse':
      return { rs: [0.62, 0.42], re: 1.05, headY: -0.12 + Math.sin(t * 1.3) * 0.05 }
    case 'stretch':
      return { ls: [0.2, -2.75], le: 0.25, rs: [0.2, 2.75], re: 0.25, lean: -0.16, headX: 0.22 }
    case 'think':
      return { rs: [0.95, 0.2], re: 2.45, headX: 0.18, headY: 0.18, lean: -0.05 }
    case 'wave':
      return { rs: [0.15, 2.45], re: 0.35, rez: Math.sin(t * 9) * 0.45, headX: 0.02 }
  }
}

export class Animator {
  rig: Rig
  current: Action = 'type'
  private p = 0
  private nextIn = 7
  private blinkIn = 2.2
  private mug: THREE.Object3D | null = null
  private mugHome: THREE.Object3D | null = null
  private mugMatrix = new THREE.Matrix4()
  private holding = false
  /** Called on every frame of the right hand while using the mouse. */
  onMouseMove?: (dx: number, dz: number) => void

  constructor(rig: Rig) {
    this.rig = rig
  }

  attachMug(mug: THREE.Object3D) {
    this.mug = mug
    this.mugHome = mug.parent
    this.mugMatrix.copy(mug.matrix)
  }

  play(action: Exclude<Action, 'type'>) {
    if (this.current !== 'type' && action !== 'wave') return
    this.releaseMug()
    this.current = action
    this.p = 0
  }

  private releaseMug() {
    if (!this.holding || !this.mug || !this.mugHome) return
    this.mugHome.add(this.mug)
    this.mug.matrix.copy(this.mugMatrix)
    this.mug.matrix.decompose(this.mug.position, this.mug.quaternion, this.mug.scale)
    this.holding = false
  }

  /**
   * @param busy  0 while typing at the desk, 1 when turned to the visitor
   * @param allowIdle  whether spontaneous actions may start
   */
  update(dt: number, t: number, busy: number, allowIdle: boolean) {
    const r = this.rig
    let w = 0
    let pose: Partial<Pose> = {}
    if (this.current !== 'type') {
      this.p += dt / DUR[this.current]
      if (this.p >= 1) {
        this.releaseMug()
        this.current = 'type'
        this.nextIn = 8 + Math.random() * 8
      } else {
        w = envelope(this.p)
        pose = actionPose(this.current, this.p, t)
        if (this.current === 'sip' && this.mug) {
          const holdNow = this.p > 0.24 && this.p < 0.78
          if (holdNow && !this.holding) {
            r.armL.wrist.add(this.mug)
            this.mug.position.set(0.0, -0.1, -0.05)
            this.mug.rotation.set(0, 0, 0)
            this.holding = true
          } else if (!holdNow && this.holding) this.releaseMug()
        }
        if (this.current === 'mouse') this.onMouseMove?.(Math.sin(t * 2.1) * 0.03 * w, Math.cos(t * 1.7) * 0.02 * w)
      }
    } else if (allowIdle && busy < 0.05) {
      this.nextIn -= dt
      if (this.nextIn <= 0) {
        const pool: Exclude<Action, 'type' | 'wave'>[] = ['sip', 'mouse', 'stretch', 'think', 'mouse', 'sip']
        this.play(pool[Math.floor(Math.random() * pool.length)])
      }
    }

    // typing taps, quieter while an action or the visitor has his attention
    const typing = (1 - w) * (1 - busy)
    const tapL = (Math.max(0, Math.sin(t * 13)) * 0.08 + Math.sin(t * 2.1) * 0.02) * typing
    const tapR = (Math.max(0, Math.sin(t * 11 + 1.7)) * 0.08 + Math.sin(t * 1.7) * 0.02) * typing
    const mix = (a: number, b: number | undefined) => (b === undefined ? a : lerp(a, b, w))
    const relaxed = (v: number, rest: number) => lerp(v, rest, busy * (1 - w))

    r.armL.shoulder.rotation.x = relaxed(mix(TYPING.ls[0], pose.ls?.[0]), 0.3)
    r.armL.shoulder.rotation.z = mix(TYPING.ls[1], pose.ls?.[1])
    r.armL.elbow.rotation.x = relaxed(mix(TYPING.le, pose.le) + tapL, 0.9)
    r.armR.shoulder.rotation.x = relaxed(mix(TYPING.rs[0], pose.rs?.[0]), 0.3)
    r.armR.shoulder.rotation.z = mix(TYPING.rs[1], pose.rs?.[1])
    r.armR.elbow.rotation.x = relaxed(mix(TYPING.re, pose.re) + tapR, 0.9)
    r.armR.elbow.rotation.z = mix(0, pose.rez)
    // fingers tap while typing
    ;[r.armL, r.armR].forEach((arm, ai) =>
      arm.fingers.forEach((f, i) => {
        f.rotation.x = 0.35 + Math.max(0, Math.sin(t * 14 + i * 1.9 + ai)) * 0.6 * typing
      }),
    )
    r.torso.rotation.x = mix(0, pose.lean) + Math.sin(t * 0.5) * 0.012
    r.torso.scale.y = 1 + Math.sin(t * 1.6) * 0.008

    // nodding along to whatever is in the headphones
    const bob = Math.sin(t * Math.PI * 2 * 1.55) * 0.025 * typing
    this.headX = mix(TYPING.headX, pose.headX) + bob
    this.headY = mix(0, pose.headY)

    // blink, and raise the brows when waving
    this.blinkIn -= dt
    const closing = this.blinkIn < 0.13 && this.blinkIn > 0
    r.lids.forEach((l) => (l.scale.y = closing ? 1 : 0.25))
    if (this.blinkIn <= 0) this.blinkIn = 2 + Math.random() * 3.2
    const browUp = this.current === 'wave' || this.current === 'think' ? w : busy * 0.6
    r.brows.forEach((b) => (b.position.y = 0.068 + browUp * 0.014))
    r.mouth.scale.set(1 + (this.current === 'wave' ? w * 0.4 : busy * 0.25), 1 + busy * 0.4, 1)
  }

  /** Head angles proposed by the current action; the stage blends in the visitor's gaze. */
  headX = TYPING.headX
  headY = 0
}

