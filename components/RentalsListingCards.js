import Image from 'next/image'
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

function splitTitle(title) {
  if (!title) return { headline: '', detail: '' }
  const idx = title.indexOf(' — ')
  if (idx === -1) return { headline: title, detail: '' }
  return { headline: title.slice(0, idx), detail: title.slice(idx + 3) }
}

function RentalCard({ item }) {
  const { headline, detail } = splitTitle(item.title)
  const bedsBaths = bedBathLabel(item.bedrooms, item.bathrooms)

  return (
    <article className={`${styles.marketCard} ${styles.rentalCard}`}>
      {item.imageUrl ? (
        <div className={styles.marketCardMedia}>
          <Image
            src={item.imageUrl}
            alt={headline || item.title}
            fill
            sizes="(max-width: 899px) 100vw, 42vw"
            className={styles.marketCardImg}
          />
          <div className={styles.marketCardShade} aria-hidden />
          <span className={styles.marketType}>For rent</span>
          {item.phase ? <span className={styles.marketPhaseBadge}>Phase {item.phase}</span> : null}
          <span className={styles.marketPriceOnPhoto}>
            {formatRent(item.monthlyRent)}
            <span className={styles.rentSuffixOnPhoto}> / mo</span>
          </span>
        </div>
      ) : (
        <div className={styles.rentalCardNoPhoto}>
          <span className={styles.marketType}>For rent</span>
          {item.phase ? <span className={styles.marketPhaseBadge}>Phase {item.phase}</span> : null}
          <p className={styles.rent}>
            {formatRent(item.monthlyRent)}
            <span className={styles.rentSuffix}> / mo</span>
          </p>
        </div>
      )}
      <div className={styles.marketCardBody}>
        <span className={styles.marketHeadline}>{headline || item.title}</span>
        {detail ? <span className={styles.marketDetail}>{detail}</span> : null}
        <span className={styles.marketDetail}>
          {item.address}
          {item.neighborhood ? ` · ${item.neighborhood}` : ''}
          {item.availableDate ? ` · Available ${formatDate(item.availableDate)}` : ''}
        </span>
        {bedsBaths ? <span className={styles.marketDetail}>{bedsBaths}</span> : null}
        {item.distanceToShul ? <span className={styles.marketWalk}>{item.distanceToShul}</span> : null}
        {item.contactPhone ? (
          <span className={styles.marketDetail}>
            Contact:{' '}
            <a href={`tel:${item.contactPhone.replace(/\D/g, '')}`} className={styles.rentalPhone}>
              {item.contactPhone}
            </a>
          </span>
        ) : null}
        {item.description ? <span className={styles.marketBlurb}>{item.description}</span> : null}
      </div>
    </article>
  )
}

export default function RentalsListingCards({ listings, contentOnly = false }) {
  const inner = (
    <>
      {listings.map((item) => (
        <RentalCard key={item.id} item={item} />
      ))}
    </>
  )

  if (contentOnly) {
    return <div className={styles.listingsCol}>{inner}</div>
  }

  return (
    <section className={styles.splitSection} aria-labelledby="shul-listings-heading">
      <h2 id="shul-listings-heading" className={styles.sectionTitle}>Rentals</h2>
      <p className={styles.sectionIntro}>Community postings — contact the number on the listing directly.</p>
      {inner}
    </section>
  )
}
