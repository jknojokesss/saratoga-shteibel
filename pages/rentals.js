import Head from 'next/head'
import MarketListingsSection from '../components/MarketListingsSection'
import RentalsListingCards from '../components/RentalsListingCards'
import SiteLayout from '../components/SiteLayout'
import InquireEmailLink, { InquireEmailHint } from '../components/InquireEmailLink'
import { generalInquiryDraft } from '../lib/rentals/inquiryMailto'
import { MARKET_LISTINGS } from '../lib/rentals/marketListings'
import { fetchActiveListings } from '../lib/rentals/queries'
import styles from '../styles/rentals.module.css'

const DISCLAIMER =
  'Community and third-party links are for convenience. Saratoga Shteibel is not a party to any transaction and does not verify listings.'

export default function RentalsPage({ listings, marketListings }) {
  const hasShul = listings.length > 0
  const hasMarket = marketListings.length > 0
  const generalInquiry = generalInquiryDraft()

  return (
    <>
      <Head>
        <title>Homes near the shul · Saratoga Shteibel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Homes and apartments for rent or sale near Saratoga Shteibel, 166 Woodleigh Place, Toms River, NJ."
        />
      </Head>
      <SiteLayout current="rentals">
        <div className={styles.page}>
          <header className={styles.hero}>
            <div className="mx-auto max-w-3xl px-5 sm:px-8 text-center">
              <p className={styles.kicker}>Neighborhood</p>
              <h1 className={styles.title}>Homes near the shul</h1>
              <p className={styles.heroSub}>
                Near 166 Woodleigh Place, Toms River — community rentals plus area homes for sale.
              </p>
            </div>
          </header>

          <div className={styles.body}>
            {!hasShul && !hasMarket ? (
              <p className={styles.empty} role="status">
                No listings right now. Check back soon, or ask in shul if you have a property to post.
              </p>
            ) : (
              <section className={styles.homesBoard} aria-label="Rentals and homes for sale">
                <div className={styles.homesHeaderRow}>
                  <div className={styles.homesHeaderCell}>
                    <h2 id="shul-listings-heading" className={styles.sectionTitle}>Rentals</h2>
                    <p className={styles.sectionIntro}>
                      Community postings — tap Inquire to email the shul office.
                    </p>
                  </div>
                  {hasMarket ? (
                    <div className={styles.homesHeaderCell}>
                      <h2 id="market-listings-heading" className={styles.sectionTitle}>Buying</h2>
                      <p className={styles.sectionIntro}>
                        Area homes for sale (MLS prices, Oct 2026). Confirm on Zillow — links open in a new tab.
                      </p>
                    </div>
                  ) : null}
                </div>
                <div className={styles.homesListingsRow}>
                  <RentalsListingCards listings={listings} contentOnly />
                  {hasMarket ? <MarketListingsSection listings={marketListings} contentOnly /> : null}
                </div>
              </section>
            )}

            <div className={styles.generalInquireWrap}>
              <InquireEmailLink
                subject={generalInquiry.subject}
                body={generalInquiry.body}
                className={styles.inquireBox}
              >
                Inquire
              </InquireEmailLink>
              <InquireEmailHint />
              <p className={styles.generalInquireHint}>
                Questions about housing near the shul — email saratogashteibel@gmail.com
              </p>
            </div>

            <p className={styles.disclaimer}>{DISCLAIMER}</p>
          </div>
        </div>
      </SiteLayout>
    </>
  )
}

export async function getServerSideProps() {
  try {
    const listings = await fetchActiveListings()
    return {
      props: {
        listings,
        marketListings: MARKET_LISTINGS,
      },
    }
  } catch (e) {
    console.error('rentals page', e)
    return { props: { listings: [], marketListings: MARKET_LISTINGS } }
  }
}
