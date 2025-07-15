import BuyerNavbarComp from '@/app/components/BuyerNavbar'
import BuyerChatPage from '@/app/components/chat/BuyerChat'
import FooterSection from '@/app/components/Footer'

export default function BuyerChatIndexPage() {
  return (
    <div>
      <BuyerNavbarComp />
      <BuyerChatPage />
      <FooterSection />
    </div>
  )
}
