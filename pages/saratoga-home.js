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
          <div className="mx-auto max-w-[1080px] px-5 sm:px-8 py-8 sm:py-10 lg:py-12">
            <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-start lg:justify-center lg:gap-14 xl:gap-16">
              <section className="w-full max-w-[400px] text-center lg:pt-4">
                <p className="font-hebrew text-[20px] sm:text-[22px] text-[#c9a84c]">ב״ה</p>
                <img
                  src="/logo.png"
                  alt=""
                  width={160}
                  height={160}
                  className="logo-on-paper mx-auto mt-4 mb-5 w-[112px] sm:w-[132px] h-auto"
                />
                <h1 className="font-display font-semibold text-[#1e2d4e] leading-[0.95] text-[40px] sm:text-[52px]">
                  Saratoga Shteibel
                </h1>
                <p className="mt-3 text-[14px] sm:text-[16px] text-[#7a7068]">
                  166 Woodleigh Place · Toms River, NJ · Est. 2023
                </p>
                <div className="gold-rule mx-auto my-6" />
                <div className="flex flex-row flex-wrap items-center justify-center gap-3">
                  <Link href="/donate" className="btn-gold text-center px-8 py-3.5 text-[13px] tracking-[0.16em] uppercase rounded-sm">
                    Donate
                  </Link>
                  <Link href="/visit" className="btn-navy text-center px-8 py-3.5 text-[13px] tracking-[0.16em] uppercase rounded-sm">
                    Visit
                  </Link>
                </div>
              </section>

              <section id="schedule" className="w-full max-w-[440px] lg:border-l lg:border-[#e8d5a3] lg:pl-14 xl:pl-16">
                <ShabbosSchedule scheduleUrl={scheduleUrl} compact />
              </section>
            </div>
          </div>
        </div>
      </SiteLayout>
    </>
  )
}
