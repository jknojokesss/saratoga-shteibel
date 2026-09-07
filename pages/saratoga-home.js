import Head from 'next/head'
import Image from 'next/image'
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
        <meta property="og:image" content="/shul-photo.jpg" />
        <link rel="canonical" href="https://www.saratogashteibel.org/" />
      </Head>

      <SiteLayout overlayNav current="home" hideFooter>
        <section className="relative min-h-[100svh] text-[#faf7f2] overflow-hidden">
          <Image
            src="/shul-photo.jpg"
            alt="Morning minyan at Saratoga Shteibel"
            fill
            priority
            className="object-cover object-[center_16%] scale-[1.24] origin-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[#121a30]/28" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#121a30]/90 via-[#121a30]/42 to-[#121a30]/18" />
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#121a30]/80 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#121a30]/55 to-transparent lg:h-16" />

          <div className="relative z-10 min-h-[100svh] mx-auto w-full max-w-[1280px] px-5 sm:px-8 pt-[88px] pb-6 sm:pb-8 flex flex-col justify-end gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-12">
            <div className="shrink-0">
              <p className="font-hebrew text-[18px] sm:text-[20px] text-[#e8d5a3] mb-3">ב״ה</p>
              <h1 className="font-display font-semibold leading-[0.92] text-[40px] sm:text-[56px] lg:text-[68px]">
                Saratoga Shteibel
              </h1>
              <p className="mt-3 text-[14px] sm:text-[16px] text-[#f0ebe0]/90">
                166 Woodleigh Place · Toms River, NJ · Est. 2023
              </p>
              <div className="gold-rule my-5" />
              <div className="flex flex-wrap gap-2.5">
                <Link href="/donate" className="btn-gold px-6 py-3 text-[12px] sm:text-[13px] tracking-[0.14em] uppercase rounded-sm">
                  Donate
                </Link>
                <Link href="/visit" className="btn-cream px-6 py-3 text-[12px] sm:text-[13px] tracking-[0.14em] uppercase rounded-sm">
                  Visit
                </Link>
              </div>
            </div>

            <div id="schedule" className="hero-schedule">
              <ShabbosSchedule scheduleUrl={scheduleUrl} embedded />
            </div>
          </div>
        </section>
      </SiteLayout>
    </>
  )
}
