/**
 * Rental inquiry email (optional). Off by default — inquiries are stored in Supabase
 * and reviewed in /admin/rentals. Set RENTALS_EMAIL_ENABLED=true and wire SMTP later.
 */

export function isRentalsEmailConfigured() {
  return process.env.RENTALS_EMAIL_ENABLED === 'true'
}

export function getRentalsEmailConfig() {
  return { enabled: isRentalsEmailConfigured() }
}

export async function sendRentalInquiryEmail() {
  if (!isRentalsEmailConfigured()) {
    return { ok: false, skipped: true, error: 'Rental inquiry email is disabled.' }
  }
  return { ok: false, error: 'Rental inquiry email is not implemented yet.' }
}
