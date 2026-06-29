import Head from 'next/head'

// The donation form (Cardknox) embedded at a clean saratogashteibel.org/donate URL.
export default function Donate() {
  return (
    <>
      <Head>
        <title>Saratoga Shteibel — Donate</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{ margin: 0, padding: 0, width: '100vw', height: '100vh', overflow: 'hidden' }}>
        <iframe
          src="https://secure.cardknox.com/saratogashteibel"
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          title="Saratoga Shteibel Donation"
        />
      </div>
    </>
  )
}
