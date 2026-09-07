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
        <div className="bg-[#1e2d4e] text-[#faf7f2] px-5 py-8">
          <div className="mx-auto max-w-5xl">
            <h1 className="font-display text-[36px] font-semibold">166 Woodleigh Place</h1>
            <p className="text-[14px] text-[#e8d5a3] mt-1">Toms River, NJ 08755</p>
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-5 py-8 grid lg:grid-cols-2 gap-6 items-start">
          <div>
            <div className="flex flex-wrap gap-2">
              <a href={MAPS_LINK} target="_blank" rel="noreferrer" className="btn-navy px-5 py-3 text-[12px] tracking-[0.12em] uppercase rounded-sm">Directions</a>
              <Link href="/#schedule" className="px-5 py-3 text-[12px] tracking-[0.12em] uppercase rounded-sm border border-[#1e2d4e] text-[#1e2d4e] hover:bg-[#1e2d4e] hover:text-white transition-colors">Schedule</Link>
              <Link href="/donate" className="btn-gold px-5 py-3 text-[12px] tracking-[0.12em] uppercase rounded-sm">Donate</Link>
            </div>
          </div>
          <div className="h-[360px] border border-[#ddd5c4] rounded-sm overflow-hidden shadow-[0_12px_40px_rgba(30,45,78,0.08)]">
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
