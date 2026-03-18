'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useRef, useMemo, useEffect, useState } from 'react'
import * as THREE from 'three'

// ── Module-level shared state (client-only — always imported with ssr:false)
// One set of event listeners for the whole canvas tree; read every frame via ref.
const shared = { scroll: 0, visible: true }

// ── Particle field
function ParticleField({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null)

  const geo = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 8 + Math.random() * 12
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [count])

  // Dispose geometry on unmount
  useEffect(() => () => { geo.dispose() }, [geo])

  useFrame(({ clock }) => {
    if (!shared.visible || !ref.current) return
    const t = clock.elapsedTime
    ref.current.rotation.y = t * 0.018
    ref.current.rotation.x = t * 0.006
    ref.current.position.y = -shared.scroll * 7
  })

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        size={0.045}
        color="#dc2626"
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

// ── Floating wireframe icosahedra — skipped on mobile
function FloatingIcosahedra() {
  const groupRef = useRef<THREE.Group>(null)
  const meshRefs = useRef<(THREE.Mesh | null)[]>([])

  const config = useMemo(() => [
    { pos: [-6,  3,  -8] as const, scale: 1.4, speed: 0.12, bobAmp: 0.35, phase: 0.0 },
    { pos: [ 7, -2, -13] as const, scale: 2.0, speed: 0.08, bobAmp: 0.50, phase: 1.3 },
    { pos: [-4, -5,  -6] as const, scale: 0.9, speed: 0.18, bobAmp: 0.28, phase: 2.1 },
    { pos: [ 5,  5, -10] as const, scale: 1.6, speed: 0.10, bobAmp: 0.42, phase: 0.7 },
    { pos: [ 0, -6, -16] as const, scale: 2.4, speed: 0.07, bobAmp: 0.60, phase: 3.5 },
    { pos: [-8,  1, -14] as const, scale: 1.8, speed: 0.09, bobAmp: 0.45, phase: 1.9 },
    { pos: [ 3,  7,  -9] as const, scale: 1.1, speed: 0.15, bobAmp: 0.30, phase: 4.2 },
    { pos: [-2, -9, -11] as const, scale: 1.3, speed: 0.11, bobAmp: 0.38, phase: 5.1 },
  ], [])

  useFrame(({ clock }) => {
    if (!shared.visible || !groupRef.current) return
    const t = clock.elapsedTime
    groupRef.current.position.y = -shared.scroll * 4
    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      const c = config[i]
      mesh.rotation.x = t * c.speed
      mesh.rotation.z = t * c.speed * 0.7
      mesh.position.y = c.pos[1] + Math.sin(t * c.speed * 3 + c.phase) * c.bobAmp
    })
  })

  return (
    <group ref={groupRef}>
      {config.map((c, i) => (
        <mesh key={i} position={c.pos} ref={el => { meshRefs.current[i] = el }}>
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

// ── Deep background glow orbs — breathing opacity
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
    groupRef.current.position.y = -shared.scroll * 2
    matRefs.current.forEach((mat, i) => {
      if (!mat) return
      mat.opacity = 0.06 + Math.sin(t * 0.45 + orbs[i].phase) * 0.025
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

// ── Camera rig — smooth mouse parallax
function CameraRig() {
  const { camera } = useThree()
  const mouse = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      mouse.current.x =  e.clientX / window.innerWidth  - 0.5
      mouse.current.y =  e.clientY / window.innerHeight - 0.5
    }
    window.addEventListener('mousemove', handle, { passive: true })
    return () => window.removeEventListener('mousemove', handle)
  }, [])

  useFrame(() => {
    if (!shared.visible) return
    camera.position.x += (mouse.current.x * 2.5 - camera.position.x) * 0.04
    camera.position.y += (-mouse.current.y * 1.5 - camera.position.y) * 0.04
    camera.lookAt(0, 0, 0)
  })

  return null
}

// ── Root — detects mobile, registers shared listeners once
export function ThreeCanvas() {
  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    // Mobile detection — reduce particle count on narrow screens
    setMobile(window.innerWidth < 1024)

    // Shared scroll listener — one read per scroll event, not per frame
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight
      shared.scroll = max > 0 ? window.scrollY / max : 0
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    // Pause WebGL when tab is hidden — saves GPU + battery
    const onVisibility = () => { shared.visible = !document.hidden }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.removeEventListener('scroll', onScroll)
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

        {/* Mobile gets a lighter particle count; icosahedra skipped entirely */}
        <ParticleField count={mobile ? 80 : 280} />
        {!mobile && <FloatingIcosahedra />}
        <GlowOrbs />
        <CameraRig />
      </Canvas>
    </div>
  )
}
