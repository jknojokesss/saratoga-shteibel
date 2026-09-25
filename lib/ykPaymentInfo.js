export const ZELLE_EMAIL = 'saratogashteibel@gmail.com'
export const DONATE_URL = 'https://www.saratogashteibel.org/donate'

/** PDF: label then value on the next line so text stays readable. */
export const paymentInstructionBlocks = [
  { label: 'Zelle', value: ZELLE_EMAIL },
  { label: 'Credit card', value: DONATE_URL },
]

/** WhatsApp auto-links break when email/URL share a line with a prefix — use blank line between label and value. */
export function whatsappPaymentLines() {
  const out = ['How to pay', '']
  paymentInstructionBlocks.forEach(({ label, value }, i) => {
    if (i > 0) out.push('')
    out.push(label, value)
  })
  return out
}
