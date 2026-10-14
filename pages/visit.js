import Head from 'next/head'
import Link from 'next/link'
import PageHero from '../components/PageHero'
import SiteLayout from '../components/SiteLayout'
import { ADDRESS, CITY, MAPS_EMBED, MAPS_LINK } from '../components/brand'
import heroStyles from '../styles/siteHero.module.css'

export default function Visit() {
  return (
    <>
      <Head>
        <title>Visit · Saratoga Shteibel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Visit Saratoga Shteibel at 166 Woodleigh Place, Toms River, NJ 08755." />
      </Head>
      <SiteLayout current="visit">
        <PageHero kicker="Visit" title={ADDRESS} subtitle={CITY}>
          <a href={MAPS_LINK} target="_blank" rel="noreferrer" className={heroStyles.heroBtnGold}>
            Directions
          </a>
          <Link href="/this-week" className={heroStyles.heroBtnOutline}>
            Zmanim
          </Link>
        </PageHero>
        <p className="text-center text-[14px] text-muted py-6 px-5 bg-paper">Shabbos times are on this week’s flyer.</p>
        <div className="h-[52vh] min-h-[380px] border-t border-gold bg-paper">
          <iframe
            title="Map of Saratoga Shteibel"
            src={MAPS_EMBED}
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </SiteLayout>
    </>
  )
}
