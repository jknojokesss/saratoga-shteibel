function csvCell(value) {
  const s = String(value ?? '')
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export function inquiriesToCsv(rows) {
  const header = [
    'created_at',
    'listing_id',
    'listing_title',
    'requester_name',
    'requester_phone',
    'requester_email',
    'move_in_date',
    'message',
    'email_status',
  ]
  const lines = [header.join(',')]
  for (const r of rows) {
    lines.push(
      [
        r.createdAt,
        r.listingId,
        r.listingTitle || '',
        r.requesterName,
        r.requesterPhone,
        r.requesterEmail,
        r.moveInDate || '',
        r.message,
        r.emailStatus,
      ]
        .map(csvCell)
        .join(',')
    )
  }
  return lines.join('\n')
}
