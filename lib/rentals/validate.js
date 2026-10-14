import { descriptionViolatesFairHousing } from './discriminatoryPhrases'
import { sanitizeEmail, sanitizePhone, sanitizeText } from './sanitize'

const STATUSES = new Set(['active', 'hidden', 'leased'])

export function expiryFromNow(days = 60) {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString()
}

export function isListingActive(row, now = new Date()) {
  if (!row || row.status !== 'active') return false
  const exp = new Date(row.expires_at)
  return exp.getTime() > now.getTime()
}

export function validateListingInput(raw, { partial = false } = {}) {
  const errors = []
  const out = {}

  const title = sanitizeText(raw.title, 120)
  const address = sanitizeText(raw.address, 200)
  const neighborhood = sanitizeText(raw.neighborhood, 80)
  const description = sanitizeText(raw.description, 500)
  const distanceToShul = sanitizeText(raw.distance_to_shul ?? raw.distanceToShul, 120)
  const contactName = sanitizeText(raw.contact_name ?? raw.contactName, 80)
  const contactPhone = sanitizePhone(raw.contact_phone ?? raw.contactPhone)
  const contactEmail = sanitizeEmail(raw.contact_email ?? raw.contactEmail)
  const ownerEmail = sanitizeEmail(raw.owner_email ?? raw.ownerEmail)

  if (!partial || raw.title !== undefined) {
    if (!title) errors.push('Title is required.')
    out.title = title
  }
  if (!partial || raw.address !== undefined) {
    if (!address) errors.push('Address is required.')
    out.address = address
  }
  if (!partial || raw.neighborhood !== undefined) {
    out.neighborhood = neighborhood
  }

  if (!partial || raw.owner_email !== undefined || raw.ownerEmail !== undefined) {
    out.owner_email = ownerEmail
  } else if (!partial) {
    out.owner_email = ''
  }

  if (!partial || raw.monthly_rent !== undefined || raw.monthlyRent !== undefined) {
    const rent = Number(raw.monthly_rent ?? raw.monthlyRent)
    if (!Number.isFinite(rent) || rent <= 0 || rent > 999999) {
      errors.push('Monthly rent must be a positive number.')
    } else {
      out.monthly_rent = Math.round(rent)
    }
  }

  if (raw.bedrooms !== undefined && raw.bedrooms !== '' && raw.bedrooms !== null) {
    const b = Number(raw.bedrooms)
    if (!Number.isFinite(b) || b < 0 || b > 99) errors.push('Bedrooms must be a valid number.')
    else out.bedrooms = b
  } else if (!partial) {
    out.bedrooms = null
  }

  if (raw.bathrooms !== undefined && raw.bathrooms !== '' && raw.bathrooms !== null) {
    const b = Number(raw.bathrooms)
    if (!Number.isFinite(b) || b < 0 || b > 99) errors.push('Bathrooms must be a valid number.')
    else out.bathrooms = b
  } else if (!partial) {
    out.bathrooms = null
  }

  if (raw.available_date !== undefined || raw.availableDate !== undefined) {
    const ad = raw.available_date ?? raw.availableDate
    if (!ad) {
      out.available_date = null
    } else {
      const s = String(ad).slice(0, 10)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) errors.push('Available date must be YYYY-MM-DD.')
      else out.available_date = s
    }
  }

  if (!partial || raw.description !== undefined) {
    if (descriptionViolatesFairHousing(description)) {
      errors.push(
        'Description may not state preferences about who may rent. Describe the property only.'
      )
    }
    out.description = description
  }

  if (!partial || raw.distance_to_shul !== undefined || raw.distanceToShul !== undefined) {
    out.distance_to_shul = distanceToShul
  }

  if (!partial || raw.contact_name !== undefined || raw.contactName !== undefined) {
    out.contact_name = contactName
  }
  if (!partial || raw.contact_phone !== undefined || raw.contactPhone !== undefined) {
    out.contact_phone = contactPhone
  }
  if (!partial || raw.contact_email !== undefined || raw.contactEmail !== undefined) {
    out.contact_email = contactEmail
  }

  if (raw.status !== undefined) {
    const st = String(raw.status)
    if (!STATUSES.has(st)) errors.push('Status must be active, hidden, or leased.')
    else out.status = st
  } else if (!partial) {
    out.status = 'active'
  }

  return { errors, data: out }
}

export function rowToPublic(row) {
  return {
    id: row.id,
    title: row.title,
    address: row.address || '',
    neighborhood: row.neighborhood || '',
    monthlyRent: row.monthly_rent,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    availableDate: row.available_date,
    description: row.description,
    distanceToShul: row.distance_to_shul,
    createdAt: row.created_at,
  }
}

export function rowToAdmin(row) {
  return {
    ...rowToPublic(row),
    ownerEmail: row.owner_email || '',
    contactName: row.contact_name || '',
    contactPhone: row.contact_phone || null,
    contactEmail: row.contact_email || null,
    status: row.status,
    leasedAt: row.leased_at || null,
    expiresAt: row.expires_at,
    active: isListingActive(row),
  }
}
