import { listingTitleFromFields } from './listingTitle'
import { validateListingInput } from './validate'

export function validateSubmissionInput(raw) {
  const honeypot = sanitizeHoneypot(raw?.website ?? raw?.company_url)
  if (honeypot) {
    return { spam: true, errors: [], data: null }
  }

  const { errors, data } = validateListingInput(
    {
      ...raw,
      status: 'hidden',
      title: listingTitleFromFields({
        address: raw?.address,
        bedrooms: raw?.bedrooms,
        bathrooms: raw?.bathrooms,
        neighborhood: raw?.neighborhood,
      }),
    },
    { partial: false }
  )

  if (!data.contact_name?.trim()) {
    errors.push('Your name is required.')
  }
  if (!data.contact_phone && !data.contact_email) {
    errors.push('Please add a phone number or email so we can reach you.')
  }

  if (!data.owner_email && data.contact_email) {
    data.owner_email = data.contact_email
  }

  return { spam: false, errors, data }
}

function sanitizeHoneypot(value) {
  if (value == null) return false
  return String(value).trim().length > 0
}
