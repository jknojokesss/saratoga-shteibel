import Head from 'next/head'
import SiteLayout from '../components/SiteLayout'
import { PAYMENT_URL } from '../components/brand'

export default function Donate() {
  return (
    <>
      <Head>
        <title>Donate · Saratoga Shteibel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Donate to Saratoga Shteibel. Membership, kiddush, shaleshudis, or any amount. Card or Donors Fund." />
      </Head>
      <SiteLayout current="donate" hideFooter flush>
        <iframe
          src={PAYMENT_URL}
          title="Saratoga Shteibel donation form"
          className="donate-iframe"
          allow="payment"
        />
      </SiteLayout>
    </>
  )
}
