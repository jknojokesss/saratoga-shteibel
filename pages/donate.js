import Head from 'next/head'
import Link from 'next/link'
import GivingCards from '../components/GivingCards'
import SiteLayout from '../components/SiteLayout'
import { PAYMENT_URL } from '../components/brand'

export default function Donate() {
  return (
    <>
      <Head>
        <title>Donate · Saratoga Shteibel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Support Saratoga Shteibel — monthly membership, kiddush and shaleshudis sponsorships, or a general donation. Card or Donors Fund."
        />
        <meta property="og:title" content="Donate to Saratoga Shteibel" />
        <meta property="og:image" content="/shul-photo.jpg" />
      </Head>

      <SiteLayout current="donate">
        <section className="relative overflow-hidden donate-hero">
          <div className="absolute inset-0">
            <img src="/shul-photo.jpg" alt="" className="w-full h-full object-cover object-[center_40%] opacity-55" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#121a30] via-[#1e2d4e]/78 to-[#1e2d4e]/55" />
          </div>
          <div className="relative mx-auto max-w-6xl px-5 sm:px-8 py-14 sm:py-20">
            <p className="font-hebrew text-[#e8d5a3] text-[20px] mb-3">ב״ה</p>
            <p className="text-[11px] tracking-[0.28em] uppercase text-[#c9a84c] mb-3">Support your community</p>
            <h1 className="font-display text-[42px] sm:text-[56px] font-semibold text-[#faf7f2] leading-[1.05] max-w-2xl">
              Give like you daven — steadily, and from the heart.
            </h1>
            <p className="mt-5 max-w-xl text-[16.5px] text-[#e8d5a3]/90 leading-relaxed font-light">
              Membership keeps the room ours. A kiddush feeds the table after mussaf.
              A general gift covers whatever the week actually costs. Card or Donors Fund — both land here.
            </p>
            <a href="#give" className="btn-gold inline-block mt-8 px-6 py-3.5 text-[13px] tracking-[0.14em] uppercase rounded-sm">
              Choose a way to give
            </a>
          </div>
        </section>

        <section className="paper-bg border-b border-[#ddd5c4]">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-14">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="font-display text-[32px] font-semibold text-[#1e2d4e]">Four ways in</h2>
                <p className="text-[14px] text-[#7a7068] mt-1">Pick a lane, then complete it in the secure form below.</p>
              </div>
              <Link href="/" className="text-[12px] tracking-[0.12em] uppercase text-[#7a7068] hover:text-[#1e2d4e]">
                ← Back to the shtiebel
              </Link>
            </div>
            <GivingCards href="#give" />
            <p className="mt-6 text-[13px] text-[#7a7068] leading-relaxed max-w-3xl">
              Kiddush this week sometimes closes early so the zmanim sheet can go to print.
              If the form says this week is closed, reach out to Eli Shine and we&apos;ll still make it work.
            </p>
          </div>
        </section>

        <section id="give" className="scroll-mt-[72px] bg-[#f3eee6]">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10 lg:py-12 grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] gap-8 items-start">
            <aside className="lg:sticky lg:top-24">
              <div className="ornament-card bg-[#1e2d4e] text-[#faf7f2] p-7 rounded-sm">
                <p className="text-[11px] tracking-[0.2em] uppercase text-[#c9a84c] mb-3">The form</p>
                <h2 className="font-display text-[30px] font-semibold leading-tight">Secure giving</h2>
                <div className="gold-rule my-4 bg-[#c9a84c]" />
                <ul className="space-y-3 text-[14px] text-[#c5cddd] leading-relaxed">
                  <li>Credit card via Sola Payments — PCI compliant.</li>
                  <li>Donors Fund giving-card number and PIN, granted straight to the shtiebel.</li>
                  <li>Monthly membership needs a card so it can bill on its own.</li>
                  <li>A receipt goes to the email you enter.</li>
                </ul>
                <p className="mt-6 text-[12.5px] text-[#e8d5a3]/80 leading-relaxed">
                  The form lives in its own secure window. If anything looks tight on a phone, rotate or scroll inside the frame.
                </p>
              </div>
            </aside>

            <div className="donate-frame bg-white border border-[#ddd5c4] rounded-sm overflow-hidden shadow-[0_20px_50px_rgba(30,45,78,0.12)]">
              <div className="flex items-center justify-between gap-3 px-4 py-3 bg-[#faf7f2] border-b border-[#ddd5c4]">
                <span className="text-[11px] tracking-[0.16em] uppercase text-[#7a7068]">Sola · Donors Fund</span>
                <a
                  href={PAYMENT_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-[#1e2d4e] tracking-[0.12em] uppercase hover:text-[#c9a84c]"
                >
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
        </section>
      </SiteLayout>
    </>
  )
}
