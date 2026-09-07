import Head from 'next/head'
import Link from 'next/link'
import SiteLayout from '../components/SiteLayout'

export default function NotFound() {
  return (
    <>
      <Head>
        <title>Page not found · Saratoga Shteibel</title>
      </Head>
      <SiteLayout>
        <div className="mx-auto max-w-xl px-5 py-24 text-center">
          <p className="text-[11px] tracking-[0.22em] uppercase text-[#c9a84c] mb-3">404</p>
          <h1 className="font-display text-[40px] font-semibold text-[#1e2d4e]">This page isn&apos;t in the siddur.</h1>
          <p className="mt-4 text-[#7a7068]">The address may have moved. Head home, or go straight to the donation page.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/" className="btn-navy px-5 py-3 text-[12px] tracking-[0.14em] uppercase rounded-sm">Home</Link>
            <Link href="/donate" className="btn-gold px-5 py-3 text-[12px] tracking-[0.14em] uppercase rounded-sm">Donate</Link>
          </div>
        </div>
      </SiteLayout>
    </>
  )
}
