import Link from 'next/link'
import { useEffect, useState } from 'react'
import { MAPS_LINK } from './brand'

const LINKS = [
  { href: '/#this-week', label: 'This week' },
  { href: '/#visit', label: 'Visit' },
]

export default function SiteLayout({ children, overlayNav = false, current = '' }) {
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
    <div className="min-h-screen flex flex-col bg-paper">
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
              <span className={`block font-display text-[21px] leading-none font-semibold tracking-wide ${light ? 'text-[#faf7f2]' : 'text-[#1e2d4e]'}`}>
                Saratoga Shteibel
              </span>
              <span className={`block text-[10px] tracking-[0.18em] uppercase mt-1 ${light ? 'text-[#e8d5a3]' : 'text-[#7a7068]'}`}>
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
                  light ? 'text-[#faf7f2]/80 hover:text-[#e8d5a3]' : 'text-[#7a7068] hover:text-[#1e2d4e]'
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

      <div className={overlayNav ? '' : 'pt-[72px]'} id="main">
        {children}
      </div>

      <footer className="mt-auto bg-[#1e2d4e] text-[#9aa6bd]">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-12 grid gap-10 sm:grid-cols-3">
          <div>
            <div className="font-display text-[#e8d5a3] text-[22px] font-semibold">Saratoga Shteibel</div>
            <div className="gold-rule my-3" />
            <p className="text-[13px] leading-relaxed text-[#c5cddd]">
              A neighborhood minyan in Toms River. Come daven, stay for kiddush, be part of the kehillah.
            </p>
          </div>
          <div>
            <div className="text-[11px] tracking-[0.2em] uppercase text-[#c9a84c] mb-3">Visit</div>
            <p className="text-[14px] text-[#faf7f2] leading-relaxed">
              166 Woodleigh Place<br />Toms River, NJ 08755
            </p>
            <a
              href={MAPS_LINK}
              className="inline-block mt-3 text-[12px] tracking-[0.12em] uppercase text-[#e8d5a3] hover:text-white"
              target="_blank"
              rel="noreferrer"
            >
              Get directions →
            </a>
          </div>
          <div>
            <div className="text-[11px] tracking-[0.2em] uppercase text-[#c9a84c] mb-3">Support</div>
            <p className="text-[14px] text-[#c5cddd] leading-relaxed mb-4">
              Membership, kiddush, shaleshudis, or a gift in any amount — card or Donors Fund.
            </p>
            <Link href="/donate" className="inline-block border border-[#c9a84c] text-[#e8d5a3] text-[12px] tracking-[0.14em] uppercase px-4 py-2.5 hover:bg-[#c9a84c] hover:text-[#1e2d4e] transition-colors rounded-sm">
              Give now
            </Link>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-4 flex flex-wrap justify-between gap-2 text-[11px] tracking-wide">
            <span>© {new Date().getFullYear()} Saratoga Shteibel</span>
            <span className="font-hebrew text-[13px] text-[#e8d5a3]/80">ב״ה</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
