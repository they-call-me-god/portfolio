'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useRef, useMemo, useEffect, useState } from 'react'
import * as THREE from 'three'

// ── Shared state — updated by event listeners, read inside useFrame
const shared = {
  scroll:  0,
  visible: true,
  mouse:   { x: 0, y: 0 },
  camPos:  new THREE.Vector3(0, 0, 22), // written once/frame by CameraRig, read by all gates
}

// ── Pre-allocated scratch vectors — ZERO allocations inside hot useFrame paths
// All module-level so they persist across renders without GC
const _v0    = new THREE.Vector3()
const _right = new THREE.Vector3()
const _up    = new THREE.Vector3()
const _UP    = new THREE.Vector3(0, 1, 0)   // immutable constant
const _dummy = new THREE.Object3D()          // reused for InstancedMesh matrix writes

// ── Camera spline — same path, no changes
const SPLINE = new THREE.CatmullRomCurve3([
  new THREE.Vector3(  0,   0,  22),
  new THREE.Vector3(  0,   2,  10),
  new THREE.Vector3( -5,  -1,   3),
  new THREE.Vector3(  4,   3,  -4),
  new THREE.Vector3( -2,  -2, -11),
  new THREE.Vector3(  0,   1, -18),
], false, 'catmullrom', 0.5)

// ── Performance tier — detected once on mount, not reactive
// Drives star count, shard count, DPR, and whether to show floating crystals
type Tier = 'low' | 'mid' | 'high'
function detectTier(): Tier {
  const mobile = window.innerWidth < 1024 || /Mobi|Android|iPhone/i.test(navigator.userAgent)
  const cores  = navigator.hardwareConcurrency ?? 4
  if (mobile && cores <= 4) return 'low'
  if (mobile || cores <= 6) return 'mid'
  return 'high'
}
const TIER_CFG: Record<Tier, { stars: number; shards: number; gates: number[]; crystals: boolean; dpr: [number, number] }> = {
  low:  { stars:  80, shards: 3, gates: [0.16, 0.52, 0.87],            crystals: false, dpr: [1, 1]   },
  mid:  { stars: 200, shards: 5, gates: [0.16, 0.32, 0.52, 0.70, 0.87], crystals: true,  dpr: [1, 1.2] },
  high: { stars: 420, shards: 6, gates: [0.16, 0.32, 0.52, 0.70, 0.87], crystals: true,  dpr: [1, 1.5] },
}

// ──────────────────────────────────────────────────────────────────
// STAR FIELD
// Rectangular volume distribution (not sphere shell) — deep space feel
// ──────────────────────────────────────────────────────────────────
function StarField({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null)

  // Build position buffer once
  const geo = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 52
      pos[i * 3 + 1] = (Math.random() - 0.5) * 38
      pos[i * 3 + 2] = Math.random() * -44 + 6
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [count])

  const mat = useMemo(() => new THREE.PointsMaterial({
    size: 0.055, color: '#cbd5e1',
    transparent: true, opacity: 0.26, sizeAttenuation: true, depthWrite: false,
  }), [])

  useEffect(() => () => { geo.dispose(); mat.dispose() }, [geo, mat])

  useFrame(({ clock }) => {
    if (!shared.visible || !ref.current) return
    const t = clock.elapsedTime
    ref.current.rotation.y = t * 0.003
    ref.current.rotation.x = t * 0.0011
  })

  return <points ref={ref} geometry={geo} material={mat} />
}

// ──────────────────────────────────────────────────────────────────
// CRYSTAL SHARDS — InstancedMesh (was 6 draw calls, now 1)
// Large background octahedra replace the soft glow blobs
// ──────────────────────────────────────────────────────────────────
const SHARD_DATA = [
  { px: -7,   py:  3,  pz: -20, scale: 4.0, speed: 0.038, phase: 0.0 },
  { px: 10,   py: -4,  pz: -22, scale: 5.0, speed: 0.026, phase: 1.8 },
  { px:  1,   py:  9,  pz: -15, scale: 3.0, speed: 0.055, phase: 3.1 },
  { px: -11,  py: -3,  pz: -24, scale: 4.5, speed: 0.031, phase: 2.5 },
  { px:  7,   py:  7,  pz:  -9, scale: 2.2, speed: 0.072, phase: 4.7 },
  { px: -4,   py: -9,  pz:  -6, scale: 2.0, speed: 0.082, phase: 1.2 },
] as const

function CrystalShards({ count }: { count: number }) {
  const ref  = useRef<THREE.InstancedMesh>(null)
  const data = useMemo(() => SHARD_DATA.slice(0, count), [count])
  const n    = data.length

  useFrame(({ clock }) => {
    if (!shared.visible || !ref.current) return
    const t    = clock.elapsedTime
    const zOff = shared.scroll * 4.5
    for (let i = 0; i < n; i++) {
      const c = data[i]
      _dummy.position.set(c.px, c.py, c.pz + zOff)
      _dummy.scale.setScalar(c.scale)
      _dummy.rotation.x = t * c.speed + c.phase
      _dummy.rotation.y = t * c.speed * 0.65
      _dummy.rotation.z = t * c.speed * 0.42
      _dummy.updateMatrix()
      ref.current.setMatrixAt(i, _dummy.matrix)
    }
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, n]}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color="#dc2626" emissive="#7f1d1d" emissiveIntensity={0.35}
        transparent opacity={0.08} depthWrite={false}
      />
    </instancedMesh>
  )
}

// ──────────────────────────────────────────────────────────────────
// FLOATING CRYSTALS — 2 InstancedMesh (was 8 draw calls, now 2)
// Mix of octahedra and tetrahedra drifting off-path with parallax
// ──────────────────────────────────────────────────────────────────
const FLOAT_OCT = [
  { x: -8, y:  3, z:  2,  s: 0.65, sp: 0.10, ba: 0.40, ph: 0.0 },
  { x: -6, y: -4, z: -8,  s: 0.50, sp: 0.16, ba: 0.30, ph: 2.2 },
  { x:  2, y: -7, z: -14, s: 1.10, sp: 0.06, ba: 0.65, ph: 3.6 },
  { x:  5, y:  8, z: -7,  s: 0.55, sp: 0.13, ba: 0.32, ph: 4.3 },
] as const
const FLOAT_TET = [
  { x:  9, y: -2, z: -3,  s: 0.90, sp: 0.07, ba: 0.55, ph: 1.3 },
  { x:  7, y:  5, z: -5,  s: 0.75, sp: 0.09, ba: 0.45, ph: 0.8 },
  { x: -9, y:  2, z: -12, s: 0.85, sp: 0.08, ba: 0.50, ph: 2.0 },
  { x: -3, y: -8, z:  0,  s: 0.70, sp: 0.10, ba: 0.40, ph: 5.2 },
] as const

function FloatingCrystals() {
  const octRef   = useRef<THREE.InstancedMesh>(null)
  const tetRef   = useRef<THREE.InstancedMesh>(null)
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!shared.visible) return
    const t    = clock.elapsedTime
    const s    = shared.scroll
    const spin = 1 + s * 4

    if (groupRef.current) groupRef.current.position.z = s * 12

    if (octRef.current) {
      for (let i = 0; i < FLOAT_OCT.length; i++) {
        const c = FLOAT_OCT[i]
        _dummy.position.set(c.x, c.y + Math.sin(t * c.sp * 3 + c.ph) * c.ba, c.z)
        _dummy.scale.setScalar(c.s)
        _dummy.rotation.x = t * c.sp * spin
        _dummy.rotation.z = t * c.sp * spin * 0.7
        _dummy.updateMatrix()
        octRef.current.setMatrixAt(i, _dummy.matrix)
      }
      octRef.current.instanceMatrix.needsUpdate = true
    }

    if (tetRef.current) {
      for (let i = 0; i < FLOAT_TET.length; i++) {
        const c = FLOAT_TET[i]
        _dummy.position.set(c.x, c.y + Math.sin(t * c.sp * 3 + c.ph) * c.ba, c.z)
        _dummy.scale.setScalar(c.s)
        _dummy.rotation.x = t * c.sp * spin
        _dummy.rotation.z = t * c.sp * spin * 0.7
        _dummy.updateMatrix()
        tetRef.current.setMatrixAt(i, _dummy.matrix)
      }
      tetRef.current.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <group ref={groupRef}>
      <instancedMesh ref={octRef} args={[undefined, undefined, FLOAT_OCT.length]}>
        <octahedronGeometry  args={[1, 0]} />
        <meshStandardMaterial color="#dc2626" emissive="#991b1b" emissiveIntensity={0.45} transparent opacity={0.18} wireframe />
      </instancedMesh>
      <instancedMesh ref={tetRef} args={[undefined, undefined, FLOAT_TET.length]}>
        <tetrahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#dc2626" emissive="#991b1b" emissiveIntensity={0.45} transparent opacity={0.18} wireframe />
      </instancedMesh>
    </group>
  )
}

// ──────────────────────────────────────────────────────────────────
// SECTION GATE — wireframe oct+tet pair at each section transition
// Proximity uses shared.camPos (NOT SPLINE.getPoint per frame per gate)
// Eliminates N×SPLINE.getPoint calls — was the #1 hidden CPU sink
// ──────────────────────────────────────────────────────────────────
function SectionGate({ t, index }: { t: number; index: number }) {
  const outerRef = useRef<THREE.Mesh>(null)
  const innerRef = useRef<THREE.Mesh>(null)
  const matO     = useRef<THREE.MeshStandardMaterial>(null)
  const matI     = useRef<THREE.MeshStandardMaterial>(null)

  // World position pre-computed — no per-frame spline eval
  const pos   = useMemo(() => SPLINE.getPoint(t), [t])
  const phase = index * 1.4

  useFrame(({ clock }) => {
    if (!shared.visible) return
    const e         = clock.elapsedTime
    // shared.camPos is written by CameraRig each frame — no extra spline eval
    const dist      = shared.camPos.distanceTo(pos)
    const proximity = Math.max(0, 1 - dist / 6.5)

    if (outerRef.current) {
      outerRef.current.rotation.y = e * 0.10 + phase
      outerRef.current.rotation.x = e * 0.06
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = -(e * 0.17 + phase)
      innerRef.current.rotation.z =   e * 0.08
    }
    if (matO.current) {
      matO.current.emissiveIntensity = 0.5 + proximity * 2.2
      matO.current.opacity           = 0.28 + proximity * 0.5
    }
    if (matI.current) {
      matI.current.emissiveIntensity = 0.8 + proximity * 2.8
      matI.current.opacity           = 0.20 + proximity * 0.45
    }
  })

  return (
    <group position={pos}>
      <mesh ref={outerRef}>
        <octahedronGeometry  args={[2.0, 0]} />
        <meshStandardMaterial ref={matO} color="#dc2626" emissive="#dc2626" emissiveIntensity={0.5} transparent opacity={0.28} wireframe depthWrite={false} />
      </mesh>
      <mesh ref={innerRef}>
        <tetrahedronGeometry args={[1.1, 0]} />
        <meshStandardMaterial ref={matI} color="#f87171" emissive="#f87171" emissiveIntensity={0.8} transparent opacity={0.20} wireframe depthWrite={false} />
      </mesh>
    </group>
  )
}

// ──────────────────────────────────────────────────────────────────
// CAMERA RIG
// Uses pre-allocated module-level vectors — no `new THREE.Vector3()` per frame
// Writes shared.camPos once so all gates can read it cheaply
// ──────────────────────────────────────────────────────────────────
function CameraRig() {
  const { camera } = useThree()
  const s = useRef({
    pos:      new THREE.Vector3(0, 0, 22),
    lookAt:   new THREE.Vector3(0, 0, 10),
    _tmpPos:  new THREE.Vector3(),
    _tmpTan:  new THREE.Vector3(),
    _tmpLook: new THREE.Vector3(),
  })

  useFrame(() => {
    if (!shared.visible) return
    const { pos, lookAt, _tmpPos, _tmpTan, _tmpLook } = s.current
    const t = Math.min(shared.scroll, 0.9999)

    SPLINE.getPoint(t, _tmpPos)
    SPLINE.getTangent(t, _tmpTan).normalize()

    // Module-level scratch — zero allocations
    _right.crossVectors(_tmpTan, _UP).normalize()
    _up.crossVectors(_right, _tmpTan).normalize()
    _tmpPos.addScaledVector(_right,  shared.mouse.x *  1.8)
    _tmpPos.addScaledVector(_up,    -shared.mouse.y *  1.2)

    pos.lerp(_tmpPos, 0.055)
    camera.position.copy(pos)

    // Publish smoothed camera position — gates read this, no extra spline eval
    shared.camPos.copy(pos)

    const lookT = Math.min(t + 0.04, 0.9999)
    SPLINE.getPoint(lookT, _tmpLook)
    lookAt.lerp(_tmpLook, 0.055)
    camera.lookAt(lookAt)
  })

  return null
}

// ──────────────────────────────────────────────────────────────────
// ROOT
// ──────────────────────────────────────────────────────────────────
export function ThreeCanvas() {
  const [tier, setTier] = useState<Tier | null>(null)

  useEffect(() => {
    setTier(detectTier())

    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight
      shared.scroll = max > 0 ? window.scrollY / max : 0
    }
    const onMouse = (e: MouseEvent) => {
      shared.mouse.x =  e.clientX / window.innerWidth  - 0.5
      shared.mouse.y =  e.clientY / window.innerHeight - 0.5
    }
    const onVisibility = () => { shared.visible = !document.hidden }

    window.addEventListener('scroll',             onScroll,     { passive: true })
    window.addEventListener('mousemove',          onMouse,      { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('scroll',    onScroll)
      window.removeEventListener('mousemove', onMouse)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  if (!tier) return null  // avoid SSR flash

  const cfg = TIER_CFG[tier]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', contain: 'strict' }}>
      <Canvas
        camera={{ position: [0, 0, 22], fov: 55 }}
        gl={{ alpha: true, antialias: false, powerPreference: 'high-performance', precision: tier === 'low' ? 'lowp' : 'mediump' }}
        dpr={cfg.dpr}
      >
        <ambientLight intensity={0.15} />
        <pointLight position={[ 5,  8,  3]} intensity={1.6} color="#dc2626" />
        <pointLight position={[-8, -5, -6]} intensity={0.5} color="#450a0a" />

        <StarField count={cfg.stars} />
        {cfg.crystals && <FloatingCrystals />}
        <CrystalShards count={cfg.shards} />

        {cfg.gates.map((t, i) => (
          <SectionGate key={t} t={t} index={i} />
        ))}

        <CameraRig />
      </Canvas>
    </div>
  )
}
