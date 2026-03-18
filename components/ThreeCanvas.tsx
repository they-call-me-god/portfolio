'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useRef, useMemo, useEffect, useState } from 'react'
import * as THREE from 'three'

// ── Shared state — one listener, read every frame
const shared = { scroll: 0, visible: true, mouse: { x: 0, y: 0 } }

// ── Camera spline — curves through 3D space (non-linear feel)
const SPLINE = new THREE.CatmullRomCurve3([
  new THREE.Vector3(  0,   0,  22),  // entrance — far back
  new THREE.Vector3(  0,   2,  10),  // hero      — fly in, arc up
  new THREE.Vector3( -5,  -1,   3),  // about     — bank hard left, drop
  new THREE.Vector3(  4,   3,  -4),  // projects  — sweep right and rise
  new THREE.Vector3( -2,  -2, -11),  // work       — dive left and down
  new THREE.Vector3(  0,   1, -18),  // contact   — settle to center
], false, 'catmullrom', 0.5)

// Gate positions — one at each section transition
const GATE_TS = [0.16, 0.32, 0.52, 0.70, 0.87]

// ── Star field — particles spread in a 3D volume (not a sphere shell)
// Feels like flying through deep space, not a telecom logo
function StarField({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 50   // wide x spread
      arr[i * 3 + 1] = (Math.random() - 0.5) * 36   // wide y spread
      arr[i * 3 + 2] = Math.random() * -42 + 6       // depth: 6 → -36
    }
    return arr
  }, [count])

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions.slice(), 3))
    return g
  }, [positions])

  const mat = useMemo(() => new THREE.PointsMaterial({
    size: 0.055, color: new THREE.Color('#cbd5e1'),
    transparent: true, opacity: 0.28, sizeAttenuation: true, depthWrite: false,
  }), [])

  useEffect(() => () => { geo.dispose(); mat.dispose() }, [geo, mat])

  useFrame(({ clock }) => {
    if (!shared.visible || !ref.current) return
    ref.current.rotation.y = clock.elapsedTime * 0.003
    ref.current.rotation.x = clock.elapsedTime * 0.0012
  })

  return <points ref={ref} geometry={geo} material={mat} />
}

// ── Crystal shards — large transparent octahedra deep in the background
// Replaces the blob glow orbs — angular, sharp, zero circles
function CrystalShards() {
  const groupRef = useRef<THREE.Group>(null)
  const meshRefs = useRef<(THREE.Mesh | null)[]>([])
  const matRefs  = useRef<(THREE.MeshStandardMaterial | null)[]>([])

  const shards = useMemo(() => [
    { pos: [-7,   3, -20] as const, scale: 4.0, speed: 0.038, phase: 0.0 },
    { pos: [ 10,  -4, -22] as const, scale: 5.0, speed: 0.026, phase: 1.8 },
    { pos: [  1,   9, -15] as const, scale: 3.0, speed: 0.055, phase: 3.1 },
    { pos: [-11, -3, -24] as const, scale: 4.5, speed: 0.031, phase: 2.5 },
    { pos: [  7,   7,  -9] as const, scale: 2.2, speed: 0.072, phase: 4.7 },
    { pos: [ -4,  -9,  -6] as const, scale: 2.0, speed: 0.082, phase: 1.2 },
  ], [])

  useFrame(({ clock }) => {
    if (!shared.visible || !groupRef.current) return
    const t = clock.elapsedTime
    const s = shared.scroll
    groupRef.current.position.z = s * 4.5

    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      const c = shards[i]
      mesh.rotation.x = t * c.speed + c.phase
      mesh.rotation.y = t * c.speed * 0.65
      mesh.rotation.z = t * c.speed * 0.42
    })
    matRefs.current.forEach((mat, i) => {
      if (!mat) return
      mat.opacity = 0.07 + s * 0.05 + Math.sin(t * 0.28 + shards[i].phase) * 0.018
    })
  })

  return (
    <group ref={groupRef}>
      {shards.map((s, i) => (
        <mesh key={i} position={s.pos} ref={el => { meshRefs.current[i] = el }}>
          <octahedronGeometry args={[s.scale, 0]} />
          <meshStandardMaterial
            ref={el => { matRefs.current[i] = el }}
            color="#dc2626"
            emissive="#7f1d1d"
            emissiveIntensity={0.35}
            transparent
            opacity={0.07}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

// ── Section gate — wireframe octahedron at each section waypoint
// Replaces portal torus rings — you fly THROUGH the corners, not circles
function SectionGate({ t, index }: { t: number; index: number }) {
  const outerRef = useRef<THREE.Mesh>(null)
  const innerRef = useRef<THREE.Mesh>(null)
  const matOuter = useRef<THREE.MeshStandardMaterial>(null)
  const matInner = useRef<THREE.MeshStandardMaterial>(null)

  const pos = useMemo(() => SPLINE.getPoint(t), [t])
  const phase = index * 1.4

  useFrame(({ clock }) => {
    if (!shared.visible) return
    const elapsed = clock.elapsedTime
    const dist = SPLINE.getPoint(shared.scroll).distanceTo(pos)
    const proximity = Math.max(0, 1 - dist / 6.5)

    if (outerRef.current) {
      outerRef.current.rotation.y = elapsed * 0.10 + phase
      outerRef.current.rotation.x = elapsed * 0.06
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = -(elapsed * 0.17 + phase)
      innerRef.current.rotation.z = elapsed * 0.08
    }
    if (matOuter.current) {
      matOuter.current.emissiveIntensity = 0.5 + proximity * 2.2
      matOuter.current.opacity = 0.28 + proximity * 0.5
    }
    if (matInner.current) {
      matInner.current.emissiveIntensity = 0.8 + proximity * 2.8
      matInner.current.opacity = 0.20 + proximity * 0.45
    }
  })

  return (
    <group position={pos}>
      {/* Outer wireframe octahedron */}
      <mesh ref={outerRef}>
        <octahedronGeometry args={[2.0, 0]} />
        <meshStandardMaterial
          ref={matOuter}
          color="#dc2626"
          emissive="#dc2626"
          emissiveIntensity={0.5}
          transparent
          opacity={0.28}
          wireframe
          depthWrite={false}
        />
      </mesh>
      {/* Inner counter-rotating tetrahedron */}
      <mesh ref={innerRef}>
        <tetrahedronGeometry args={[1.1, 0]} />
        <meshStandardMaterial
          ref={matInner}
          color="#f87171"
          emissive="#f87171"
          emissiveIntensity={0.8}
          transparent
          opacity={0.20}
          wireframe
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

// ── Floating crystal mix — wireframe tetrahedra + octahedra drifting off-path
// Sharp geometry, strong parallax vs the camera
function FloatingCrystals() {
  const groupRef = useRef<THREE.Group>(null)
  const meshRefs = useRef<(THREE.Mesh | null)[]>([])

  const config = useMemo(() => [
    { x: -8, y:  3, z:  2,  s: 0.65, speed: 0.10, bobAmp: 0.40, phase: 0.0, geo: 'oct' },
    { x:  9, y: -2, z: -3,  s: 0.90, speed: 0.07, bobAmp: 0.55, phase: 1.3, geo: 'tet' },
    { x: -6, y: -4, z: -8,  s: 0.50, speed: 0.16, bobAmp: 0.30, phase: 2.2, geo: 'oct' },
    { x:  7, y:  5, z: -5,  s: 0.75, speed: 0.09, bobAmp: 0.45, phase: 0.8, geo: 'tet' },
    { x:  2, y: -7, z: -14, s: 1.10, speed: 0.06, bobAmp: 0.65, phase: 3.6, geo: 'oct' },
    { x: -9, y:  2, z: -12, s: 0.85, speed: 0.08, bobAmp: 0.50, phase: 2.0, geo: 'tet' },
    { x:  5, y:  8, z: -7,  s: 0.55, speed: 0.13, bobAmp: 0.32, phase: 4.3, geo: 'oct' },
    { x: -3, y: -8, z:  0,  s: 0.70, speed: 0.10, bobAmp: 0.40, phase: 5.2, geo: 'tet' },
  ], [])

  useFrame(({ clock }) => {
    if (!shared.visible || !groupRef.current) return
    const t = clock.elapsedTime
    const s = shared.scroll
    groupRef.current.position.z = s * 12
    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      const c = config[i]
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
          {c.geo === 'oct'
            ? <octahedronGeometry  args={[c.s, 0]} />
            : <tetrahedronGeometry args={[c.s, 0]} />
          }
          <meshStandardMaterial
            color="#dc2626" emissive="#991b1b" emissiveIntensity={0.45}
            transparent opacity={0.18} wireframe
          />
        </mesh>
      ))}
    </group>
  )
}

// ── Camera rig — rides the spline + mouse micro-parallax on top
function CameraRig() {
  const { camera } = useThree()
  const state = useRef({
    pos:      new THREE.Vector3(0, 0, 22),
    lookAt:   new THREE.Vector3(0, 0, 10),
    _tmpPos:  new THREE.Vector3(),
    _tmpTan:  new THREE.Vector3(),
    _tmpLook: new THREE.Vector3(),
  })

  useFrame(() => {
    if (!shared.visible) return
    const { pos, lookAt, _tmpPos, _tmpTan, _tmpLook } = state.current
    const s = Math.min(shared.scroll, 0.9999)

    SPLINE.getPoint(s, _tmpPos)
    SPLINE.getTangent(s, _tmpTan).normalize()

    const right = new THREE.Vector3().crossVectors(_tmpTan, new THREE.Vector3(0, 1, 0)).normalize()
    const up    = new THREE.Vector3().crossVectors(right, _tmpTan).normalize()
    _tmpPos.addScaledVector(right,  shared.mouse.x *  1.8)
    _tmpPos.addScaledVector(up,    -shared.mouse.y *  1.2)

    pos.lerp(_tmpPos, 0.055)
    camera.position.copy(pos)

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
    window.addEventListener('scroll',             onScroll,     { passive: true })
    window.addEventListener('mousemove',          onMouse,      { passive: true })
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
        <ambientLight intensity={0.15} />
        <pointLight position={[ 5,  8,  3]} intensity={1.6} color="#dc2626" />
        <pointLight position={[-8, -5, -6]} intensity={0.5} color="#450a0a" />

        <StarField count={mobile ? 100 : 320} />
        {!mobile && <FloatingCrystals />}
        <CrystalShards />

        {GATE_TS.map((t, i) => (
          <SectionGate key={i} t={t} index={i} />
        ))}

        <CameraRig />
      </Canvas>
    </div>
  )
}
