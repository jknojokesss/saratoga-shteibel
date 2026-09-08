import Head from 'next/head'
import Link from 'next/link'
import SiteLayout from '../components/SiteLayout'

const ACTIONS = [
  {
    href: '/this-week',
    label: 'Zmanim',
    className: 'btn-navy',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 10h18" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 3v4M16 3v4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
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
  },
]

export default function SaratogaHome() {
  return (
    <>
      <Head>
        <title>Saratoga Shteibel · Toms River</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Saratoga Shteibel, an Orthodox shtiebel at 166 Woodleigh Place, Toms River, NJ. This week's zmanim and donate." />
        <meta property="og:title" content="Saratoga Shteibel" />
        <meta property="og:image" content="/logo.png" />
        <link rel="canonical" href="https://www.saratogashteibel.org/" />
      </Head>

      <SiteLayout current="home">
        <div className="paper-bg">
          <div className="home-splash">
            <h1 className="m-0">
              <img
                src="/logo.png"
                alt="Saratoga Shteibel"
                width={800}
                height={600}
                className="home-logo"
              />
            </h1>

            <nav className="home-actions" aria-label="Site">
              {ACTIONS.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`home-btn ${action.className}`}
                >
                  <span className="home-btn-icon">{action.icon}</span>
                  <span>{action.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </SiteLayout>
    </>
  )
}
