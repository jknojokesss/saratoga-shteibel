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
        <meta name="description" content="Saratoga Shteibel, an Orthodox shtiebel at 166 Woodleigh Place, Toms River, NJ. This week's schedule, donate, visit." />
        <meta property="og:title" content="Saratoga Shteibel" />
        <meta property="og:image" content="/logo.png" />
        <link rel="canonical" href="https://www.saratogashteibel.org/" />
      </Head>

      <SiteLayout current="home">
        <div className="paper-bg">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-8 sm:py-10 lg:py-12">
            <div className="flex flex-col items-center gap-9 lg:flex-row lg:items-start lg:justify-center lg:gap-14 xl:gap-16">
              <section className="w-full max-w-[380px] text-center lg:text-left lg:pt-1 lg:shrink-0">
                <p className="font-hebrew text-[20px] sm:text-[22px] text-[#c9a84c]">ב״ה</p>
                <h1 className="mt-3 font-display font-semibold text-[#1e2d4e] leading-[0.92] text-[40px] sm:text-[52px] lg:text-[56px]">
                  Saratoga Shteibel
                </h1>
                <p className="mt-3 text-[15px] sm:text-[16px] text-[#1e2d4e]/80">
                  An Orthodox shtiebel in Toms River.
                </p>
                <p className="mt-2 text-[14px] sm:text-[15px] text-[#7a7068]">
                  166 Woodleigh Place
                </p>
                <div className="gold-rule mx-auto lg:mx-0 my-6" />
                <div className="flex flex-row flex-wrap items-center justify-center lg:justify-start gap-3">
                  <Link href="/donate" className="btn-gold text-center px-8 py-3.5 text-[13px] tracking-[0.16em] uppercase rounded-sm">
                    Donate
                  </Link>
                  <Link href="/visit" className="btn-navy text-center px-8 py-3.5 text-[13px] tracking-[0.16em] uppercase rounded-sm">
                    Visit
                  </Link>
                </div>
              </section>

              <section id="schedule" className="w-full max-w-[520px] min-w-0">
                <ShabbosSchedule scheduleUrl={scheduleUrl} compact />
              </section>
            </div>
          </div>
        </div>
      </SiteLayout>
    </>
  )
}
