import Head from 'next/head'
import { useState, useEffect } from 'react'

const NAVY = '#1e2d4e'
const GOLD = '#c9a84c'
const GOLD_LIGHT = '#e8d5a3'
const CREAM = '#faf7f2'
const MUTED = '#7a7068'
const BORDER = '#ddd5c4'
const SERIF = "'Cormorant Garamond', Georgia, serif"
const SANS = "'Jost', -apple-system, system-ui, sans-serif"

// Announcements are managed at /announcements-admin and stored in Supabase.
// This fallback shows only if the API can't be reached.
const FALLBACK_ANNOUNCEMENTS = [
  { tag: 'Welcome', title: 'Welcome to our new website', body: 'Announcements will be posted here on the bulletin board.', pin: GOLD },
]
const TILTS = [-1.3, 0.9, -0.6, 1.1, -1.0, 0.7]

// Set to the PDF path (e.g. '/shabbos-schedule.pdf') once uploaded to /public.
const SCHEDULE_PDF = null
// Optional shul photo path in /public (e.g. '/shul-photo.jpg'). Falls back to a plain band.
const SHUL_PHOTO = '/shul-photo.jpg'

function Pin({ color }) {
  return (
    <span style={{ position: 'absolute', top: -9, left: '50%', transform: 'translateX(-50%)', width: 16, height: 16, borderRadius: '50%', background: color, boxShadow: 'inset -2px -2px 3px rgba(0,0,0,.3), inset 2px 2px 3px rgba(255,255,255,.5), 0 2px 3px rgba(0,0,0,.3)' }} />
  )
}

export default function Home() {
  const [announcements, setAnnouncements] = useState(FALLBACK_ANNOUNCEMENTS)
  useEffect(() => {
    fetch('/api/announcements/list').then((r) => r.json()).then((d) => {
      if (d.announcements && d.announcements.length) setAnnouncements(d.announcements)
    }).catch(() => {})
  }, [])
  return (
    <>
      <Head>
        <title>Saratoga Shteibel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ minHeight: '100vh', background: CREAM, fontFamily: SANS, color: '#2a2a2a' }}>

        <header style={{ background: '#fff', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `3px solid ${GOLD}`, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="/logo.png" alt="Saratoga Shteibel" style={{ height: 54, width: 'auto', mixBlendMode: 'multiply' }} />
            <div>
              <div style={{ fontFamily: SERIF, fontSize: 25, fontWeight: 600, color: NAVY, lineHeight: 1 }}>Saratoga Shteibel</div>
              <div style={{ fontSize: 11, color: MUTED, letterSpacing: 0.5, marginTop: 4 }}>166 Woodleigh Place · Toms River, NJ 08755</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <a href="/member-signin" className="btn-outline" style={{ border: `1.5px solid ${NAVY}`, color: NAVY, fontSize: 12, fontWeight: 500, letterSpacing: 0.5, padding: '11px 18px', borderRadius: 3, textDecoration: 'none' }}>MEMBER SIGN IN</a>
            <a href="/donate" className="btn-gold" style={{ background: GOLD, color: NAVY, fontSize: 13, fontWeight: 500, letterSpacing: 0.5, padding: '12px 26px', borderRadius: 3, textDecoration: 'none' }}>DONATE</a>
          </div>
        </header>

        <div style={{ height: 220, position: 'relative', background: `#cfc7b6 center/cover no-repeat`, backgroundImage: SHUL_PHOTO ? `url(${SHUL_PHOTO})` : 'none' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(30,45,78,0.34)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontFamily: SERIF, fontSize: 30, color: '#fff', letterSpacing: 0.5, textShadow: '0 2px 12px rgba(0,0,0,.4)' }}>Saratoga Shteibel</div>
          </div>
        </div>

        <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr' }}>

          <section style={{ background: NAVY, padding: '24px 24px 34px' }}>
            <div style={{ fontFamily: SERIF, fontSize: 23, fontWeight: 600, color: GOLD_LIGHT }}>Bulletin Board</div>
            <div style={{ width: 38, height: 1.5, background: GOLD, margin: '8px 0 26px' }} />
            {announcements.map((a, i) => (
              <div key={a.id || i} style={{ position: 'relative', background: '#fffdf8', padding: '17px 18px 16px', borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,.28)', transform: `rotate(${TILTS[i % TILTS.length]}deg)`, marginBottom: 26 }}>
                <Pin color={a.pin} />
                <div style={{ fontSize: 10, letterSpacing: 1, color: '#b08a2e', textTransform: 'uppercase' }}>{a.tag}</div>
                <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 600, color: NAVY, margin: '3px 0 5px' }}>{a.title}</div>
                <div style={{ fontSize: 12.5, color: '#6a6258', lineHeight: 1.55 }}>{a.body}</div>
              </div>
            ))}
          </section>

          <aside style={{ background: '#f7f3ec', padding: '24px 24px 34px' }}>
            <div style={{ fontFamily: SERIF, fontSize: 23, fontWeight: 600, color: NAVY }}>Shabbos Schedule</div>
            <div style={{ width: 38, height: 1.5, background: GOLD, margin: '8px 0 18px' }} />
            {SCHEDULE_PDF ? (
              <>
                <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 3, overflow: 'hidden', boxShadow: '0 3px 10px rgba(0,0,0,.08)' }}>
                  <iframe src={SCHEDULE_PDF} title="Shabbos Schedule" style={{ width: '100%', height: 460, border: 'none', display: 'block' }} />
                </div>
                <div style={{ textAlign: 'center', marginTop: 14 }}>
                  <a href={SCHEDULE_PDF} download className="btn-navy" style={{ display: 'inline-block', background: NAVY, color: '#fff', fontSize: 12, fontWeight: 500, letterSpacing: 0.5, padding: '10px 22px', borderRadius: 3, textDecoration: 'none' }}>Download PDF</a>
                </div>
              </>
            ) : (
              <div style={{ background: '#fff', border: `1px dashed ${BORDER}`, borderRadius: 3, padding: '40px 20px', textAlign: 'center', color: MUTED }}>
                <div style={{ fontFamily: SERIF, fontSize: 17, color: NAVY, marginBottom: 6 }}>Posted each week</div>
                <div style={{ fontSize: 12.5, lineHeight: 1.6 }}>This week's Shabbos schedule will appear here as a PDF — viewable and downloadable.</div>
              </div>
            )}
          </aside>

        </div>

        <footer style={{ background: NAVY, padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontFamily: SERIF, fontSize: 15, color: GOLD_LIGHT }}>Saratoga Shteibel</div>
          <div style={{ fontSize: 11, color: '#9aa6bd' }}>166 Woodleigh Place · Toms River, NJ 08755</div>
        </footer>

      </div>

      <style jsx>{`
        .btn-gold:hover { background: #d8b95e; }
        .btn-outline:hover { background: ${NAVY}; color: #fff !important; }
        .btn-navy:hover { background: ${'#2c3e6b'}; }
        @media (max-width: 720px) {
          .main-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
