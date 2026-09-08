import Head from 'next/head'
import Link from 'next/link'
import SiteLayout from '../components/SiteLayout'
import { ADDRESS, CITY, MAPS_EMBED, MAPS_LINK } from '../components/brand'

export default function Visit() {
  return (
    <>
      <Head>
        <title>Visit · Saratoga Shteibel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Visit Saratoga Shteibel at 166 Woodleigh Place, Toms River, NJ 08755." />
      </Head>
      <SiteLayout current="visit">
        <div className="paper-bg">
          <section className="mx-auto max-w-3xl px-5 sm:px-8 pt-10 sm:pt-14 pb-8 text-center">
            <p className="text-[11px] tracking-[0.22em] uppercase text-[#7a7068] mb-3">Visit</p>
            <h1 className="font-display font-semibold text-[#1e2d4e] leading-tight text-[36px] sm:text-[52px]">
              {ADDRESS}
            </h1>
            <p className="mt-2 text-[16px] text-[#7a7068]">{CITY}</p>
            <p className="mt-3 text-[14px] text-[#7a7068]">
              Shabbos times are on this week’s flyer.
            </p>
            <div className="gold-rule mx-auto my-6" />
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a href={MAPS_LINK} target="_blank" rel="noreferrer" className="btn-gold px-8 py-3.5 text-[13px] tracking-[0.16em] uppercase rounded-sm">
                Directions
              </a>
              <Link href="/this-week" className="btn-outline px-8 py-3.5 text-[13px] tracking-[0.16em] uppercase rounded-sm">
                Schedule
              </Link>
            </div>
          </section>
        </div>
        <div className="h-[52vh] min-h-[380px] border-t-[3px] border-[#c9a84c] bg-[#e8e4dc]">
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
