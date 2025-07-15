import SellerChatPage from '@/app/components/chat/SellerChat'
import FooterSection from '@/app/components/Footer'
import SellerNavbarComp from '@/app/components/SellerNavbar'

export default function SellerChatWithIdPage() {
  return (
    <div>
      <SellerNavbarComp />
      <SellerChatPage />
      <FooterSection />
    </div>
  )
}
