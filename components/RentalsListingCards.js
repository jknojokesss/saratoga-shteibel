import { useState } from 'react'
import RentalInquiryModal from './RentalInquiryModal'
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

export default function RentalsListingCards({ listings }) {
  const [inquiryListing, setInquiryListing] = useState(null)

  return (
    <>
      <section aria-label="Active rental listings">
        {listings.map((item) => (
          <article key={item.id} className={styles.card}>
            <h2 className={styles.cardTitle}>{item.title}</h2>
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
            <button
              type="button"
              className={styles.requestBtn}
              onClick={() => setInquiryListing(item)}
            >
              Request details
            </button>
          </article>
        ))}
      </section>
      {inquiryListing ? (
        <RentalInquiryModal listing={inquiryListing} onClose={() => setInquiryListing(null)} />
      ) : null}
    </>
  )
}
