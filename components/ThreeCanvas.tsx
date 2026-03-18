'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useRef, useMemo, useEffect, useState } from 'react'
import * as THREE from 'three'

// ── Module-level shared state
const shared = { scroll: 0, visible: true, mouse: { x: 0, y: 0 } }

// ── Particle field — expands outward + rotates faster as you scroll in
function ParticleField({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null)

  // Two sets of positions: resting sphere + exploded-out spread
  const [restPos, expandPos] = useMemo(() => {
    const rest   = new Float32Array(count * 3)
    const expand = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r     = 8 + Math.random() * 12
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      const sx    = Math.sin(phi) * Math.cos(theta)
      const sy    = Math.sin(phi) * Math.sin(theta)
      const sz    = Math.cos(phi)
      rest[i * 3]     = r * sx
      rest[i * 3 + 1] = r * sy
      rest[i * 3 + 2] = r * sz
      // Expanded: push 1.8× further out in every direction
      expand[i * 3]     = r * 1.8 * sx
      expand[i * 3 + 1] = r * 1.8 * sy
      expand[i * 3 + 2] = r * 1.8 * sz
    }
    return [rest, expand]
  }, [count])

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(restPos.slice(), 3))
    return g
  }, [restPos])

  useEffect(() => () => { geo.dispose() }, [geo])

  useFrame(({ clock }) => {
    if (!shared.visible || !ref.current) return
    const t = clock.elapsedTime
    const s = shared.scroll

    // Lerp particle positions toward expanded config as user scrolls
    const attr = ref.current.geometry.attributes.position as THREE.BufferAttribute
    const arr  = attr.array as Float32Array
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = THREE.MathUtils.lerp(restPos[i * 3],     expandPos[i * 3],     s * 0.7)
      arr[i * 3 + 1] = THREE.MathUtils.lerp(restPos[i * 3 + 1], expandPos[i * 3 + 1], s * 0.7)
      arr[i * 3 + 2] = THREE.MathUtils.lerp(restPos[i * 3 + 2], expandPos[i * 3 + 2], s * 0.7)
    }
    attr.needsUpdate = true

    // Spin accelerates as camera flies in
    const spinSpeed = 0.018 + s * 0.04
    ref.current.rotation.y = t * spinSpeed
    ref.current.rotation.x = t * (spinSpeed * 0.35)
  })

  const mat = useMemo(() => new THREE.PointsMaterial({
    size: 0.045,
    color: new THREE.Color('#dc2626'),
    transparent: true,
    opacity: 0.55,
    sizeAttenuation: true,
    depthWrite: false,
  }), [])
  useEffect(() => () => { mat.dispose() }, [mat])

  return <points ref={ref} geometry={geo} material={mat} />
}

// ── Icosahedra — rush TOWARD the camera as scroll increases
function FloatingIcosahedra() {
  const groupRef = useRef<THREE.Group>(null)
  const meshRefs = useRef<(THREE.Mesh | null)[]>([])

  const config = useMemo(() => [
    { x: -6, y:  3, z: -8,  scale: 1.4, speed: 0.12, bobAmp: 0.35, phase: 0.0 },
    { x:  7, y: -2, z: -13, scale: 2.0, speed: 0.08, bobAmp: 0.50, phase: 1.3 },
    { x: -4, y: -5, z: -6,  scale: 0.9, speed: 0.18, bobAmp: 0.28, phase: 2.1 },
    { x:  5, y:  5, z: -10, scale: 1.6, speed: 0.10, bobAmp: 0.42, phase: 0.7 },
    { x:  0, y: -6, z: -16, scale: 2.4, speed: 0.07, bobAmp: 0.60, phase: 3.5 },
    { x: -8, y:  1, z: -14, scale: 1.8, speed: 0.09, bobAmp: 0.45, phase: 1.9 },
    { x:  3, y:  7, z: -9,  scale: 1.1, speed: 0.15, bobAmp: 0.30, phase: 4.2 },
    { x: -2, y: -9, z: -11, scale: 1.3, speed: 0.11, bobAmp: 0.38, phase: 5.1 },
  ], [])

  useFrame(({ clock }) => {
    if (!shared.visible || !groupRef.current) return
    const t = clock.elapsedTime
    const s = shared.scroll
    // The whole group surges forward as camera flies in — icosahedra rush past you
    groupRef.current.position.z = s * 10
    groupRef.current.position.y = -s * 2

    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      const c = config[i]
      // Spin accelerates
      const spinMult = 1 + s * 3
      mesh.rotation.x = t * c.speed * spinMult
      mesh.rotation.z = t * c.speed * spinMult * 0.7
      mesh.position.y = c.y + Math.sin(t * c.speed * 3 + c.phase) * c.bobAmp
    })
  })

  return (
    <group ref={groupRef}>
      {config.map((c, i) => (
        <mesh key={i} position={[c.x, c.y, c.z]} ref={el => { meshRefs.current[i] = el }}>
          <icosahedronGeometry args={[c.scale, 0]} />
          <meshStandardMaterial
            color="#991b1b"
            emissive="#7f1d1d"
            emissiveIntensity={0.5}
            transparent
            opacity={0.14}
            wireframe
          />
        </mesh>
      ))}
    </group>
  )
}

// ── Depth ring — a large torus the camera flies through at mid-scroll
function DepthRing() {
  const ref = useRef<THREE.Mesh>(null)
  const mat = useRef<THREE.MeshStandardMaterial>(null)

  useFrame(({ clock }) => {
    if (!shared.visible || !ref.current || !mat.current) return
    const t = clock.elapsedTime
    const s = shared.scroll
    // Ring sits at z=-18; as camera flies in from z=10→3, at s≈0.5 you pass through it
    ref.current.rotation.z = t * 0.05
    ref.current.rotation.x = t * 0.03
    // Pulse when camera is close (s around 0.4-0.6)
    const proximity = Math.exp(-Math.pow((s - 0.5) * 6, 2))
    mat.current.emissiveIntensity = 0.3 + proximity * 1.2
    mat.current.opacity           = 0.08 + proximity * 0.18
  })

  return (
    <mesh ref={ref} position={[0, 0, -18]}>
      <torusGeometry args={[6, 0.05, 8, 64]} />
      <meshStandardMaterial
        ref={mat}
        color="#dc2626"
        emissive="#dc2626"
        emissiveIntensity={0.3}
        transparent
        opacity={0.08}
        depthWrite={false}
      />
    </mesh>
  )
}

// ── Glow orbs — breathe brighter as camera flies deeper
function GlowOrbs() {
  const groupRef = useRef<THREE.Group>(null)
  const matRefs  = useRef<(THREE.MeshStandardMaterial | null)[]>([])

  const orbs = useMemo(() => [
    { pos: [-5,  2, -20] as const, r: 4.0, phase: 0.0 },
    { pos: [ 7, -3, -22] as const, r: 5.0, phase: 2.1 },
    { pos: [ 0,  7, -18] as const, r: 3.2, phase: 4.3 },
    { pos: [-9, -4, -24] as const, r: 4.5, phase: 1.5 },
  ], [])

  useFrame(({ clock }) => {
    if (!shared.visible || !groupRef.current) return
    const t = clock.elapsedTime
    const s = shared.scroll
    // Orbs approach camera (different speed from icosahedra for parallax layers)
    groupRef.current.position.z = s * 5
    matRefs.current.forEach((mat, i) => {
      if (!mat) return
      // Get brighter as camera approaches
      const base = 0.06 + s * 0.09
      mat.opacity           = base + Math.sin(t * 0.45 + orbs[i].phase) * 0.025
      mat.emissiveIntensity = 0.9 + s * 1.2
    })
  })

  return (
    <group ref={groupRef}>
      {orbs.map((orb, i) => (
        <mesh key={i} position={orb.pos}>
          <sphereGeometry args={[orb.r, 32, 32]} />
          <meshStandardMaterial
            ref={el => { matRefs.current[i] = el }}
            color="#dc2626"
            emissive="#991b1b"
            emissiveIntensity={0.9}
            transparent
            opacity={0.06}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

// ── Camera rig — scroll drives a cinematic fly-through arc
function CameraRig() {
  const { camera } = useThree()
  // Smooth targets — lerped each frame so motion feels physical
  const cam = useRef({ x: 0, y: 0, z: 10, lx: 0, ly: 0 })

  useFrame(() => {
    if (!shared.visible) return
    const s  = shared.scroll
    const mx = shared.mouse.x
    const my = shared.mouse.y

    // Scroll-driven camera path:
    //   Z: 10 → 3  (fly 7 units INTO the scene)
    //   Y: 0 → 2.5 (gentle upward arc then level off)
    // lookAt follows scroll so direction feels forward
    const targetZ  = 10 - s * 7
    const targetY  = Math.sin(s * Math.PI) * 2.5   // arc: rises then settles
    const targetLY = s * 3                          // look slightly up-field
    const targetLX = mx * 1.5                       // look follows mouse X

    // Mouse adds lateral parallax ON TOP of scroll position
    cam.current.x  += (mx * 2.5  + 0 - cam.current.x)  * 0.04
    cam.current.y  += (targetY + (-my * 1.5) - cam.current.y)  * 0.04
    cam.current.z  += (targetZ - cam.current.z)          * 0.05
    cam.current.lx += (targetLX - cam.current.lx)        * 0.04
    cam.current.ly += (targetLY - cam.current.ly)        * 0.04

    camera.position.set(cam.current.x, cam.current.y, cam.current.z)
    camera.lookAt(cam.current.lx, cam.current.ly, 0)
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

    window.addEventListener('scroll',          onScroll,     { passive: true })
    window.addEventListener('mousemove',       onMouse,      { passive: true })
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
        camera={{ position: [0, 0, 10], fov: 55 }}
        gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.25} />
        <pointLight position={[ 4,  6,  4]} intensity={1.8} color="#dc2626" />
        <pointLight position={[-6, -4, -4]} intensity={0.6} color="#7f1d1d" />

        <ParticleField count={mobile ? 80 : 280} />
        {!mobile && <FloatingIcosahedra />}
        {!mobile && <DepthRing />}
        <GlowOrbs />
        <CameraRig />
      </Canvas>
    </div>
  )
}
