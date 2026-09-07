import Head from 'next/head'
import Link from 'next/link'
import SiteLayout from '../components/SiteLayout'
import { MAPS_EMBED, MAPS_LINK } from '../components/brand'

export default function Visit() {
  return (
    <>
      <Head>
        <title>Visit · Saratoga Shteibel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <SiteLayout current="visit">
        <div className="mx-auto max-w-5xl px-5 py-8 grid lg:grid-cols-2 gap-6 items-start">
          <div>
            <h1 className="font-display text-[32px] font-semibold text-[#1e2d4e]">166 Woodleigh Place</h1>
            <p className="mt-1 text-[16px] text-[#7a7068]">Toms River, NJ 08755</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href={MAPS_LINK} target="_blank" rel="noreferrer" className="btn-navy px-5 py-3 text-[12px] tracking-[0.12em] uppercase rounded-sm">Directions</a>
              <Link href="/#schedule" className="px-5 py-3 text-[12px] tracking-[0.12em] uppercase rounded-sm border border-[#1e2d4e] text-[#1e2d4e] hover:bg-[#1e2d4e] hover:text-white transition-colors">Schedule</Link>
              <Link href="/donate" className="btn-gold px-5 py-3 text-[12px] tracking-[0.12em] uppercase rounded-sm">Donate</Link>
            </div>
          </div>
          <div className="h-[320px] border border-[#ddd5c4] rounded-sm overflow-hidden">
            <iframe
              title="Map of Saratoga Shteibel"
              src={MAPS_EMBED}
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </SiteLayout>
    </>
  )
}
