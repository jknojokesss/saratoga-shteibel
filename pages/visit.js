import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import SiteLayout from '../components/SiteLayout'
import { MAPS_EMBED, MAPS_LINK } from '../components/brand'

export default function Visit() {
  return (
    <>
      <Head>
        <title>Visit · Saratoga Shteibel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Visit Saratoga Shteibel at 166 Woodleigh Place, Toms River, NJ 08755." />
      </Head>
      <SiteLayout overlayNav current="visit">
        <section className="relative min-h-[42vh] sm:min-h-[48vh] flex items-end text-[#faf7f2] overflow-hidden">
          <Image
            src="/shul-photo.jpg"
            alt="Saratoga Shteibel"
            fill
            priority
            className="object-cover object-[center_40%]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121a30] via-[#121a30]/55 to-[#121a30]/25" />
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#121a30]/75 to-transparent" />
          <div className="relative z-10 w-full mx-auto max-w-6xl px-5 sm:px-8 pb-10 pt-28">
            <p className="text-[11px] tracking-[0.22em] uppercase text-[#c9a84c] mb-2">Visit</p>
            <h1 className="font-display text-[40px] sm:text-[52px] font-semibold leading-tight">166 Woodleigh Place</h1>
            <p className="mt-2 text-[16px] text-[#e8d5a3]">Toms River, NJ 08755</p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <a href={MAPS_LINK} target="_blank" rel="noreferrer" className="btn-gold px-6 py-3 text-[12px] tracking-[0.14em] uppercase rounded-sm">Directions</a>
              <Link href="/#schedule" className="px-6 py-3 text-[12px] tracking-[0.14em] uppercase rounded-sm border border-[#e8d5a3] text-[#e8d5a3] hover:bg-[#e8d5a3] hover:text-[#1e2d4e] transition-colors">Schedule</Link>
              <Link href="/donate" className="px-6 py-3 text-[12px] tracking-[0.14em] uppercase rounded-sm border border-[#e8d5a3] text-[#e8d5a3] hover:bg-[#e8d5a3] hover:text-[#1e2d4e] transition-colors">Donate</Link>
            </div>
          </div>
        </section>
        <div className="h-[48vh] min-h-[360px] sm:min-h-[440px] border-t-[3px] border-[#c9a84c]">
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
