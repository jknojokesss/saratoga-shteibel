import Link from 'next/link'
import { useEffect, useState } from 'react'

const LINKS = [
  { href: '/this-week', label: 'Zmanim' },
  { href: '/visit', label: 'Visit' },
  { href: '/rentals', label: 'Rentals' },
]

export default function SiteLayout({ children, current = '', hideFooter = false, flush = false }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <div className={`${flush ? 'donate-lock h-[100svh] overflow-hidden' : 'min-h-screen'} flex flex-col bg-paper`}>
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="fixed top-0 inset-x-0 z-50 bg-paper-hi/95 backdrop-blur-md border-b border-border shadow-[0_1px_0_rgba(176,141,75,0.55)]">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 h-[72px] flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 min-w-0" onClick={() => setOpen(false)}>
            <span className="logo-plate">
              <img src="/logo.png" alt="" width={48} height={36} />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-[21px] leading-none font-semibold tracking-wide text-navy">
                Saratoga Shteibel
              </span>
              <span className="block text-[10px] tracking-[0.18em] uppercase mt-1 text-muted">
                Toms River · Est. 2023
              </span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8" aria-label="Primary">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-[12px] tracking-[0.16em] uppercase font-medium transition-colors ${
                  current && l.href.includes(current)
                    ? 'text-navy'
                    : 'text-muted hover:text-navy'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/donate"
              className={`btn-gold text-[12px] tracking-[0.14em] uppercase font-medium px-5 py-2.5 rounded-sm ${
                current === 'donate' ? 'ring-1 ring-navy/20' : ''
              }`}
            >
              Donate
            </Link>
          </nav>

          <button
            type="button"
            className="md:hidden w-11 h-11 flex flex-col items-center justify-center gap-[5px] rounded-sm text-navy"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className={`block w-5 h-[1.5px] bg-current transition-transform ${open ? 'translate-y-[6.5px] rotate-45' : ''}`} />
            <span className={`block w-5 h-[1.5px] bg-current transition-opacity ${open ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-[1.5px] bg-current transition-transform ${open ? '-translate-y-[6.5px] -rotate-45' : ''}`} />
          </button>
        </div>

        {open && (
          <div className="md:hidden bg-paper-hi border-t border-border px-5 py-6 flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-3 text-[13px] tracking-[0.16em] uppercase text-navy border-b border-border/60"
              >
                {l.label}
              </Link>
            ))}
            <Link href="/donate" onClick={() => setOpen(false)} className="btn-gold mt-4 text-center tracking-[0.14em] uppercase text-[13px] py-3 rounded-sm">
              Donate
            </Link>
          </div>
        )}
      </header>

      <div
        id="main"
        className={`${flush ? 'flex-1 min-h-0 overflow-hidden' : ''} pt-[72px]`}
      >
        {children}
      </div>

      {hideFooter ? null : (
        <footer className="mt-auto bg-navy text-[#9aa6bd]">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="font-display text-gold-light text-[18px] font-semibold">Saratoga Shteibel</div>
              <div className="text-[13px] mt-1">166 Woodleigh Place · Toms River, NJ</div>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link href="/this-week" className="text-[11px] tracking-[0.14em] uppercase text-gold-light hover:text-white">Zmanim</Link>
              <Link href="/visit" className="text-[11px] tracking-[0.14em] uppercase text-gold-light hover:text-white">Visit</Link>
              <Link href="/rentals" className="text-[11px] tracking-[0.14em] uppercase text-gold-light hover:text-white">Rentals</Link>
              <Link href="/donate" className="border border-gold text-gold-light text-[11px] tracking-[0.14em] uppercase px-3 py-2 hover:bg-gold hover:text-navy transition-colors rounded-sm">
                Donate
              </Link>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}
