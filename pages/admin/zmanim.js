import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { AdminPageShell, adminCardStyle } from '../../components/AdminChrome'
import { useAdminPasscode } from '../../lib/useAdminPasscode'
import { adminFontsLink } from '../../lib/adminTheme'

const NAVY = '#161d25'
const GOLD = '#b08d4b'
const CREAM = '#f6f6f2'
const MUTED = '#6e7a85'
const BORDER = '#cdd0cb'
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
  const [passcode, setPasscode] = useAdminPasscode()
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

  return (
    <>
      <Head>
        <title>Zmanim — Admin</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <link href={adminFontsLink} rel="stylesheet" />
      </Head>
      <AdminPageShell title="Zmanim flyer" maxWidth={480}>
          <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.55, marginBottom: 20 }}>
            Upload this week&apos;s schedule. Public page:{' '}
            <Link href="/this-week" style={{ color: NAVY }}>/this-week</Link>.
            Sign in at <Link href="/admin" style={{ color: NAVY }}>/admin</Link> first to prefill the passcode.
          </p>

          <div style={adminCardStyle()}>
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
      </AdminPageShell>
    </>
  )
}
