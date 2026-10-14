import Head from 'next/head'
import Link from 'next/link'
import SiteLayout from '../components/SiteLayout'

const ZMANIM = {
  href: '/this-week',
  label: 'Zmanim',
  className: 'btn-navy home-btn-zmanim',
  icon: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 10h18" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 3v4M16 3v4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
}

const DONATE = {
  href: '/donate',
  label: 'Donate',
  className: 'btn-gold',
  icon: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="3.3" r="1.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <rect x="4.8" y="6.1" width="14.4" height="3.1" rx="0.8" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9.2 7.65h5.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path
        d="M6.1 9.2h11.8v10.1a1.6 1.6 0 0 1-1.6 1.6H7.7a1.6 1.6 0 0 1-1.6-1.6V9.2z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M12 12.55l2.35 4.05H9.65z" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
      <path d="M12 17.5l-2.35-4.05h4.7z" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
    </svg>
  ),
}

const HOMES_ICON = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
)

export default function SaratogaHome() {
  return (
    <>
      <Head>
        <title>Saratoga Shteibel · Toms River</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Saratoga Shteibel, an Orthodox shtiebel at 166 Woodleigh Place, Toms River, NJ. Zmanim, homes near the shul, and donate."
        />
        <meta property="og:title" content="Saratoga Shteibel" />
        <meta property="og:image" content="/logo.png" />
        <link rel="canonical" href="https://www.saratogashteibel.org/" />
      </Head>

      <SiteLayout current="home">
        <div className="paper-bg">
          <div className="home-splash">
            <h1 className="m-0">
              <img src="/logo.png" alt="Saratoga Shteibel" width={800} height={600} className="home-logo" />
            </h1>

            <nav className="home-actions" aria-label="Site">
              <Link href={ZMANIM.href} className={`home-btn ${ZMANIM.className}`}>
                <span className="home-btn-icon">{ZMANIM.icon}</span>
                <span>{ZMANIM.label}</span>
              </Link>

              <div className="home-actions-right">
                <Link href={DONATE.href} className={`home-btn ${DONATE.className}`}>
                  <span className="home-btn-icon">{DONATE.icon}</span>
                  <span>{DONATE.label}</span>
                </Link>
                <Link href="/homes" className="home-btn home-btn-homes">
                  <span className="home-btn-icon">{HOMES_ICON}</span>
                  <span className="home-btn-homes-text">
                    <span className="home-btn-homes-new">New!</span>
                    <span className="home-btn-homes-title">Homes</span>
                  </span>
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </SiteLayout>
    </>
  )
}
