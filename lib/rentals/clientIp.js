import crypto from 'crypto'

export function getClientIp(req) {
  const xf = req.headers['x-forwarded-for']
  if (typeof xf === 'string' && xf.trim()) return xf.split(',')[0].trim()
  if (Array.isArray(xf) && xf[0]) return String(xf[0]).trim()
  return req.socket?.remoteAddress || 'unknown'
}

export function hashClientIp(ip) {
  const salt = process.env.RENTALS_RATE_LIMIT_SALT || process.env.SHUL_ADMIN_CODE || 'rentals-rate'
  return crypto.createHash('sha256').update(`${salt}:${ip}`).digest('hex')
}
