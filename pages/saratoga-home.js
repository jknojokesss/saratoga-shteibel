import Head from 'next/head'
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
        <title>Saratoga Shteibel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Saratoga Shteibel — 166 Woodleigh Place, Toms River, NJ." />
        <meta property="og:title" content="Saratoga Shteibel" />
        <meta property="og:image" content="/shul-photo.jpg" />
        <link rel="canonical" href="https://www.saratogashteibel.org/" />
      </Head>

      <SiteLayout current="home">
        <div
          className="h-[140px] sm:h-[180px] bg-[#cfc7b6] bg-cover bg-[center_42%]"
          style={{ backgroundImage: "url('/shul-photo.jpg')" }}
          role="img"
          aria-label="Saratoga Shteibel"
        />

        <div className="bg-white border-b border-[#ddd5c4]">
          <div className="mx-auto max-w-3xl px-5 py-6 text-center">
            <h1 className="font-display text-[32px] sm:text-[38px] font-semibold text-[#1e2d4e] leading-none">
              Saratoga Shteibel
            </h1>
            <p className="mt-2 text-[14px] text-[#7a7068]">166 Woodleigh Place · Toms River, NJ 08755</p>
            <div className="mt-5 grid grid-cols-3 gap-2">
              <a href="#schedule" className="btn-navy py-3 text-[12px] tracking-[0.12em] uppercase rounded-sm">Schedule</a>
              <Link href="/donate" className="btn-gold py-3 text-[12px] tracking-[0.12em] uppercase rounded-sm">Donate</Link>
              <Link href="/visit" className="py-3 text-[12px] tracking-[0.12em] uppercase rounded-sm border border-[#1e2d4e] text-[#1e2d4e] hover:bg-[#1e2d4e] hover:text-white transition-colors">Visit</Link>
            </div>
          </div>
        </div>

        <div id="schedule" className="scroll-mt-[72px] mx-auto w-full max-w-3xl">
          <ShabbosSchedule scheduleUrl={scheduleUrl} />
        </div>
      </SiteLayout>
    </>
  )
}
