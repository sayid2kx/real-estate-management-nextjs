// app/buyer/dashboard/properties/default.js
import BuyerNavbarComp from '@/app/components/BuyerNavbar'
import FooterSection from '@/app/components/Footer'

export default function DefaultPage() {
  return (
    <div>
      <BuyerNavbarComp />
      <h1 className="min-h-screen flex-grow flex items-center justify-center text-3xl text-center">
        Buyer Order Page — Parallel Route Not Active
      </h1>
      <FooterSection />
    </div>
  )
}
