import { inquiryEmailForListing } from '../lib/rentals/inquiryMailto'
import styles from '../styles/rentals.module.css'

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

export default function RentalsListingCards({ listings, contentOnly = false }) {
  const inner = (
    <>
      {!listings.length ? (
        <p className={styles.columnEmpty} role="status">No rentals posted here right now.</p>
      ) : null}
      {listings.map((item) => (
        <article key={item.id} className={styles.card}>
          <h3 className={styles.cardTitle}>{item.title}</h3>
          <p className={styles.meta}>
            {item.address}
            {item.neighborhood ? ` · ${item.neighborhood}` : ''}
            {item.availableDate ? ` · Available ${formatDate(item.availableDate)}` : ''}
          </p>
          <p className={styles.rent}>
            {formatRent(item.monthlyRent)}
            <span className={styles.rentSuffix}> / mo</span>
          </p>
          {bedBathLabel(item.bedrooms, item.bathrooms) ? (
            <p className={styles.meta}>{bedBathLabel(item.bedrooms, item.bathrooms)}</p>
          ) : null}
          {item.distanceToShul ? <p className={styles.meta}>To shul: {item.distanceToShul}</p> : null}
          {item.description ? <p className={styles.desc}>{item.description}</p> : null}
          <a href={inquiryEmailForListing(item)} className={styles.inquireBox}>
            Inquire
          </a>
        </article>
      ))}
    </>
  )

  if (contentOnly) {
    return <div className={styles.listingsCol}>{inner}</div>
  }

  return (
    <section className={styles.splitSection} aria-labelledby="shul-listings-heading">
      <h2 id="shul-listings-heading" className={styles.sectionTitle}>Rentals</h2>
      <p className={styles.sectionIntro}>Community postings — tap Inquire to email the shul office.</p>
      {inner}
    </section>
  )
}
