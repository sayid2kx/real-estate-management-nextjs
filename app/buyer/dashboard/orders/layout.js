import BuyerNavbarComp from '@/app/components/BuyerNavbar'
import FooterSection from '@/app/components/Footer'

export default function PropertiesLayout({ accepted, pending, rejected }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <BuyerNavbarComp />

      <main className="flex-grow flex flex-col items-center py-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-center text-3xl font-bold text-gray-800 mb-8">
            Buyer Property Orders
          </h1>

          <div className="grid gap-8">
            <div className="bg-white border-l-4 border-green-500 rounded-lg shadow-md overflow-hidden h-96">
              <div className="bg-green-200 px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Accepted Orders
                </h2>
              </div>
              <div className="p-6 overflow-auto h-80">{accepted}</div>
            </div>

            <div className="bg-white border-l-4 border-yellow-500 rounded-lg shadow-md overflow-hidden h-96">
              <div className="bg-yellow-200 px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  Pending Orders
                </h2>
              </div>
              <div className="p-6 overflow-auto h-80">{pending}</div>
            </div>

            <div className="bg-white border-l-4 border-red-500 rounded-lg shadow-md overflow-hidden h-96">
              <div className="bg-red-200 px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Rejected Orders
                </h2>
              </div>
              <div className="p-6 overflow-auto h-80">{rejected}</div>
            </div>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  )
}
