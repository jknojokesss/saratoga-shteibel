import { useState } from 'react'
import Head from 'next/head'

const NAVY = '#1e2d4e'
const GOLD = '#c9a84c'
const CREAM = '#faf7f2'
const MUTED = '#7a7068'
const BORDER = '#ddd5c4'
const SERIF = "'Cormorant Garamond', Georgia, serif"
const SANS = "'Jost', -apple-system, system-ui, sans-serif"

const PINS = [
  { label: 'Gold', value: '#c9a84c' },
  { label: 'Coral', value: '#d47c6a' },
  { label: 'Green', value: '#8bb87f' },
  { label: 'Navy', value: '#1e2d4e' },
]

const inputStyle = { width: '100%', boxSizing: 'border-box', fontSize: 14, padding: '10px 12px', border: `1px solid ${BORDER}`, borderRadius: 3, fontFamily: SANS, background: CREAM, outline: 'none', marginBottom: 10 }
const labelStyle = { fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: MUTED, display: 'block', marginBottom: 5 }

export default function AnnouncementsAdmin() {
  const [passcode, setPasscode] = useState('')
  const [items, setItems] = useState(null)
  const [draft, setDraft] = useState({ tag: '', title: '', body: '', pin: '#c9a84c', sort_order: 0 })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [schedUrl, setSchedUrl] = useState(null)
  const [schedFile, setSchedFile] = useState(null)
  const [schedBusy, setSchedBusy] = useState(false)
  const [schedMsg, setSchedMsg] = useState('')

  async function loadSchedule() {
    try { const r = await fetch('/api/announcements/schedule'); const d = await r.json(); setSchedUrl(d.url || null) } catch {}
  }

  function uploadSchedule() {
    if (!schedFile) { setSchedMsg('Choose a PDF first.'); return }
    setSchedMsg(''); setSchedBusy(true)
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const r = await fetch('/api/announcements/upload-schedule', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passcode, dataBase64: reader.result }),
        })
        const d = await r.json()
        if (!r.ok) { setSchedMsg(d.error || 'Upload failed.') }
        else { setSchedUrl(d.url); setSchedFile(null); setSchedMsg('Uploaded — it is now live on the site.') }
      } catch { setSchedMsg('Network error.') }
      finally { setSchedBusy(false) }
    }
    reader.onerror = () => { setSchedMsg('Could not read that file.'); setSchedBusy(false) }
    reader.readAsDataURL(schedFile)
  }

  async function call(action, item) {
    setError(''); setBusy(true)
    try {
      const r = await fetch('/api/announcements/admin', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode, action, item }),
      })
      const d = await r.json()
      if (!r.ok) { setError(d.error || 'Request failed.'); return false }
      setItems(d.announcements || [])
      return true
    } catch { setError('Network error.'); return false }
    finally { setBusy(false) }
  }

  function updateLocal(id, field, value) {
    setItems(items.map((it) => it.id === id ? { ...it, [field]: value } : it))
  }

  async function addNew() {
    if (!draft.title.trim()) { setError('Title is required.'); return }
    const ok = await call('create', { ...draft, sort_order: Number(draft.sort_order) || 0 })
    if (ok) setDraft({ tag: '', title: '', body: '', pin: '#c9a84c', sort_order: 0 })
  }

  const card = { background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 4, padding: '18px 20px', marginBottom: 16 }

  function PinPicker({ value, onChange }) {
    return (
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        {PINS.map((p) => (
          <button key={p.value} type="button" onClick={() => onChange(p.value)}
            title={p.label}
            style={{ width: 26, height: 26, borderRadius: '50%', background: p.value, cursor: 'pointer', border: value === p.value ? `2px solid ${NAVY}` : '2px solid transparent', boxShadow: value === p.value ? '0 0 0 2px #fff inset' : 'none' }} />
        ))}
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Bulletin Board — Admin</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>
      <div style={{ minHeight: '100vh', background: CREAM, padding: '32px 16px', fontFamily: SANS, color: '#2a2a2a' }}>
        <div style={{ maxWidth: 620, margin: '0 auto' }}>
          <div style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 600, color: NAVY }}>Bulletin Board — Admin</div>
          <div style={{ width: 44, height: 1.5, background: GOLD, margin: '8px 0 24px' }} />

          {!items && (
            <div style={{ ...card, maxWidth: 360 }}>
              <label style={labelStyle}>Admin passcode</label>
              <input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') call('list').then(function(ok){ if (ok) loadSchedule() }) }} style={inputStyle} />
              {error && <div style={{ fontSize: 13, color: '#B23A2E', marginBottom: 10 }}>{error}</div>}
              <button onClick={() => call('list').then(function(ok){ if (ok) loadSchedule() })} disabled={busy}
                style={{ width: '100%', padding: 12, border: 'none', borderRadius: 3, background: NAVY, color: '#fff', fontSize: 14, fontWeight: 500, fontFamily: SANS, cursor: 'pointer' }}>
                {busy ? 'Loading…' : 'Sign in'}
              </button>
            </div>
          )}

          {items && (
            <div>
              <div style={{ ...card, borderTop: `3px solid ${GOLD}` }}>
                <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 600, color: NAVY, marginBottom: 14 }}>Add announcement</div>
                <label style={labelStyle}>Tag (small label)</label>
                <input value={draft.tag} onChange={(e) => setDraft({ ...draft, tag: e.target.value })} placeholder="e.g. This Shabbos, Mazel Tov" style={inputStyle} />
                <label style={labelStyle}>Title *</label>
                <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Headline" style={inputStyle} />
                <label style={labelStyle}>Body</label>
                <textarea value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} placeholder="Details…" rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
                <label style={labelStyle}>Thumbtack color</label>
                <PinPicker value={draft.pin} onChange={(v) => setDraft({ ...draft, pin: v })} />
                <label style={labelStyle}>Order (lower shows first)</label>
                <input type="number" value={draft.sort_order} onChange={(e) => setDraft({ ...draft, sort_order: e.target.value })} style={{ ...inputStyle, width: 100 }} />
                {error && <div style={{ fontSize: 13, color: '#B23A2E', marginBottom: 10 }}>{error}</div>}
                <button onClick={addNew} disabled={busy}
                  style={{ padding: '11px 24px', border: 'none', borderRadius: 3, background: GOLD, color: NAVY, fontSize: 13, fontWeight: 500, fontFamily: SANS, cursor: 'pointer' }}>
                  {busy ? 'Posting…' : 'Post to board'}
                </button>
              </div>

              <div style={{ ...card, borderTop: `3px solid ${GOLD}` }}>
                <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 600, color: NAVY, marginBottom: 6 }}>Shabbos Schedule PDF</div>
                <div style={{ fontSize: 13, color: MUTED, marginBottom: 12 }}>
                  {schedUrl
                    ? <>Current schedule is live — <a href={schedUrl} target="_blank" rel="noreferrer" style={{ color: NAVY }}>view PDF</a>. Upload a new one to replace it.</>
                    : 'No schedule uploaded yet. Upload a PDF and it appears on the homepage instantly.'}
                </div>
                <input type="file" accept="application/pdf" onChange={(e) => { setSchedFile(e.target.files[0] || null); setSchedMsg('') }} style={{ fontSize: 13, marginBottom: 12, display: 'block' }} />
                {schedMsg && <div style={{ fontSize: 13, color: schedMsg.includes('live') ? '#2E7D32' : '#B23A2E', marginBottom: 10 }}>{schedMsg}</div>}
                <button onClick={uploadSchedule} disabled={schedBusy}
                  style={{ padding: '11px 24px', border: 'none', borderRadius: 3, background: NAVY, color: '#fff', fontSize: 13, fontWeight: 500, fontFamily: SANS, cursor: 'pointer' }}>
                  {schedBusy ? 'Uploading…' : 'Upload / replace schedule'}
                </button>
              </div>

              <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 600, color: NAVY, margin: '24px 0 12px' }}>
                Current announcements ({items.length})
              </div>

              {items.length === 0 && <div style={{ color: MUTED, fontSize: 14 }}>None yet — add one above.</div>}

              {items.map((it) => (
                <div key={it.id} style={card}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ width: 16, height: 16, borderRadius: '50%', background: it.pin }} />
                    <span style={{ fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', color: MUTED }}>{it.tag || 'no tag'}</span>
                  </div>
                  <label style={labelStyle}>Tag</label>
                  <input value={it.tag || ''} onChange={(e) => updateLocal(it.id, 'tag', e.target.value)} style={inputStyle} />
                  <label style={labelStyle}>Title</label>
                  <input value={it.title || ''} onChange={(e) => updateLocal(it.id, 'title', e.target.value)} style={inputStyle} />
                  <label style={labelStyle}>Body</label>
                  <textarea value={it.body || ''} onChange={(e) => updateLocal(it.id, 'body', e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
                  <PinPicker value={it.pin} onChange={(v) => updateLocal(it.id, 'pin', v)} />
                  <label style={labelStyle}>Order</label>
                  <input type="number" value={it.sort_order} onChange={(e) => updateLocal(it.id, 'sort_order', Number(e.target.value))} style={{ ...inputStyle, width: 100 }} />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => call('update', it)} disabled={busy}
                      style={{ padding: '9px 20px', border: 'none', borderRadius: 3, background: NAVY, color: '#fff', fontSize: 13, fontWeight: 500, fontFamily: SANS, cursor: 'pointer' }}>Save</button>
                    <button onClick={() => { if (confirm('Delete this announcement?')) call('delete', it) }} disabled={busy}
                      style={{ padding: '9px 20px', border: `1px solid #B23A2E`, borderRadius: 3, background: '#fff', color: '#B23A2E', fontSize: 13, fontWeight: 500, fontFamily: SANS, cursor: 'pointer' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
