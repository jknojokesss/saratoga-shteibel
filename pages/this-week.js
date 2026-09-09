import Head from 'next/head'
import ShabbosSchedule from '../components/ShabbosSchedule'
import SiteLayout from '../components/SiteLayout'

export default function ThisWeek() {
  return (
    <>
      <Head>
        <title>Zmanim · Saratoga Shteibel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <SiteLayout current="this-week">
        <div className="paper-bg">
          <div className="mx-auto w-full max-w-4xl px-5 sm:px-8 py-10">
            <ShabbosSchedule
              scheduleUrl="/zmanim/this-week.pdf"
              previewUrl="/zmanim/this-week.png"
            />
          </div>
        </div>
      </SiteLayout>
    </>
  )
}
