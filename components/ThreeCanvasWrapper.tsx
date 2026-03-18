'use client'

// Client-component wrapper so we can use { ssr: false } with next/dynamic.
// Server Components cannot use ssr:false — this shim lives on the client side.
import dynamic from 'next/dynamic'

const ThreeCanvas = dynamic(
  () => import('./ThreeCanvas').then(m => ({ default: m.ThreeCanvas })),
  { ssr: false }
)

export function ThreeCanvasWrapper() {
  return <ThreeCanvas />
}
