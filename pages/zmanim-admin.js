import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'

const NAVY = '#1e2d4e'
const GOLD = '#c9a84c'
const CREAM = '#faf7f2'
const MUTED = '#7a7068'
const BORDER = '#ddd5c4'
const SERIF = "'Cormorant Garamond', Georgia, serif"
const SANS = "'Jost', -apple-system, system-ui, sans-serif"

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  fontSize: 14,
  padding: '10px 12px',
  border: `1px solid ${BORDER}`,
  borderRadius: 3,
  fontFamily: SANS,
  background: CREAM,
  outline: 'none',
  marginBottom: 10,
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('read failed'))
    reader.readAsDataURL(file)
  })
}

export default function ZmanimAdmin() {
  const [passcode, setPasscode] = useState('')
  const [pdfFile, setPdfFile] = useState(null)
  const [previewFile, setPreviewFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  async function upload() {
    setErr('')
    setMsg('')
    if (!passcode) {
      setErr('Enter the admin passcode.')
      return
    }
    if (!pdfFile && !previewFile) {
      setErr('Choose a PDF and/or a preview image (PNG or JPG).')
      return
    }
    setBusy(true)
    try {
      const body = { passcode }
      if (pdfFile) body.dataBase64 = await readFileAsDataUrl(pdfFile)
      if (previewFile) body.previewBase64 = await readFileAsDataUrl(previewFile)

      const r = await fetch('/api/announcements/upload-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const d = await r.json()
      if (!r.ok) {
        setErr(d.error || 'Upload failed.')
        return
      }
      setMsg('Uploaded — the Zmanim page should show the new flyer within a minute.')
      setPdfFile(null)
      setPreviewFile(null)
    } catch {
      setErr('Network error.')
    } finally {
      setBusy(false)
    }
  }

  const card = {
    background: '#fff',
    border: `1px solid ${BORDER}`,
    borderRadius: 4,
    padding: '22px 20px',
    marginBottom: 16,
    borderTop: `3px solid ${GOLD}`,
  }

  return (
    <>
      <Head>
        <title>Zmanim — Admin</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Jost:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div style={{ minHeight: '100vh', background: CREAM, padding: '32px 16px', fontFamily: SANS, color: '#2a2a2a' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 600, color: NAVY }}>Zmanim flyer</div>
          <div style={{ width: 44, height: 1.5, background: GOLD, margin: '8px 0 12px' }} />
          <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.55, marginBottom: 20 }}>
            Upload this week&apos;s schedule. The public page is{' '}
            <Link href="/this-week" style={{ color: NAVY }}>/this-week</Link>.
            Same passcode as other shul admin tools.
          </p>

          <div style={card}>
            <label style={{ fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: MUTED, display: 'block', marginBottom: 5 }}>
              Admin passcode
            </label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              style={inputStyle}
              autoComplete="current-password"
            />

            <label style={{ fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: MUTED, display: 'block', marginBottom: 5 }}>
              Schedule PDF
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdfFile(e.target.files[0] || null)}
              style={{ fontSize: 13, marginBottom: 14, display: 'block', width: '100%' }}
            />

            <label style={{ fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: MUTED, display: 'block', marginBottom: 5 }}>
              Preview image (PNG or JPG) — what people see on the page
            </label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setPreviewFile(e.target.files[0] || null)}
              style={{ fontSize: 13, marginBottom: 14, display: 'block', width: '100%' }}
            />

            {err && <div style={{ fontSize: 13, color: '#B23A2E', marginBottom: 10 }}>{err}</div>}
            {msg && <div style={{ fontSize: 13, color: '#2E7D32', marginBottom: 10 }}>{msg}</div>}

            <button
              type="button"
              onClick={upload}
              disabled={busy}
              style={{
                width: '100%',
                padding: 12,
                border: 'none',
                borderRadius: 3,
                background: NAVY,
                color: '#fff',
                fontSize: 14,
                fontWeight: 500,
                fontFamily: SANS,
                cursor: busy ? 'wait' : 'pointer',
              }}
            >
              {busy ? 'Uploading…' : 'Upload to site'}
            </button>
          </div>

          <p style={{ fontSize: 12, color: MUTED }}>
            The old Bulletin Board admin at <code>/announcements-admin</code> needed a working announcements database just to sign in.
            Use this page for zmanim only.
          </p>
        </div>
      </div>
    </>
  )
}
