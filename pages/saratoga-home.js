import Head from 'next/head'
import Link from 'next/link'
import SiteLayout from '../components/SiteLayout'

const ACTIONS = [
  { href: '/this-week', label: 'Schedule', className: 'btn-navy' },
  { href: '/donate', label: 'Donate', className: 'btn-gold' },
]

export default function SaratogaHome() {
  return (
    <>
      <Head>
        <title>Saratoga Shteibel · Toms River</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Saratoga Shteibel, an Orthodox shtiebel at 166 Woodleigh Place, Toms River, NJ. This week's schedule and donate." />
        <meta property="og:title" content="Saratoga Shteibel" />
        <meta property="og:image" content="/logo.png" />
        <link rel="canonical" href="https://www.saratogashteibel.org/" />
      </Head>

      <SiteLayout current="home">
        <div className="paper-bg">
          <div className="mx-auto flex min-h-[calc(100svh-72px)] max-w-lg flex-col items-center justify-center px-5 py-10 sm:px-8 sm:py-14">
            <h1 className="m-0">
              <img
                src="/logo.png"
                alt="Saratoga Shteibel"
                width={800}
                height={600}
                className="home-logo"
              />
            </h1>

            <nav className="mt-8 sm:mt-10 flex w-full flex-col gap-3.5 sm:gap-4" aria-label="Site">
              {ACTIONS.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`home-btn ${action.className}`}
                >
                  {action.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </SiteLayout>
    </>
  )
}
