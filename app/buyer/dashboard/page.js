import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import BuyerNavbarComp from '@/app/components/BuyerNavbar'
import AllPropertiesShowToBuyer from '@/app/components/ShowPropertiesToBuyer'
import FooterSection from '@/app/components/Footer'

export default async function BuyerDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'buyer') {
    redirect('/buyer/login')
  }

  return (
    <div className="min-h-screen bg-cyan-100 flex flex-col">
      <BuyerNavbarComp />
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-4xl mt-20">
          <AllPropertiesShowToBuyer />
        </div>
      </div>
      <div className="h-20">
        <FooterSection />
      </div>
    </div>
  )
}
