import BuyerNavbarComp from '@/app/components/BuyerNavbar'
import FooterSection from '@/app/components/Footer'

export default function OrderPage() {
  return (
    <div>
      <BuyerNavbarComp />
      <h1 className="min-h-screen flex-grow flex items-center justify-center text-4xl">
        Buyer Order Page
      </h1>
      <div className="h-20">
        <FooterSection />
      </div>
    </div>
  )
}
