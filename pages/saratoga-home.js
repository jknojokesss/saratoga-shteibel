import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import BulletinBoard from '../components/BulletinBoard'
import GivingCards from '../components/GivingCards'
import ShabbosSchedule from '../components/ShabbosSchedule'
import SiteLayout from '../components/SiteLayout'
import { GOLD, MAPS_EMBED, MAPS_LINK } from '../components/brand'

const FALLBACK_ANNOUNCEMENTS = [
  { tag: 'Welcome', title: 'Welcome to our new website', body: 'Announcements will be posted here on the bulletin board.', pin: GOLD },
]

export default function SaratogaHome() {
  const [announcements, setAnnouncements] = useState(FALLBACK_ANNOUNCEMENTS)
  const [scheduleUrl, setScheduleUrl] = useState(null)

  useEffect(() => {
    fetch('/api/announcements/list').then((r) => r.json()).then((d) => {
      if (d.announcements && d.announcements.length) setAnnouncements(d.announcements)
    }).catch(() => {})
    fetch('/api/announcements/schedule').then((r) => r.json()).then((d) => {
      if (d.url) setScheduleUrl(d.url)
    }).catch(() => {})
  }, [])

  return (
    <>
      <Head>
        <title>Saratoga Shteibel · Toms River</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Saratoga Shteibel is a warm neighborhood minyan at 166 Woodleigh Place, Toms River, NJ. Daven with us, stay for kiddush, support the kehillah."
        />
        <meta property="og:title" content="Saratoga Shteibel" />
        <meta property="og:description" content="A neighborhood minyan in Toms River. Est. 2023." />
        <meta property="og:image" content="/shul-photo.jpg" />
        <link rel="canonical" href="https://www.saratogashteibel.org/" />
      </Head>

      <SiteLayout overlayNav>
        <section className="relative min-h-[100svh] flex items-end text-[#faf7f2] overflow-hidden">
          <Image
            src="/shul-photo.jpg"
            alt="Morning minyan at Saratoga Shteibel"
            fill
            priority
            className="object-cover object-[center_42%]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121a30] via-[#1e2d4e]/70 to-[#1e2d4e]/35" />
          <div className="ornament-frame pointer-events-none absolute inset-4 sm:inset-6 border border-[#c9a84c]/35" />

          <div className="relative z-10 w-full mx-auto max-w-6xl px-5 sm:px-8 pb-16 pt-32">
            <div className="fade-up">
              <div className="font-hebrew text-[22px] text-[#e8d5a3] mb-5">ב״ה</div>
              <p className="text-[11px] tracking-[0.32em] uppercase text-[#e8d5a3] mb-4">166 Woodleigh Place · Toms River</p>
              <h1 className="font-display font-semibold leading-[0.95] text-[52px] sm:text-[72px] md:text-[88px] max-w-3xl">
                A shtiebel<br />with a heartbeat.
              </h1>
              <p className="mt-6 max-w-xl text-[17px] sm:text-[18px] font-light leading-relaxed text-[#f0ebe0]/90">
                We daven together, we make kiddush, we look out for one another.
                Established 2023 — still young, still growing, and glad you found us.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#this-week" className="btn-gold px-6 py-3.5 text-[13px] tracking-[0.14em] uppercase rounded-sm">
                  This week&apos;s schedule
                </a>
                <Link href="/donate" className="px-6 py-3.5 text-[13px] tracking-[0.14em] uppercase rounded-sm border border-[#e8d5a3] text-[#e8d5a3] hover:bg-[#e8d5a3] hover:text-[#1e2d4e] transition-colors">
                  Support the shtiebel
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="bg-[#1e2d4e] text-[#e8d5a3]">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-3 text-[12px] tracking-[0.16em] uppercase">
            <span>Est. 2023</span>
            <span className="hidden sm:inline text-[#c9a84c]">✦</span>
            <span>166 Woodleigh Place</span>
            <span className="hidden sm:inline text-[#c9a84c]">✦</span>
            <span>Toms River, NJ</span>
          </div>
        </div>

        <section className="paper-bg">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-20 grid lg:grid-cols-2 gap-14 items-center">
            <div className="fade-up">
              <p className="text-[11px] tracking-[0.22em] uppercase text-[#c9a84c] mb-3">The minyan</p>
              <h2 className="font-display text-[40px] sm:text-[46px] font-semibold text-[#1e2d4e] leading-tight">
                Not a cathedral.<br />A living room with an Aron.
              </h2>
              <div className="gold-rule my-5" />
              <p className="text-[16.5px] leading-relaxed text-[#5a5348]">
                Saratoga Shteibel is a classic neighborhood shtiebel — folding chairs, white tablecloths,
                tallisos in the morning light, and a child at the table with a siddur. If you know, you know.
                If you don&apos;t yet, come once. You&apos;ll get it.
              </p>
              <p className="mt-4 text-[16.5px] leading-relaxed text-[#5a5348]">
                Times change with the week. The source of truth is the Shabbos schedule posted below —
                same sheet that sits on the table in shul.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { n: '01', t: 'Tefillah', d: 'A reliable minyan, close to home, without the marble-hall feeling.' },
                { n: '02', t: 'Shabbos', d: 'Kiddush after davening. Shaleshudis when someone sponsors. The week gathers here.' },
                { n: '03', t: 'Kehillah', d: 'Neighbors looking after neighbors. That is the whole pitch.' },
                { n: '04', t: 'Support', d: '$50 membership, a kiddush, or whatever you can give. It all lands.' },
              ].map((item) => (
                <div key={item.n} className="bg-white/70 border border-[#ddd5c4] p-5 rounded-sm">
                  <div className="text-[11px] tracking-[0.2em] text-[#c9a84c] mb-2">{item.n}</div>
                  <div className="font-display text-[22px] text-[#1e2d4e] font-semibold mb-1.5">{item.t}</div>
                  <p className="text-[13px] text-[#7a7068] leading-relaxed">{item.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="this-week" className="scroll-mt-24">
          <div className="bg-[#1e2d4e] px-5 sm:px-8 py-10 text-center">
            <p className="font-hebrew text-[#e8d5a3] text-[20px] mb-2">ואני תפלתי לך ה׳ עת רצון</p>
            <p className="text-[12px] tracking-[0.18em] uppercase text-[#c9a84c]">This week at the shtiebel</p>
          </div>
          <div className="main-week-grid grid lg:grid-cols-[1.15fr_0.85fr]">
            <div className="lg:order-2">
              <ShabbosSchedule scheduleUrl={scheduleUrl} />
            </div>
            <div className="lg:order-1">
              <BulletinBoard announcements={announcements} />
            </div>
          </div>
        </section>

        <section className="paper-bg" id="give">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-20">
            <div className="max-w-2xl mb-10">
              <p className="text-[11px] tracking-[0.22em] uppercase text-[#c9a84c] mb-3">Support</p>
              <h2 className="font-display text-[40px] font-semibold text-[#1e2d4e] leading-tight">
                Keep the table set.
              </h2>
              <p className="mt-4 text-[16px] text-[#5a5348] leading-relaxed">
                Rent, lights, kiddush, a warm room to daven in. Four simple ways to give —
                credit card or Donors Fund — on a form that actually belongs to this shtiebel.
              </p>
            </div>
            <GivingCards />
            <div className="mt-8 text-center sm:text-left">
              <Link href="/donate" className="btn-navy inline-block px-7 py-3.5 text-[13px] tracking-[0.14em] uppercase rounded-sm">
                Open the donation page
              </Link>
            </div>
          </div>
        </section>

        <section id="visit" className="scroll-mt-24 bg-[#fffdf8] border-t border-[#ddd5c4]">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-20 grid lg:grid-cols-2 gap-10 items-stretch">
            <div>
              <p className="text-[11px] tracking-[0.22em] uppercase text-[#c9a84c] mb-3">Find us</p>
              <h2 className="font-display text-[40px] font-semibold text-[#1e2d4e] leading-tight">
                166 Woodleigh Place
              </h2>
              <p className="mt-2 text-[18px] text-[#7a7068]">Toms River, New Jersey 08755</p>
              <div className="gold-rule my-5" />
              <p className="text-[16px] text-[#5a5348] leading-relaxed max-w-md">
                A house-minyan energy, not a campus. If you are new, walk in. Someone will find you a siddur.
                Check this week&apos;s PDF for exact times before you come.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={MAPS_LINK} target="_blank" rel="noreferrer" className="btn-navy px-5 py-3 text-[12px] tracking-[0.14em] uppercase rounded-sm">
                  Open in Maps
                </a>
                <a href="#this-week" className="px-5 py-3 text-[12px] tracking-[0.14em] uppercase rounded-sm border border-[#1e2d4e] text-[#1e2d4e] hover:bg-[#1e2d4e] hover:text-white transition-colors">
                  See the schedule
                </a>
              </div>
            </div>
            <div className="min-h-[320px] border border-[#ddd5c4] rounded-sm overflow-hidden shadow-[0_12px_40px_rgba(30,45,78,0.12)]">
              <iframe
                title="Map of Saratoga Shteibel"
                src={MAPS_EMBED}
                className="w-full h-full min-h-[320px] border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>
      </SiteLayout>
    </>
  )
}
