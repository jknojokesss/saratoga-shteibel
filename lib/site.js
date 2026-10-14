export const SITE_ORIGIN = 'https://www.saratogashteibel.org'

export function absoluteUrl(path = '/') {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${SITE_ORIGIN}${p}`
}
