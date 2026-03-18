import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Gzip/Brotli compress all responses
  compress: true,
  // Tree-shake heavy packages — only bundle imported symbols
  experimental: {
    optimizePackageImports: ['three', '@react-three/fiber', '@react-three/drei', 'framer-motion'],
    // Inline critical CSS into the initial HTML payload (eliminates render-blocking link tag)
    optimizeCss: true,
  },
  // Serve modern image formats where supported
  images: {
    formats: ['image/avif', 'image/webp'],
  },
}

export default nextConfig
