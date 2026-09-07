import Head from 'next/head'
import { useEffect, useState } from 'react'
import ShabbosSchedule from '../components/ShabbosSchedule'
import SiteLayout from '../components/SiteLayout'

export default function ThisWeek() {
  const [scheduleUrl, setScheduleUrl] = useState(null)

  useEffect(() => {
    fetch('/api/announcements/schedule').then((r) => r.json()).then((d) => {
      if (d.url) setScheduleUrl(d.url)
    }).catch(() => {})
  }, [])

  return (
    <>
      <Head>
        <title>Schedule · Saratoga Shteibel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <SiteLayout current="this-week">
        <div className="mx-auto w-full max-w-3xl">
          <ShabbosSchedule scheduleUrl={scheduleUrl} />
        </div>
      </SiteLayout>
    </>
  )
}
