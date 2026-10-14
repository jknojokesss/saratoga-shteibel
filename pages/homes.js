import Head from 'next/head'
import MarketListingsSection from '../components/MarketListingsSection'
import RentalsListingCards from '../components/RentalsListingCards'
import PageHero from '../components/PageHero'
import SiteLayout from '../components/SiteLayout'
import InquireEmailLink, { InquireEmailHint } from '../components/InquireEmailLink'
import { generalInquiryDraft } from '../lib/rentals/inquiryMailto'
import { MARKET_LISTINGS } from '../lib/rentals/marketListings'
import { fetchActiveListings } from '../lib/rentals/queries'
import { absoluteUrl } from '../lib/site'
import styles from '../styles/rentals.module.css'

const DISCLAIMER =
  'Community and third-party links are for convenience. Saratoga Shteibel is not a party to any transaction and does not verify listings.'

const PAGE_TITLE = 'Homes near the shul · Saratoga Shteibel'
const PAGE_DESC =
  'Homes for sale and community rentals near Saratoga Shteibel, 166 Woodleigh Place, Toms River, NJ — walking distance to the shul.'
const CANONICAL = absoluteUrl('/homes')
const OG_IMAGE = absoluteUrl('/logo.png')

export default function HomesPage({ listings, marketListings }) {
  const hasShul = listings.length > 0
  const hasMarket = marketListings.length > 0
  const generalInquiry = generalInquiryDraft()

  return (
    <>
      <Head>
        <title>{PAGE_TITLE}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={PAGE_DESC} />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={PAGE_DESC} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={PAGE_TITLE} />
        <meta name="twitter:description" content={PAGE_DESC} />
        <meta name="twitter:image" content={OG_IMAGE} />
      </Head>
      <SiteLayout current="homes">
        <div className={styles.page}>
          <PageHero
            kicker="Neighborhood"
            title="Homes near the shul"
            subtitle="Near 166 Woodleigh Place, Toms River — community rentals plus area homes for sale."
          />

          <div className={styles.body}>
            {!hasShul && !hasMarket ? (
              <p className={styles.empty} role="status">
                No listings right now. Check back soon, or ask in shul if you have a property to post.
              </p>
            ) : (
              <section
                className={`${styles.homesBoard} ${!hasShul && hasMarket ? styles.homesBoardBuyFocus : ''}`}
                aria-label="Rentals and homes for sale"
              >
                <div
                  className={`${styles.homesHeaderRow} ${!hasShul && hasMarket ? styles.homesHeaderRowBuyFocus : ''}`}
                >
                  {hasShul ? (
                    <div className={styles.homesHeaderCell}>
                      <h2 id="shul-listings-heading" className={styles.sectionTitle}>Rentals</h2>
                      <p className={styles.sectionIntro}>
                        Community postings — Inquire opens email and copies a draft to paste.
                      </p>
                    </div>
                  ) : null}
                  {hasMarket ? (
                    <div
                      className={
                        hasShul ? styles.homesHeaderCell : `${styles.homesHeaderCell} ${styles.homesHeaderCellFull}`
                      }
                    >
                      <h2 id="market-listings-heading" className={styles.sectionTitleBuying}>Buying</h2>
                      <p className={styles.sectionIntro}>
                        Saratoga Phase 1 & 2 plus Walden Woods (separate community). Walk times are to 166 Woodleigh
                        Place.
                      </p>
                    </div>
                  ) : null}
                </div>
                <div
                  className={`${styles.homesListingsRow} ${!hasShul && hasMarket ? styles.homesListingsRowBuyFocus : ''}`}
                >
                  {hasShul ? <RentalsListingCards listings={listings} contentOnly /> : null}
                  {hasMarket ? (
                    <MarketListingsSection listings={marketListings} contentOnly wideGrid={!hasShul} />
                  ) : null}
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
    console.error('homes page', e)
    return { props: { listings: [], marketListings: MARKET_LISTINGS } }
  }
}
