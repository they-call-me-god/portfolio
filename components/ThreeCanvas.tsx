'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useRef, useMemo, useEffect, useState } from 'react'
import * as THREE from 'three'

// ── Shared state — one listener, read every frame
const shared = { scroll: 0, visible: true, mouse: { x: 0, y: 0 } }

// ── Camera spline — curves through 3D space (non-linear feel)
// The path banks left/right/up/down so it never feels like a straight zoom
const SPLINE = new THREE.CatmullRomCurve3([
  new THREE.Vector3(  0,   0,  22),  // entrance — far back
  new THREE.Vector3(  0,   2,  10),  // hero      — fly in, arc up
  new THREE.Vector3( -5,  -1,   3),  // about     — bank hard left, drop
  new THREE.Vector3(  4,   3,  -4),  // projects  — sweep right and rise
  new THREE.Vector3( -2,  -2, -11),  // work       — dive left and down
  new THREE.Vector3(  0,   1, -18),  // contact   — settle to center
], false, 'catmullrom', 0.5)

// Pre-sample the spline for smooth lookup
const SPLINE_POINTS = SPLINE.getPoints(256)
const SPLINE_LENGTH = SPLINE.getLength()

// Portal positions — placed between each section pair (t = 0.15 … 0.85)
const PORTAL_TS = [0.16, 0.32, 0.52, 0.70, 0.87]

// ── Particles — sphere cloud that expands/spins with scroll
function ParticleField({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null)

  const [restPos, expandPos] = useMemo(() => {
    const rest   = new Float32Array(count * 3)
    const expand = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r     = 9 + Math.random() * 14
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      const sx    = Math.sin(phi) * Math.cos(theta)
      const sy    = Math.sin(phi) * Math.sin(theta)
      const sz    = Math.cos(phi)
      rest[i * 3]     = r * sx;  rest[i * 3 + 1] = r * sy;  rest[i * 3 + 2] = r * sz
      expand[i * 3]   = r * 1.9 * sx;  expand[i * 3 + 1] = r * 1.9 * sy;  expand[i * 3 + 2] = r * 1.9 * sz
    }
    return [rest, expand]
  }, [count])

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(restPos.slice(), 3))
    return g
  }, [restPos])

  const mat = useMemo(() => new THREE.PointsMaterial({
    size: 0.05, color: new THREE.Color('#dc2626'),
    transparent: true, opacity: 0.5, sizeAttenuation: true, depthWrite: false,
  }), [])

  useEffect(() => () => { geo.dispose(); mat.dispose() }, [geo, mat])

  useFrame(({ clock }) => {
    if (!shared.visible || !ref.current) return
    const s = shared.scroll
    const t = clock.elapsedTime
    const attr = ref.current.geometry.attributes.position as THREE.BufferAttribute
    const arr  = attr.array as Float32Array
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = THREE.MathUtils.lerp(restPos[i * 3],     expandPos[i * 3],     s * 0.65)
      arr[i * 3 + 1] = THREE.MathUtils.lerp(restPos[i * 3 + 1], expandPos[i * 3 + 1], s * 0.65)
      arr[i * 3 + 2] = THREE.MathUtils.lerp(restPos[i * 3 + 2], expandPos[i * 3 + 2], s * 0.65)
    }
    attr.needsUpdate = true
    ref.current.rotation.y = t * (0.015 + s * 0.035)
    ref.current.rotation.x = t *  0.006
  })

  return <points ref={ref} geometry={geo} material={mat} />
}

// ── Single portal ring — oriented perpendicular to the spline tangent at its t
function Portal({ t, index }: { t: number; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const matRef  = useRef<THREE.MeshStandardMaterial>(null)

  // World position + forward direction at this t on the spline
  const [pos, quat] = useMemo(() => {
    const p   = SPLINE.getPoint(t)
    const tan = SPLINE.getTangent(t).normalize()
    const q   = new THREE.Quaternion()
    q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tan)
    return [p, q]
  }, [t])

  // Unique phase per portal for async pulsing
  const phase = index * 1.27

  useFrame(({ clock }) => {
    if (!shared.visible || !meshRef.current || !matRef.current) return
    const elapsed = clock.elapsedTime

    // Pulse emissive intensity
    matRef.current.emissiveIntensity = 0.6 + Math.sin(elapsed * 1.1 + phase) * 0.4

    // Proximity to camera: brighten when camera is close to this portal
    const camPos = new THREE.Vector3()
    meshRef.current.getWorldPosition(camPos)  // cheap proxy
    const dist = SPLINE.getPoint(shared.scroll).distanceTo(pos)
    const proximity = Math.max(0, 1 - dist / 6)
    matRef.current.emissiveIntensity += proximity * 1.8
    matRef.current.opacity = 0.55 + proximity * 0.45

    // Slow roll around travel axis
    meshRef.current.rotation.z = elapsed * 0.08 + phase
  })

  return (
    <mesh ref={meshRef} position={pos} quaternion={quat}>
      {/* Outer ring */}
      <torusGeometry args={[2.2, 0.04, 8, 80]} />
      <meshStandardMaterial
        ref={matRef}
        color="#dc2626"
        emissive="#dc2626"
        emissiveIntensity={0.6}
        transparent
        opacity={0.55}
        depthWrite={false}
      />
    </mesh>
  )
}

// Inner portal spark ring (smaller, different colour)
function PortalInner({ t, index }: { t: number; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const matRef  = useRef<THREE.MeshStandardMaterial>(null)

  const [pos, quat] = useMemo(() => {
    const p   = SPLINE.getPoint(t)
    const tan = SPLINE.getTangent(t).normalize()
    const q   = new THREE.Quaternion()
    q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tan)
    return [p, q]
  }, [t])

  const phase = index * 1.27

  useFrame(({ clock }) => {
    if (!shared.visible || !meshRef.current || !matRef.current) return
    const elapsed = clock.elapsedTime
    const dist = SPLINE.getPoint(shared.scroll).distanceTo(pos)
    const proximity = Math.max(0, 1 - dist / 6)
    matRef.current.emissiveIntensity = 0.9 + proximity * 2.5
    // Counter-rotate the inner ring
    meshRef.current.rotation.z = -elapsed * 0.18 - phase
  })

  return (
    <mesh ref={meshRef} position={pos} quaternion={quat}>
      <torusGeometry args={[1.2, 0.025, 6, 60]} />
      <meshStandardMaterial
        ref={matRef}
        color="#f87171"
        emissive="#f87171"
        emissiveIntensity={0.9}
        transparent
        opacity={0.45}
        depthWrite={false}
      />
    </mesh>
  )
}

// ── Floating icosahedra — drift off-path at varying depths
function FloatingIcosahedra() {
  const groupRef = useRef<THREE.Group>(null)
  const meshRefs = useRef<(THREE.Mesh | null)[]>([])

  const config = useMemo(() => [
    { x: -8, y:  3, z:  2,  scale: 1.4, speed: 0.10, bobAmp: 0.40, phase: 0.0 },
    { x:  9, y: -2, z: -3,  scale: 1.9, speed: 0.07, bobAmp: 0.55, phase: 1.3 },
    { x: -6, y: -4, z: -8,  scale: 0.9, speed: 0.16, bobAmp: 0.30, phase: 2.2 },
    { x:  7, y:  5, z: -5,  scale: 1.5, speed: 0.09, bobAmp: 0.45, phase: 0.8 },
    { x:  2, y: -7, z: -14, scale: 2.2, speed: 0.06, bobAmp: 0.65, phase: 3.6 },
    { x: -9, y:  2, z: -12, scale: 1.7, speed: 0.08, bobAmp: 0.50, phase: 2.0 },
    { x:  5, y:  8, z: -7,  scale: 1.1, speed: 0.13, bobAmp: 0.32, phase: 4.3 },
    { x: -3, y: -8, z:  0,  scale: 1.3, speed: 0.10, bobAmp: 0.40, phase: 5.2 },
  ], [])

  useFrame(({ clock }) => {
    if (!shared.visible || !groupRef.current) return
    const t = clock.elapsedTime
    const s = shared.scroll
    // Icosahedra rush past the camera at 2× the scroll rate — strong parallax
    groupRef.current.position.z = s * 12
    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      const c    = config[i]
      const spin = 1 + s * 4
      mesh.rotation.x = t * c.speed * spin
      mesh.rotation.z = t * c.speed * spin * 0.7
      mesh.position.y = c.y + Math.sin(t * c.speed * 3 + c.phase) * c.bobAmp
    })
  })

  return (
    <group ref={groupRef}>
      {config.map((c, i) => (
        <mesh key={i} position={[c.x, c.y, c.z]} ref={el => { meshRefs.current[i] = el }}>
          <icosahedronGeometry args={[c.scale, 0]} />
          <meshStandardMaterial
            color="#991b1b" emissive="#7f1d1d" emissiveIntensity={0.4}
            transparent opacity={0.13} wireframe
          />
        </mesh>
      ))}
    </group>
  )
}

// ── Deep glow orbs — breathe brighter as camera moves deeper
function GlowOrbs() {
  const groupRef = useRef<THREE.Group>(null)
  const matRefs  = useRef<(THREE.MeshStandardMaterial | null)[]>([])

  const orbs = useMemo(() => [
    { pos: [-6,  2, -20] as const, r: 4.2, phase: 0.0 },
    { pos: [ 8, -3, -22] as const, r: 5.2, phase: 2.1 },
    { pos: [ 0,  8, -16] as const, r: 3.0, phase: 4.3 },
    { pos: [-9, -4, -24] as const, r: 4.8, phase: 1.5 },
  ], [])

  useFrame(({ clock }) => {
    if (!shared.visible || !groupRef.current) return
    const t = clock.elapsedTime
    const s = shared.scroll
    groupRef.current.position.z = s * 5
    matRefs.current.forEach((mat, i) => {
      if (!mat) return
      mat.opacity           = 0.06 + s * 0.08 + Math.sin(t * 0.45 + orbs[i].phase) * 0.022
      mat.emissiveIntensity = 0.9 + s * 1.1
    })
  })

  return (
    <group ref={groupRef}>
      {orbs.map((orb, i) => (
        <mesh key={i} position={orb.pos}>
          <sphereGeometry args={[orb.r, 32, 32]} />
          <meshStandardMaterial
            ref={el => { matRefs.current[i] = el }}
            color="#dc2626" emissive="#991b1b" emissiveIntensity={0.9}
            transparent opacity={0.06} depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

// ── Camera rig — rides the spline + mouse micro-parallax on top
function CameraRig() {
  const { camera } = useThree()
  // Smoothed camera state (lerped — feels physical, not snappy)
  const state = useRef({
    pos:     new THREE.Vector3(0, 0, 22),
    lookAt:  new THREE.Vector3(0, 0, 10),
    _tmpPos: new THREE.Vector3(),
    _tmpTan: new THREE.Vector3(),
    _tmpLook: new THREE.Vector3(),
  })

  useFrame(() => {
    if (!shared.visible) return
    const { pos, lookAt, _tmpPos, _tmpTan, _tmpLook } = state.current
    const s  = Math.min(shared.scroll, 0.9999)  // clamp so getTangent is safe

    // Spline position + forward direction at current scroll
    SPLINE.getPoint(s, _tmpPos)
    SPLINE.getTangent(s, _tmpTan).normalize()

    // Mouse adds lateral/vertical offset perpendicular to travel
    const right = new THREE.Vector3().crossVectors(_tmpTan, new THREE.Vector3(0, 1, 0)).normalize()
    const up    = new THREE.Vector3().crossVectors(right, _tmpTan).normalize()
    _tmpPos.addScaledVector(right, shared.mouse.x * 1.8)
    _tmpPos.addScaledVector(up,   -shared.mouse.y * 1.2)

    // Smooth lerp toward spline position
    pos.lerp(_tmpPos, 0.055)
    camera.position.copy(pos)

    // Look slightly ahead on the path (0.04 ahead in t)
    const lookT = Math.min(s + 0.04, 0.9999)
    SPLINE.getPoint(lookT, _tmpLook)
    lookAt.lerp(_tmpLook, 0.055)
    camera.lookAt(lookAt)
  })

  return null
}

// ── Root
export function ThreeCanvas() {
  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    setMobile(window.innerWidth < 1024)
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight
      shared.scroll = max > 0 ? window.scrollY / max : 0
    }
    const onMouse = (e: MouseEvent) => {
      shared.mouse.x =  e.clientX / window.innerWidth  - 0.5
      shared.mouse.y =  e.clientY / window.innerHeight - 0.5
    }
    const onVisibility = () => { shared.visible = !document.hidden }
    window.addEventListener('scroll',            onScroll,     { passive: true })
    window.addEventListener('mousemove',         onMouse,      { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('scroll',    onScroll)
      window.removeEventListener('mousemove', onMouse)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 22], fov: 55 }}
        gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[ 4,  6,  4]} intensity={2.0} color="#dc2626" />
        <pointLight position={[-6, -4, -4]} intensity={0.7} color="#7f1d1d" />

        <ParticleField count={mobile ? 80 : 260} />
        {!mobile && <FloatingIcosahedra />}
        <GlowOrbs />

        {/* Portals along the spline — one between each section */}
        {PORTAL_TS.map((t, i) => (
          <group key={i}>
            <Portal      t={t} index={i} />
            <PortalInner t={t} index={i} />
          </group>
        ))}

        <CameraRig />
      </Canvas>
    </div>
  )
}
