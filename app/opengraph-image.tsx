import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Shaurya Vardhan Shandilya — AI Automation Builder'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Module-level fetch — resolved once per edge worker instance, not per request
const fontBold = fetch(
  'https://fonts.bunny.net/inter/files/inter-latin-700-normal.woff2'
).then(r => r.arrayBuffer())

const fontRegular = fetch(
  'https://fonts.bunny.net/inter/files/inter-latin-400-normal.woff2'
).then(r => r.arrayBuffer())

export default async function Image() {
  const [bold, regular] = await Promise.all([fontBold, fontRegular])

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#09090b',
          padding: '72px 80px',
          fontFamily: 'Inter',
          position: 'relative',
        }}
      >
        {/* Red top-edge accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #dc2626 0%, #7f1d1d 60%, transparent 100%)',
            display: 'flex',
          }}
        />

        {/* Content — fills height */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>

          {/* Top: category label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '2px', backgroundColor: '#dc2626', display: 'flex' }} />
            <span style={{ color: '#dc2626', fontSize: '14px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              AI Automation Builder
            </span>
          </div>

          {/* Middle: name block */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ color: '#ffffff', fontSize: '80px', fontWeight: 700, lineHeight: 1.0, letterSpacing: '-0.02em' }}>
              Shaurya Vardhan
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <span style={{ color: '#dc2626', fontSize: '80px', fontWeight: 700, lineHeight: 1.0, letterSpacing: '-0.02em' }}>
                Shandilya
              </span>
              {/* Decorative corner accent */}
              <div style={{
                display: 'flex',
                width: '60px',
                height: '60px',
                border: '2px solid #991b1b',
                transform: 'rotate(45deg)',
                opacity: 0.6,
              }} />
            </div>

            {/* Divider */}
            <div style={{ width: '100%', height: '1px', backgroundColor: '#27272a', marginTop: '16px', display: 'flex' }} />

            {/* Tagline */}
            <div style={{ color: '#71717a', fontSize: '22px', fontWeight: 400, marginTop: '16px', letterSpacing: '0.01em' }}>
              VAPI Voice Agents · n8n Automation Pipelines · Research Intern @ The HEART Venture
            </div>
          </div>

          {/* Bottom: skills + URL */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            {/* Skill pills */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {['VAPI', 'n8n', 'Python', 'Next.js', 'AI'].map(tag => (
                <div
                  key={tag}
                  style={{
                    display: 'flex',
                    padding: '6px 14px',
                    backgroundColor: '#18181b',
                    border: '1px solid #3f3f46',
                    borderRadius: '999px',
                    color: '#a1a1aa',
                    fontSize: '13px',
                    fontWeight: 400,
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>

            {/* URL */}
            <div style={{ color: '#52525b', fontSize: '14px', fontWeight: 400, fontFamily: 'Inter' }}>
              shauryashandilya.vercel.app
            </div>
          </div>

        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Inter', data: bold,    weight: 700, style: 'normal' },
        { name: 'Inter', data: regular, weight: 400, style: 'normal' },
      ],
    }
  )
}
