export default function RentalsRedirect() {
  return null
}

export function getServerSideProps() {
  return {
    redirect: {
      destination: '/homes',
      permanent: true,
    },
  }
}
