import Head from 'next/head'
import { useEffect, useState } from 'react'
import ShabbosSchedule from '../components/ShabbosSchedule'
import SiteLayout from '../components/SiteLayout'

export default function ThisWeek() {
  const [scheduleUrl, setScheduleUrl] = useState(null)

  useEffect(() => {
    fetch('/api/announcements/schedule').then((r) => r.json()).then((d) => {
      if (d.url) setScheduleUrl('/shabbos-schedule.pdf')
    }).catch(() => {})
  }, [])

  return (
    <>
      <Head>
        <title>Zmanim · Saratoga Shteibel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <SiteLayout current="this-week">
        <div className="paper-bg">
          <div className="mx-auto w-full max-w-4xl px-5 sm:px-8 py-10">
            <ShabbosSchedule scheduleUrl={scheduleUrl} />
          </div>
        </div>
      </SiteLayout>
    </>
  )
}
