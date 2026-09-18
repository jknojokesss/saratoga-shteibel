import Head from 'next/head'
import Link from 'next/link'
import SiteLayout from '../components/SiteLayout'

export default function NotFound() {
  return (
    <>
      <Head>
        <title>Not found · Saratoga Shteibel</title>
      </Head>
      <SiteLayout>
        <div className="mx-auto max-w-lg px-5 py-16 text-center">
          <h1 className="font-display text-[32px] font-semibold text-[#1e2d4e]">Page not found</h1>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link href="/" className="btn-navy px-5 py-3 text-[12px] tracking-[0.12em] uppercase rounded-sm">Home</Link>
            <Link href="/donate" className="btn-gold px-5 py-3 text-[12px] tracking-[0.12em] uppercase rounded-sm">Donate</Link>
          </div>
        </div>
      </SiteLayout>
    </>
  )
}
