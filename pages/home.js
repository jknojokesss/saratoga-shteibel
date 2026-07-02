import Head from 'next/head'
import { useState, useEffect, useRef } from 'react'

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

// Optional shul photo path in /public (e.g. '/shul-photo.jpg'). Falls back to a plain band.
const SHUL_PHOTO = '/shul-photo.jpg'

function Pin({ color }) {
  return (
    <span style={{ position: 'absolute', top: -9, left: '50%', transform: 'translateX(-50%)', width: 16, height: 16, borderRadius: '50%', background: color, boxShadow: 'inset -2px -2px 3px rgba(0,0,0,.3), inset 2px 2px 3px rgba(255,255,255,.5), 0 2px 3px rgba(0,0,0,.3)' }} />
  )
}

export default function Home() {
  const [announcements, setAnnouncements] = useState(FALLBACK_ANNOUNCEMENTS)
  const [scheduleUrl, setScheduleUrl] = useState(null)
  const [pdfFailed, setPdfFailed] = useState(false)
  const pdfCanvas = useRef(null)
  useEffect(() => {
    fetch('/api/announcements/list').then((r) => r.json()).then((d) => {
      if (d.announcements && d.announcements.length) setAnnouncements(d.announcements)
    }).catch(() => {})
    fetch('/api/announcements/schedule').then((r) => r.json()).then((d) => {
      if (d.url) setScheduleUrl(d.url)
    }).catch(() => {})
  }, [])

  // Render the schedule PDF's first page to a canvas (clean image, no viewer chrome).
  useEffect(() => {
    if (!scheduleUrl) return
    let cancelled = false
    function render() {
      const lib = window.pdfjsLib
      if (!lib) { setPdfFailed(true); return }
      try { lib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js' } catch (e) {}
      lib.getDocument(scheduleUrl).promise
        .then((pdf) => pdf.getPage(1))
        .then((page) => {
          if (cancelled) return
          const canvas = pdfCanvas.current
          if (!canvas) return
          const base = page.getViewport({ scale: 1 })
          // Render at a high fixed width and display scaled-down = crisp on any screen (supersampling).
          const vp = page.getViewport({ scale: 2200 / base.width })
          canvas.width = vp.width; canvas.height = vp.height
          canvas.style.width = '100%'; canvas.style.height = 'auto'
          return page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise
        })
        .catch(() => { if (!cancelled) setPdfFailed(true) })
    }
    if (window.pdfjsLib) { render() }
    else {
      const s = document.createElement('script')
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
      s.onload = render
      s.onerror = () => { if (!cancelled) setPdfFailed(true) }
      document.body.appendChild(s)
    }
    return () => { cancelled = true }
  }, [scheduleUrl])
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

        <div className="hero-band" style={{ position: 'relative', background: `#cfc7b6 center 42%/cover no-repeat`, backgroundImage: SHUL_PHOTO ? `url(${SHUL_PHOTO})` : 'none' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(30,45,78,0.16)' }} />
        </div>

        <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr' }}>

          <section className="col-bulletin" style={{ background: NAVY, padding: '24px 24px 34px' }}>
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

          <aside className="col-schedule" style={{ background: '#f7f3ec', padding: '24px 24px 34px' }}>
            <div style={{ fontFamily: SERIF, fontSize: 23, fontWeight: 600, color: NAVY }}>Shabbos Schedule</div>
            <div style={{ width: 38, height: 1.5, background: GOLD, margin: '8px 0 18px' }} />
            {scheduleUrl ? (
              <>
                <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 3, overflow: 'hidden', boxShadow: '0 3px 10px rgba(0,0,0,.08)', padding: pdfFailed ? '40px 20px' : 0, textAlign: 'center' }}>
                  {pdfFailed
                    ? <div style={{ color: MUTED }}><div style={{ fontFamily: SERIF, fontSize: 17, color: NAVY, marginBottom: 6 }}>This week's schedule is ready</div><div style={{ fontSize: 13 }}>Tap below to open it.</div></div>
                    : <canvas ref={pdfCanvas} onClick={() => window.open('/shabbos-schedule.pdf', '_blank')} title="Tap to open full schedule" style={{ display: 'block', width: '100%', cursor: 'pointer' }} />}
                </div>
                <div style={{ textAlign: 'center', marginTop: 14 }}>
                  <a href="/shabbos-schedule.pdf" target="_blank" rel="noreferrer" className="btn-navy" style={{ display: 'inline-block', background: NAVY, color: '#fff', fontSize: 12, fontWeight: 500, letterSpacing: 0.5, padding: '10px 22px', borderRadius: 3, textDecoration: 'none' }}>Open / Download PDF</a>
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
        .hero-band { height: 300px; }
        @media (max-width: 720px) {
          .main-grid { grid-template-columns: 1fr !important; }
          .col-schedule { order: -1; }
          .hero-band { height: 170px; }
        }
      `}</style>
    </>
  )
}
