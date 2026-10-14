import Link from 'next/link'
import { BORDER, CREAM, GOLD, MUTED, NAVY, SANS, SERIF } from '../lib/adminTheme'

export function AdminBackLink({ title }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <Link
        href="/admin"
        style={{
          fontSize: 13,
          color: MUTED,
          textDecoration: 'none',
          fontFamily: SANS,
        }}
      >
        ← All admin tools
      </Link>
      {title ? (
        <div style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 600, color: NAVY, marginTop: 8 }}>{title}</div>
      ) : null}
      <div style={{ width: 44, height: 1.5, background: GOLD, marginTop: 8 }} />
    </div>
  )
}

export function AdminPageShell({ title, children, maxWidth = 720 }) {
  return (
    <div style={{ minHeight: '100vh', background: CREAM, padding: '28px 16px 48px', fontFamily: SANS, color: '#14181d' }}>
      <div style={{ maxWidth, margin: '0 auto' }}>
        <AdminBackLink title={title} />
        {children}
      </div>
    </div>
  )
}

export function adminCardStyle(extra = {}) {
  return {
    background: '#fff',
    border: `1px solid ${BORDER}`,
    borderRadius: 4,
    padding: '18px 20px',
    marginBottom: 16,
    borderTop: `3px solid ${GOLD}`,
    ...extra,
  }
}
