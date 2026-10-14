import { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import { AdminBackLink } from '../../components/AdminChrome'
import { useAdminPasscode } from '../../lib/useAdminPasscode'

const NAVY = '#1e2d4e'
const GOLD = '#c9a84c'
const CREAM = '#faf7f2'
const MUTED = '#7a7068'
const BORDER = '#ddd5c4'
const SERIF = "'Cormorant Garamond', Georgia, serif"
const SANS = "'Jost', -apple-system, system-ui, sans-serif"

const EMPTY_FORM = {
  title: '',
  neighborhood: '',
  monthly_rent: '',
  bedrooms: '',
  bathrooms: '',
  available_date: '',
  description: '',
  distance_to_shul: '',
  contact_name: '',
  contact_phone: '',
  contact_email: '',
  status: 'active',
}

function fmtDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return iso
  }
}

export default function AdminRentals() {
  const [passcode, setPasscode] = useAdminPasscode()
  const [listings, setListings] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const autoTried = useRef(false)

  useEffect(() => {
    if (!passcode || listings !== null || autoTried.current) return
    autoTried.current = true
    load()
  }, [passcode, listings])

  async function api(action, body = {}) {
    const r = await fetch('/api/rentals/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode, action, ...body }),
    })
    const d = await r.json()
    if (!r.ok) throw new Error(d.error || 'Request failed')
    return d
  }

  async function load() {
    setError('')
    if (!passcode.trim()) {
      setError('Enter the admin passcode (same as Membership and Financials).')
      return
    }
    setBusy(true)
    try {
      const d = await api('list')
      setListings(d.listings || [])
    } catch (e) {
      setError(e.message)
      setListings(null)
      autoTried.current = false
    } finally {
      setBusy(false)
    }
  }

  function startCreate() {
    setEditId(null)
    setForm(EMPTY_FORM)
    setError('')
  }

  function startEdit(row) {
    setEditId(row.id)
    setForm({
      title: row.title,
      neighborhood: row.neighborhood,
      monthly_rent: String(row.monthlyRent),
      bedrooms: row.bedrooms != null ? String(row.bedrooms) : '',
      bathrooms: row.bathrooms != null ? String(row.bathrooms) : '',
      available_date: row.availableDate || '',
      description: row.description || '',
      distance_to_shul: row.distanceToShul || '',
      contact_name: row.contactName || '',
      contact_phone: row.contactPhone || '',
      contact_email: row.contactEmail || '',
      status: row.status,
    })
    setError('')
  }

  async function save(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const listing = {
        ...form,
        monthly_rent: Number(form.monthly_rent),
        bedrooms: form.bedrooms === '' ? null : form.bedrooms,
        bathrooms: form.bathrooms === '' ? null : form.bathrooms,
      }
      if (editId) await api('update', { id: editId, listing })
      else await api('create', { listing })
      setForm(EMPTY_FORM)
      setEditId(null)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function toggleStatus(row) {
    const next = row.status === 'active' ? 'hidden' : 'active'
    setBusy(true)
    setError('')
    try {
      await api('set_status', { id: row.id, listing: { status: next } })
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function renew(row) {
    if (!confirm(`Renew “${row.title}” for 60 more days?`)) return
    setBusy(true)
    try {
      await api('renew', { id: row.id })
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function remove(row) {
    if (!confirm(`Delete “${row.title}”? This cannot be undone.`)) return
    setBusy(true)
    try {
      await api('delete', { id: row.id })
      if (editId === row.id) startCreate()
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '9px 11px',
    border: `1px solid ${BORDER}`,
    borderRadius: 3,
    fontFamily: SANS,
    fontSize: 14,
    background: CREAM,
    marginBottom: 10,
  }
  const labelStyle = { fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', color: MUTED, display: 'block', marginBottom: 4 }

  if (!listings) {
    return (
      <>
        <Head><title>Rentals — Admin</title><meta name="robots" content="noindex" /></Head>
        <div style={{ minHeight: '100vh', background: CREAM, fontFamily: SANS, display: 'flex', justifyContent: 'center', paddingTop: '12vh' }}>
          <form
            onSubmit={(e) => { e.preventDefault(); load() }}
            style={{ background: '#fff', border: `1px solid ${BORDER}`, borderTop: `3px solid ${GOLD}`, borderRadius: 4, padding: '28px 26px', width: 320 }}
          >
            <AdminBackLink />
            <div style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 600, color: NAVY, marginBottom: 8 }}>Rentals</div>
            <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.5, marginBottom: 14 }}>
              Same passcode as <strong>Membership</strong> and <strong>Financials</strong>. If you already signed in at{' '}
              <a href="/admin" style={{ color: NAVY }}>/admin</a>, this page should open automatically.
            </p>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={passcode}
              placeholder="Admin passcode"
              onChange={(e) => setPasscode(e.target.value)}
              style={inputStyle}
            />
            {error && <div style={{ color: '#B23A2E', fontSize: 13 }}>{error}</div>}
            <button type="submit" disabled={busy} style={{ width: '100%', marginTop: 12, padding: 12, border: 'none', borderRadius: 3, background: NAVY, color: '#fff', fontWeight: 500, cursor: 'pointer' }}>
              {busy ? 'Loading…' : 'Open'}
            </button>
          </form>
        </div>
      </>
    )
  }

  return (
    <>
      <Head><title>Rentals — Admin</title><meta name="robots" content="noindex" /></Head>
      <div style={{ minHeight: '100vh', background: CREAM, fontFamily: SANS, color: '#2a2a2a', padding: '24px 16px 48px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <AdminBackLink />
          <div style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 600, color: NAVY, marginBottom: 4 }}>Rentals</div>
          <p style={{ fontSize: 13, color: MUTED, marginBottom: 20 }}>
            Listings expire 60 days after posting. Renew to keep them on the public page.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(0, 1.4fr)', gap: 20, alignItems: 'start' }}>
            <form onSubmit={save} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderTop: `3px solid ${GOLD}`, borderRadius: 4, padding: '18px 16px' }}>
              <div style={{ fontWeight: 600, marginBottom: 12, color: NAVY }}>{editId ? 'Edit listing' : 'Add listing'}</div>
              <label style={labelStyle}>Title *</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle} />
              <label style={labelStyle}>Neighborhood *</label>
              <input required value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} style={inputStyle} placeholder="e.g. Woodleigh" />
              <label style={labelStyle}>Monthly rent *</label>
              <input required type="number" min="1" value={form.monthly_rent} onChange={(e) => setForm({ ...form, monthly_rent: e.target.value })} style={inputStyle} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={labelStyle}>Bedrooms</label>
                  <input type="number" min="0" step="0.5" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Bathrooms</label>
                  <input type="number" min="0" step="0.5" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <label style={labelStyle}>Available date</label>
              <input type="date" value={form.available_date} onChange={(e) => setForm({ ...form, available_date: e.target.value })} style={inputStyle} />
              <label style={labelStyle}>Description (max 500)</label>
              <textarea
                maxLength={500}
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
              <p style={{ fontSize: 12, color: MUTED, margin: '-4px 0 10px', lineHeight: 1.45 }}>
                Describe the property only. Do not state preferences about who may rent it.
              </p>
              <label style={labelStyle}>Distance / walk to shul</label>
              <input value={form.distance_to_shul} onChange={(e) => setForm({ ...form, distance_to_shul: e.target.value })} style={inputStyle} placeholder="e.g. 8 min walk" />
              <label style={labelStyle}>Contact name</label>
              <input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} style={inputStyle} />
              <label style={labelStyle}>Phone</label>
              <input type="tel" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} style={inputStyle} />
              <label style={labelStyle}>Email</label>
              <input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} style={inputStyle} />
              <label style={labelStyle}>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={inputStyle}>
                <option value="active">Active</option>
                <option value="hidden">Hidden</option>
              </select>
              {error && <div style={{ color: '#B23A2E', fontSize: 13, marginBottom: 8 }}>{error}</div>}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="submit" disabled={busy} style={{ padding: '10px 18px', border: 'none', borderRadius: 3, background: NAVY, color: '#fff', cursor: 'pointer' }}>
                  {busy ? 'Saving…' : editId ? 'Save changes' : 'Add listing'}
                </button>
                {editId ? (
                  <button type="button" onClick={startCreate} style={{ padding: '10px 14px', border: `1px solid ${BORDER}`, borderRadius: 3, background: '#fff', cursor: 'pointer' }}>
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, background: '#fff', border: `1px solid ${BORDER}` }}>
                <thead>
                  <tr style={{ background: CREAM, textAlign: 'left' }}>
                    <th style={{ padding: '10px 8px' }}>Title</th>
                    <th style={{ padding: '10px 8px' }}>Posted</th>
                    <th style={{ padding: '10px 8px' }}>Expires</th>
                    <th style={{ padding: '10px 8px' }}>Status</th>
                    <th style={{ padding: '10px 8px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: 16, color: MUTED }}>No listings yet.</td></tr>
                  ) : listings.map((row) => (
                    <tr key={row.id} style={{ borderTop: `1px solid ${BORDER}` }}>
                      <td style={{ padding: '10px 8px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 600 }}>{row.title}</div>
                        <div style={{ color: MUTED, fontSize: 12 }}>{row.neighborhood}</div>
                      </td>
                      <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>{fmtDate(row.createdAt)}</td>
                      <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>{fmtDate(row.expiresAt)}</td>
                      <td style={{ padding: '10px 8px' }}>
                        {row.active ? 'Active' : row.status === 'hidden' ? 'Hidden' : 'Expired'}
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 120 }}>
                          <button type="button" onClick={() => startEdit(row)} style={btnSmall}>Edit</button>
                          <button type="button" onClick={() => toggleStatus(row)} style={btnSmall}>
                            {row.status === 'active' ? 'Hide' : 'Show'}
                          </button>
                          <button type="button" onClick={() => renew(row)} style={btnSmall}>Renew 60d</button>
                          <button type="button" onClick={() => remove(row)} style={{ ...btnSmall, color: '#B23A2E', borderColor: '#e8c4c4' }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

const btnSmall = {
  padding: '6px 10px',
  fontSize: 12,
  border: `1px solid ${BORDER}`,
  borderRadius: 3,
  background: '#fff',
  cursor: 'pointer',
  textAlign: 'left',
}
