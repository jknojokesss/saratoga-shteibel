import Head from 'next/head'

const LOGO = '/logo.png'
const NAVY = '#1e2d4e'
const GOLD = '#c9a84c'
const MUTED = '#7a7068'
const CREAM = '#faf7f2'
const FONT_SERIF = "'Cormorant Garamond', Georgia, serif"
const FONT_SANS = "'Jost', -apple-system, system-ui, sans-serif"

export default function SaratogaHome() {
  return (
    <>
      <Head>
        <title>Saratoga Shteibel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>
      <div style={{ minHeight: '100vh', background: CREAM, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: FONT_SANS }}>
        <div style={{ width: '100%', maxWidth: 560, textAlign: 'center' }}>
          <img src={LOGO} alt="Saratoga Shteibel" style={{ width: '100%', maxWidth: 340, height: 'auto', margin: '0 auto 24px', display: 'block' }} />

          <div style={{ fontSize: 12, letterSpacing: 3, color: GOLD, textTransform: 'uppercase', marginBottom: 18, fontWeight: 400 }}>Website under construction</div>

          <div style={{ fontFamily: FONT_SERIF, fontSize: 30, color: NAVY, fontWeight: 500, lineHeight: 1.3, marginBottom: 14 }}>
            Our new site is on the way.
          </div>
          <div style={{ fontSize: 16, color: MUTED, lineHeight: 1.6, marginBottom: 12, fontWeight: 300 }}>
            But you can still donate to support the shteibel.
          </div>

          <div style={{ width: 44, height: 1.5, background: GOLD, margin: '18px auto 30px' }} />

          <a href="/donate" style={{ display: 'inline-block', background: NAVY, color: '#fff', fontSize: 15, fontWeight: 500, textDecoration: 'none', padding: '16px 46px', borderRadius: 3, letterSpacing: 0.5 }}>
            Donate
          </a>
        </div>
      </div>
    </>
  )
}
