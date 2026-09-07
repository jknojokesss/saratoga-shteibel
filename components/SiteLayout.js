import Link from 'next/link'
import { useEffect, useState } from 'react'

const LINKS = [
  { href: '/#schedule', label: 'Schedule' },
  { href: '/visit', label: 'Visit' },
]

export default function SiteLayout({ children, overlayNav = false, current = '', hideFooter = false, flush = false }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!overlayNav) return undefined
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [overlayNav])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const solid = !overlayNav || scrolled || open
  const light = overlayNav && !solid

  return (
    <div className={`${flush ? 'donate-lock h-[100svh] overflow-hidden' : 'min-h-screen'} flex flex-col bg-paper`}>
      <a href="#main" className="skip-link">Skip to content</a>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          solid
            ? 'bg-[#faf7f2]/95 backdrop-blur-md border-b border-[#ddd5c4] shadow-[0_1px_0_rgba(201,168,76,0.55)]'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-8 h-[72px] flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 min-w-0" onClick={() => setOpen(false)}>
            <span className={`logo-plate ${light ? 'logo-plate-light' : ''}`}>
              <img src="/logo.png" alt="" width={48} height={36} />
            </span>
            <span className="min-w-0">
              <span className={`block font-display text-[21px] leading-none font-semibold tracking-wide ${light ? 'text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.75)]' : 'text-[#1e2d4e]'}`}>
                Saratoga Shteibel
              </span>
              <span className={`block text-[10px] tracking-[0.18em] uppercase mt-1 ${light ? 'text-[#e8d5a3] drop-shadow-[0_1px_8px_rgba(0,0,0,0.7)]' : 'text-[#7a7068]'}`}>
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
                  light
                    ? 'text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.75)] hover:text-[#e8d5a3]'
                    : current && l.href.includes(current)
                      ? 'text-[#1e2d4e]'
                      : 'text-[#7a7068] hover:text-[#1e2d4e]'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/donate"
              className={`btn-gold text-[12px] tracking-[0.14em] uppercase font-medium px-5 py-2.5 rounded-sm ${
                current === 'donate' ? 'ring-1 ring-[#1e2d4e]/20' : ''
              }`}
            >
              Donate
            </Link>
          </nav>

          <button
            type="button"
            className={`md:hidden w-11 h-11 flex flex-col items-center justify-center gap-[5px] rounded-sm ${light ? 'text-[#faf7f2]' : 'text-[#1e2d4e]'}`}
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
          <div className="md:hidden bg-[#faf7f2] border-t border-[#ddd5c4] px-5 py-6 flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-3 text-[13px] tracking-[0.16em] uppercase text-[#1e2d4e] border-b border-[#eee6d8]"
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
        className={`${overlayNav ? '' : 'pt-[72px]'} ${flush ? 'flex-1 min-h-0 overflow-hidden' : ''}`}
      >
        {children}
      </div>

      {hideFooter ? null : (
        <footer className="mt-auto bg-[#1e2d4e] text-[#9aa6bd]">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
              <span className="font-display text-[#e8d5a3] text-[18px] font-semibold">Saratoga Shteibel</span>
              <span>166 Woodleigh Place · Toms River, NJ</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/#schedule" className="text-[11px] tracking-[0.14em] uppercase text-[#e8d5a3] hover:text-white">Schedule</Link>
              <Link href="/visit" className="text-[11px] tracking-[0.14em] uppercase text-[#e8d5a3] hover:text-white">Visit</Link>
              <Link href="/donate" className="border border-[#c9a84c] text-[#e8d5a3] text-[11px] tracking-[0.14em] uppercase px-3 py-2 hover:bg-[#c9a84c] hover:text-[#1e2d4e] transition-colors rounded-sm">
                Donate
              </Link>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}
