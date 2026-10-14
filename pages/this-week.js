import Head from 'next/head'
import PageHero from '../components/PageHero'
import ShabbosSchedule from '../components/ShabbosSchedule'
import SiteLayout from '../components/SiteLayout'
import { getShabbosScheduleUrls } from '../lib/shabbosSchedule'

export default function ThisWeek({ scheduleUrl, previewUrl }) {
  return (
    <>
      <Head>
        <title>Zmanim · Saratoga Shteibel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <SiteLayout current="this-week">
        <PageHero
          kicker="Schedule"
          title="This week’s zmanim"
          subtitle="Shabbos and weekday times for Saratoga Shteibel, 166 Woodleigh Place."
        />
        <div className="paper-bg">
          <div className="mx-auto w-full max-w-4xl px-5 sm:px-8 py-10">
            <ShabbosSchedule scheduleUrl={scheduleUrl} previewUrl={previewUrl} />
          </div>
        </div>
      </SiteLayout>
    </>
  )
}

export async function getServerSideProps() {
  const urls = await getShabbosScheduleUrls()
  return {
    props: {
      scheduleUrl: urls.scheduleUrl,
      previewUrl: urls.previewUrl,
    },
  }
}
