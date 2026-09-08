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
          <div className="mx-auto max-w-[1100px] px-5 sm:px-8 py-6 sm:py-9 lg:py-12">
            <div className="home-invite">
              <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:gap-12">
                <section className="w-full max-w-[360px] text-center lg:shrink-0">
                  <p className="font-hebrew text-[18px] sm:text-[22px] text-[#c9a84c]">ב״ה</p>
                  <img
                    src="/logo.png"
                    alt=""
                    width={160}
                    height={160}
                    className="logo-on-paper mx-auto mt-3 mb-4 w-[96px] sm:w-[120px] h-auto"
                  />
                  <h1 className="font-display font-semibold text-[#1e2d4e] leading-[0.95] text-[36px] sm:text-[48px]">
                    Saratoga Shteibel
                  </h1>
                  <p className="mt-2.5 text-[13px] sm:text-[15px] text-[#7a7068]">
                    166 Woodleigh Place · Toms River, NJ · Est. 2023
                  </p>
                  <div className="gold-rule mx-auto my-5" />
                  <div className="flex flex-row flex-wrap items-center justify-center gap-3">
                    <Link href="/donate" className="btn-gold text-center px-7 sm:px-8 py-3 sm:py-3.5 text-[12px] sm:text-[13px] tracking-[0.16em] uppercase rounded-sm">
                      Donate
                    </Link>
                    <Link href="/visit" className="btn-navy text-center px-7 sm:px-8 py-3 sm:py-3.5 text-[12px] sm:text-[13px] tracking-[0.16em] uppercase rounded-sm">
                      Visit
                    </Link>
                  </div>
                </section>

                <section id="schedule" className="w-full min-w-0 lg:border-l lg:border-[#e8d5a3] lg:pl-12">
                  <ShabbosSchedule scheduleUrl={scheduleUrl} compact nested />
                </section>
              </div>
            </div>
          </div>
        </div>
      </SiteLayout>
    </>
  )
}
