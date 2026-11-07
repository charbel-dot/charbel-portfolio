import * as THREE from 'three'

export const C = {
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
  skinShade: 0xb07a58,
  hair: 0x1f1714,
  beard: 0x3d2e25,
  hoodie: 0x34373a,
  hoodieDark: 0x2a2c2f,
  jeans: 0x46566b,
  wood: 0xcfc6ba,
}

export const mat = (color: number, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.82, metalness: 0.02, ...extra })

/** A cheap rounded box: an extruded rounded rectangle, bevelled. */
export function roundedBox(w: number, h: number, d: number, r: number) {
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
    depth: Math.max(0.0001, d - r * 2),
    bevelEnabled: true,
    bevelThickness: r,
    bevelSize: r * 0.6,
    bevelSegments: 2,
    curveSegments: 4,
  })
  g.translate(0, 0, -(d - r * 2) / 2)
  return g
}

export function box(w: number, h: number, d: number, m: THREE.Material, r = 0) {
  const g = r > 0 ? roundedBox(w, h, d, r) : new THREE.BoxGeometry(w, h, d)
  const mesh = new THREE.Mesh(g, m)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

export function capsule(radius: number, length: number, m: THREE.Material) {
  const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 6, 14), m)
  mesh.castShadow = true
  return mesh
}

export function sphere(r: number, m: THREE.Material, sx = 1, sy = 1, sz = 1) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 18), m)
  mesh.scale.set(sx, sy, sz)
  mesh.castShadow = true
  return mesh
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const damp = (a: number, b: number, lambda: number, dt: number) => lerp(a, b, 1 - Math.exp(-lambda * dt))
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
export const smooth = (x: number) => {
  const t = clamp01(x)
  return t * t * (3 - 2 * t)
}
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
