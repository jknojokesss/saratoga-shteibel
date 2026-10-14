/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com', 'storage.googleapis.com'],
  },
  experimental: {
    // pdfkit loads its built-in font files by path at runtime, which Next's file
    // tracing can't see — without this the PDF route 500s on Vercel.
    outputFileTracingIncludes: {
      '/api/books-pdf': ['./node_modules/pdfkit/js/**/*', './lib/fonts/*'],
    },
  },
  async rewrites() {
    // beforeFiles so this runs BEFORE the filesystem route (index.js login page).
    return {
      beforeFiles: [
        // Clean URL for this week's zmanim flyer.
        { source: '/shabbos-schedule.pdf', destination: '/api/schedule-file' },
        {
          source: '/',
          has: [{ type: 'host', value: 'saratogashteibel.org' }],
          destination: '/saratoga-home',
        },
        {
          source: '/',
          has: [{ type: 'host', value: 'www.saratogashteibel.org' }],
          destination: '/saratoga-home',
        },
      ],
    }
  },
  async redirects() {
    const portalOff = ['/dashboard', '/financials', '/reset-password'].map((source) => ({
      source,
      destination: '/saratoga-home',
      permanent: false,
    }))
    const homesAlias = [{ source: '/rentals', destination: '/homes', permanent: true }]
    const adminMoved = [
      ['/zmanim-admin', '/admin/zmanim'],
      ['/announcements-admin', '/admin/announcements'],
      ['/shul-vote-admin', '/admin/shul-vote'],
      ['/board-vote-admin', '/admin/board-vote'],
      ['/board-vote-send', '/admin/board-vote-send'],
      ['/auction-admin', '/admin/auction'],
      ['/books-upload', '/admin/books-upload'],
      ['/books-review', '/admin/books-review'],
      ['/books', '/admin/books'],
      ['/membership', '/admin/membership'],
      ['/yk-invoices-send', '/admin/yk-invoices'],
    ].map(([source, destination]) => ({ source, destination, permanent: false }))
    return [...portalOff, ...homesAlias, ...adminMoved]
  },
  async headers() {
    return [
      {
        source: '/donate-form.html',
        headers: [{ key: 'Cache-Control', value: 'no-store, must-revalidate' }],
      },
    ]
  },
}

module.exports = nextConfig
