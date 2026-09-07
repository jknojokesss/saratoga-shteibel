import Head from 'next/head'
import Link from 'next/link'
import SiteLayout from '../components/SiteLayout'
import { PAYMENT_URL } from '../components/brand'

export default function Donate() {
  return (
    <>
      <Head>
        <title>Donate · Saratoga Shteibel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Donate to Saratoga Shteibel. Card or Donors Fund." />
      </Head>

      <SiteLayout current="donate">
        <div className="mx-auto max-w-5xl px-5 py-6">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
            <div>
              <h1 className="font-display text-[32px] font-semibold text-[#1e2d4e]">Donate</h1>
              <p className="text-[14px] text-[#7a7068] mt-1">
                Membership $50/mo · Kiddush $180 · Shaleshudis $25 · or any amount. Card or Donors Fund.
              </p>
            </div>
            <Link href="/" className="text-[12px] tracking-[0.12em] uppercase text-[#7a7068] hover:text-[#1e2d4e]">
              ← Home
            </Link>
          </div>

          <div className="bg-white border border-[#ddd5c4] rounded-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#faf7f2] border-b border-[#ddd5c4]">
              <span className="text-[11px] tracking-[0.14em] uppercase text-[#7a7068]">Sola · Donors Fund</span>
              <a href={PAYMENT_URL} target="_blank" rel="noreferrer" className="text-[11px] tracking-[0.12em] uppercase text-[#1e2d4e] hover:text-[#c9a84c]">
                Open in a new tab →
              </a>
            </div>
            <iframe
              src={PAYMENT_URL}
              title="Saratoga Shteibel donation form"
              className="w-full border-0 block donate-iframe"
            />
          </div>
        </div>
      </SiteLayout>
    </>
  )
}
