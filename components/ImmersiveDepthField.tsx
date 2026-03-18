'use client'

import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'

// Orbs at different Z depths — deeper = slower parallax = real depth sensation
const ORBS = [
  // Deep background (barely moves)
  { id: 0, x: '4%',  y: '6%',   z: -180, w: 700, h: 700, color: 'rgba(153,27,27,0.08)',  blur: 130, dur: 14 },
  { id: 1, x: '82%', y: '18%',  z: -160, w: 550, h: 550, color: 'rgba(127,29,29,0.07)',  blur: 110, dur: 11 },
  { id: 2, x: '50%', y: '52%',  z: -140, w: 620, h: 620, color: 'rgba(100,15,15,0.06)',  blur: 120, dur: 16 },
  { id: 3, x: '14%', y: '78%',  z: -110, w: 480, h: 480, color: 'rgba(185,28,28,0.06)',  blur: 100, dur: 10 },
  // Midground
  { id: 4, x: '72%', y: '62%',  z: -70,  w: 380, h: 380, color: 'rgba(153,27,27,0.09)',  blur: 80,  dur: 8  },
  { id: 5, x: '28%', y: '32%',  z: -50,  w: 300, h: 300, color: 'rgba(200,30,30,0.07)',  blur: 65,  dur: 12 },
  { id: 6, x: '88%', y: '82%',  z: -30,  w: 340, h: 340, color: 'rgba(120,18,18,0.10)',  blur: 70,  dur: 7  },
  // Near (moves faster — sells the depth)
  { id: 7, x: '18%', y: '48%',  z: 30,   w: 200, h: 200, color: 'rgba(220,38,38,0.07)',  blur: 45,  dur: 6  },
  { id: 8, x: '62%', y: '28%',  z: 50,   w: 170, h: 170, color: 'rgba(185,28,28,0.09)',  blur: 38,  dur: 5  },
  { id: 9, x: '44%', y: '88%',  z: 40,   w: 220, h: 220, color: 'rgba(153,27,27,0.08)',  blur: 50,  dur: 9  },
  // Accent sparks
  { id: 10, x: '92%', y: '44%', z: -20,  w: 140, h: 140, color: 'rgba(239,68,68,0.06)',  blur: 30,  dur: 7  },
  { id: 11, x: '36%', y: '14%', z: 20,   w: 160, h: 160, color: 'rgba(153,27,27,0.07)',  blur: 35,  dur: 8  },
]

function DepthOrb({ orb, scrollY }: { orb: (typeof ORBS)[0]; scrollY: MotionValue<number> }) {
  // Deeper orbs (more negative z) move barely — close orbs move more
  // This is the core of the parallax depth illusion
  const normalised = (orb.z + 200) / 250  // 0 = deepest, ~1 = shallowest
  const translateY = useTransform(scrollY, v => -v * normalised * 0.14)
  const delay = (orb.id * 1.3) % 8

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: orb.x,
        top: orb.y,
        width: orb.w,
        height: orb.h,
        borderRadius: '50%',
        background: orb.color,
        filter: `blur(${orb.blur}px)`,
        translateY,
        translateX: '-50%',
        animation: `orb-breathe ${orb.dur}s ease-in-out ${delay}s infinite`,
      }}
    />
  )
}

export function ImmersiveDepthField() {
  const { scrollY } = useScroll()

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden select-none"
      style={{ zIndex: 0 }}
      aria-hidden
    >
      {ORBS.map(orb => (
        <DepthOrb key={orb.id} orb={orb} scrollY={scrollY} />
      ))}
    </div>
  )
}
