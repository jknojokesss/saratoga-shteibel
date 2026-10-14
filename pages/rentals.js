import Head from 'next/head'
import RentalsListingCards from '../components/RentalsListingCards'
import SiteLayout from '../components/SiteLayout'
import { fetchActiveListings } from '../lib/rentals/queries'
import styles from '../styles/rentals.module.css'

const DISCLAIMER =
  'Listings are posted by owners and agents. Saratoga Shteibel is not a party to any rental and does not verify listings.'

export default function RentalsPage({ listings }) {
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
                Near 166 Woodleigh Place, Toms River — use Request details on a listing to reach the owner or agent.
              </p>
            </div>
          </header>

          <div className={styles.body}>
            {listings.length === 0 ? (
              <p className={styles.empty} role="status">
                No active listings right now. Check back soon, or ask in shul if you have a property to post.
              </p>
            ) : (
              <RentalsListingCards listings={listings} />
            )}

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
    return { props: { listings } }
  } catch (e) {
    console.error('rentals page', e)
    return { props: { listings: [] } }
  }
}
