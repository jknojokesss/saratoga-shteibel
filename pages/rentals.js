import Head from 'next/head'
import MarketListingsSection from '../components/MarketListingsSection'
import RentalsListingCards from '../components/RentalsListingCards'
import SiteLayout from '../components/SiteLayout'
import { generalInquiryMailto } from '../lib/rentals/inquiryMailto'
import { MARKET_LISTINGS } from '../lib/rentals/marketListings'
import { fetchActiveListings } from '../lib/rentals/queries'
import styles from '../styles/rentals.module.css'

const DISCLAIMER =
  'Community and third-party links are for convenience. Saratoga Shteibel is not a party to any transaction and does not verify listings.'

export default function RentalsPage({ listings, marketListings }) {
  const hasShul = listings.length > 0
  const hasMarket = marketListings.length > 0

  return (
    <>
      <Head>
        <title>Rentals · Saratoga Shteibel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Homes and apartments for rent near Saratoga Shteibel, 166 Woodleigh Place, Toms River, NJ."
        />
      </Head>
      <SiteLayout current="rentals">
        <div className={styles.page}>
          <header className={styles.hero}>
            <div className="mx-auto max-w-3xl px-5 sm:px-8 text-center">
              <p className={styles.kicker}>Neighborhood Rentals</p>
              <h1 className={styles.title}>Rentals near the shul</h1>
              <p className={styles.heroSub}>
                Near 166 Woodleigh Place, Toms River — community postings and area listings.
              </p>
            </div>
          </header>

          <div className={styles.body}>
            {!hasShul && !hasMarket ? (
              <p className={styles.empty} role="status">
                No listings right now. Check back soon, or ask in shul if you have a property to post.
              </p>
            ) : (
              <>
                <RentalsListingCards listings={listings} />
                <MarketListingsSection listings={marketListings} />
              </>
            )}

            <div className={styles.generalInquireWrap}>
              <a href={generalInquiryMailto()} className={styles.inquireBox}>
                Inquire
              </a>
              <p className={styles.generalInquireHint}>General rental questions — opens your email to saratogashteibel@gmail.com</p>
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
