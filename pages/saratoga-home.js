import Head from 'next/head'

const LOGO = 'https://cdn.logo.cardknox.com/6/0/6/4/7/e89e2e8922e9243f9ce5089b9_paymentsite_41621.png?v=639153325573841273'
const FONT = '-apple-system, system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

export default function SaratogaHome() {
  return (
    <>
      <Head>
        <title>Saratoga Shteibel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{ minHeight: '100vh', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: FONT }}>
        <div style={{ width: '100%', maxWidth: 560, textAlign: 'center' }}>
          <div style={{ overflow: 'hidden', width: '100%', maxWidth: 380, margin: '0 auto 22px', lineHeight: 0 }}>
            <img src={LOGO} alt="Saratoga Shteibel" style={{ width: '100%', height: 'auto', display: 'block', transform: 'scale(1.55)', transformOrigin: 'center' }} />
          </div>

          <div style={{ fontSize: 13, letterSpacing: 2.5, color: '#A89B86', textTransform: 'uppercase', marginBottom: 14 }}>Website under construction</div>

          <div style={{ fontSize: 25, color: '#243B4A', fontWeight: 600, lineHeight: 1.3, marginBottom: 12 }}>
            Our new site is on the way.
          </div>
          <div style={{ fontSize: 16, color: '#5E7180', lineHeight: 1.6, marginBottom: 32 }}>
            But you can still donate to support the shteibel.
          </div>

          <a href="/donate" style={{ display: 'inline-block', background: '#1C8C8C', color: '#fff', fontSize: 18, fontWeight: 600, textDecoration: 'none', padding: '16px 52px', borderRadius: 12, letterSpacing: 0.5, boxShadow: '0 2px 10px rgba(28,140,140,0.25)' }}>
            Donate
          </a>
        </div>
      </div>
    </>
  )
}
