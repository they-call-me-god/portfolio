import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Tree-shake heavy packages — only bundle imported symbols
  experimental: {
    optimizePackageImports: ['three', '@react-three/fiber', '@react-three/drei', 'framer-motion'],
  },
  // Serve modern image formats where supported
  images: {
    formats: ['image/avif', 'image/webp'],
  },
}

export default nextConfig
