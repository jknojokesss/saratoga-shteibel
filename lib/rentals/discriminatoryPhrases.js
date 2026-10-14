/** Server-side fair-housing guardrail — not legal advice; attorney should review. */
export const DISCRIMINATORY_PHRASES = [
  'frum only',
  'frum families only',
  'jewish only',
  'jews only',
  'shomer shabbos only',
  'shomer shabbat only',
  'religious only',
  'no children',
  'no kids',
  'adults only',
  'singles only',
  'no families',
  'christians only',
  'muslims only',
  'white only',
  'no section 8',
  'no section eight',
  'no welfare',
  'no illegals',
  'english only',
  'born in the usa',
]

export function descriptionViolatesFairHousing(description) {
  const text = String(description || '').toLowerCase()
  return DISCRIMINATORY_PHRASES.some((phrase) => text.includes(phrase))
}
