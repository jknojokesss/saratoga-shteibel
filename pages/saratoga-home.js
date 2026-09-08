import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import ShabbosSchedule from '../components/ShabbosSchedule'
import SiteLayout from '../components/SiteLayout'

export default function SaratogaHome() {
  const [scheduleUrl, setScheduleUrl] = useState(null)

  useEffect(() => {
    fetch('/api/announcements/schedule').then((r) => r.json()).then((d) => {
      if (d.url) setScheduleUrl('/shabbos-schedule.pdf')
    }).catch(() => {})
  }, [])

  return (
    <>
      <Head>
        <title>Saratoga Shteibel · Toms River</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Saratoga Shteibel, 166 Woodleigh Place, Toms River, NJ. Schedule, donate, visit." />
        <meta property="og:title" content="Saratoga Shteibel" />
        <meta property="og:image" content="/logo.png" />
        <link rel="canonical" href="https://www.saratogashteibel.org/" />
      </Head>

      <SiteLayout current="home">
        <div className="paper-bg">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-6 sm:py-9 lg:py-12 lg:min-h-[calc(100svh-72px)] lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(340px,42%)] lg:gap-12 xl:gap-16 lg:items-center">
            <section className="text-center lg:text-left mb-8 lg:mb-0">
              <p className="font-hebrew text-[18px] sm:text-[22px] text-[#c9a84c]">ב״ה</p>
              <img
                src="/logo.png"
                alt=""
                width={148}
                height={148}
                className="mx-auto lg:mx-0 mt-3 mb-4 lg:mt-4 lg:mb-5 w-[76px] sm:w-[96px] lg:w-[128px] h-auto"
              />
              <h1 className="font-display font-semibold text-[#1e2d4e] leading-[0.95] text-[36px] sm:text-[48px] lg:text-[64px]">
                Saratoga Shteibel
              </h1>
              <p className="mt-2 sm:mt-3 text-[13px] sm:text-[16px] text-[#7a7068]">
                166 Woodleigh Place · Toms River, NJ · Est. 2023
              </p>
              <div className="gold-rule mx-auto lg:mx-0 my-5 sm:my-6" />
              <div className="flex flex-row flex-wrap items-center justify-center lg:justify-start gap-3">
                <Link href="/donate" className="btn-gold text-center px-6 sm:px-8 py-3 sm:py-3.5 text-[12px] sm:text-[13px] tracking-[0.16em] uppercase rounded-sm">
                  Donate
                </Link>
                <Link href="/visit" className="btn-navy text-center px-6 sm:px-8 py-3 sm:py-3.5 text-[12px] sm:text-[13px] tracking-[0.16em] uppercase rounded-sm">
                  Visit
                </Link>
              </div>
            </section>

            <section id="schedule" className="w-full max-w-[420px] mx-auto lg:max-w-none lg:mx-0">
              <ShabbosSchedule scheduleUrl={scheduleUrl} compact />
            </section>
          </div>
        </div>
      </SiteLayout>
    </>
  )
}
