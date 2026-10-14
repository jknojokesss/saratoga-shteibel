import Head from 'next/head'
import SiteLayout from '../components/SiteLayout'
import { fetchActiveListings } from '../lib/rentals/queries'
import styles from '../styles/rentals.module.css'

const DISCLAIMER =
  'Listings are posted by owners and agents. Saratoga Shteibel is not a party to any rental and does not verify listings.'

function formatDate(iso) {
  if (!iso) return null
  try {
    const d = new Date(iso.includes('T') ? iso : `${iso}T12:00:00`)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return iso
  }
}

function formatRent(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function bedBathLabel(bed, bath) {
  const parts = []
  if (bed != null && bed !== '') parts.push(`${bed} bed`)
  if (bath != null && bath !== '') parts.push(`${bath} bath`)
  return parts.join(' · ')
}

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
        <link
          href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,500;0,6..96,600&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </Head>
      <SiteLayout current="rentals">
        <div className={styles.page}>
          <header className={styles.hero}>
            <div className="mx-auto max-w-3xl px-5 sm:px-8 text-center">
              <p className={styles.kicker}>Neighborhood Rentals</p>
              <h1 className={styles.title}>Rentals near the shul</h1>
              <p className={styles.heroSub}>
                Near 166 Woodleigh Place, Toms River — contact owners and agents directly.
              </p>
            </div>
          </header>

          <div className={styles.body}>
            {listings.length === 0 ? (
              <p className={styles.empty} role="status">
                No active listings right now. Check back soon, or ask in shul if you have a property to post.
              </p>
            ) : (
              <section aria-label="Active rental listings">
                {listings.map((item) => (
                  <article key={item.id} className={styles.card}>
                    <h2 className={styles.cardTitle}>{item.title}</h2>
                    <p className={styles.meta}>
                      {item.address}
                      {item.neighborhood ? ` · ${item.neighborhood}` : ''}
                      {item.availableDate ? ` · Available ${formatDate(item.availableDate)}` : ''}
                    </p>
                    <p className={styles.rent}>{formatRent(item.monthlyRent)}<span className={styles.rentSuffix}> / mo</span></p>
                    {bedBathLabel(item.bedrooms, item.bathrooms) ? (
                      <p className={styles.meta}>{bedBathLabel(item.bedrooms, item.bathrooms)}</p>
                    ) : null}
                    {item.distanceToShul ? (
                      <p className={styles.meta}>To shul: {item.distanceToShul}</p>
                    ) : null}
                    {item.description ? <p className={styles.desc}>{item.description}</p> : null}
                    <div className={styles.contact}>
                      <strong>{item.contactName || 'Contact'}</strong>
                      <br />
                      {item.contactPhone ? (
                        <a href={`tel:${item.contactPhone.replace(/\s/g, '')}`}>{item.contactPhone}</a>
                      ) : null}
                      {item.contactPhone && item.contactEmail ? ' · ' : null}
                      {item.contactEmail ? (
                        <a href={`mailto:${item.contactEmail}`}>{item.contactEmail}</a>
                      ) : null}
                    </div>
                  </article>
                ))}
              </section>
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
