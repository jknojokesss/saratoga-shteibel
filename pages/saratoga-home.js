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
      if (d.url) setScheduleUrl(d.url)
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

      <SiteLayout overlayNav current="home">
        <section className="relative min-h-[68vh] sm:min-h-[74vh] flex items-end text-[#faf7f2] overflow-hidden">
          <Image
            src="/shul-photo.jpg"
            alt="Morning minyan at Saratoga Shteibel"
            fill
            priority
            className="object-cover object-[center_38%]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121a30] via-[#121a30]/40 to-[#121a30]/20" />
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#121a30]/70 to-transparent" />

          <div className="relative z-10 w-full mx-auto max-w-6xl px-5 sm:px-8 pb-10 pt-28">
            <p className="font-hebrew text-[18px] text-[#e8d5a3] mb-3">ב״ה</p>
            <h1 className="font-display font-semibold leading-[0.95] text-[44px] sm:text-[64px] md:text-[72px]">
              Saratoga Shteibel
            </h1>
            <p className="mt-3 text-[14px] sm:text-[16px] tracking-[0.04em] text-[#f0ebe0]/90">
              166 Woodleigh Place · Toms River, NJ · Est. 2023
            </p>
            <div className="gold-rule my-5 bg-[#c9a84c]" />
            <div className="flex flex-wrap gap-2.5">
              <a href="#schedule" className="btn-gold px-6 py-3.5 text-[12px] sm:text-[13px] tracking-[0.14em] uppercase rounded-sm">
                Schedule
              </a>
              <Link href="/donate" className="px-6 py-3.5 text-[12px] sm:text-[13px] tracking-[0.14em] uppercase rounded-sm border border-[#e8d5a3] text-[#e8d5a3] hover:bg-[#e8d5a3] hover:text-[#1e2d4e] transition-colors">
                Donate
              </Link>
              <Link href="/visit" className="px-6 py-3.5 text-[12px] sm:text-[13px] tracking-[0.14em] uppercase rounded-sm border border-[#e8d5a3] text-[#e8d5a3] hover:bg-[#e8d5a3] hover:text-[#1e2d4e] transition-colors">
                Visit
              </Link>
            </div>
          </div>
        </section>

        <section id="schedule" className="scroll-mt-[72px] paper-bg border-t border-[#ddd5c4]">
          <div className="mx-auto w-full max-w-3xl py-2">
            <ShabbosSchedule scheduleUrl={scheduleUrl} />
          </div>
        </section>
      </SiteLayout>
    </>
  )
}
