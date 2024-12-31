import Link from 'next/link'
import Image from 'next/image'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import NavbarSection from './components/Navbar'
import FooterSection from './components/Footer'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (session) {
    if (session.user.role === 'seller') {
      redirect('/seller/dashboard')
    } else if (session.user.role === 'buyer') {
      redirect('/buyer/dashboard')
    }
  }
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavbarSection />

      <main className="flex-grow container mx-auto px-4 py-8 sm:py-12">
        <section className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-3xl p-10 mb-16 shadow-lg transform hover:scale-105 transition-transform duration-300">
          <h2 className="text-5xl md:text-7xl font-extrabold text-center mb-8 text-white leading-tight tracking-tight">
            Discover Your Dream Home
          </h2>
          <p className="text-xl md:text-2xl text-center text-white opacity-90">
            Revolutionizing the way you buy, sell, and manage real estate
          </p>
        </section>

        <section className="relative w-full h-64 sm:h-80 md:h-96 mb-8 rounded-2xl overflow-hidden shadow-2xl">
          <Image
            src="/images/dream-house-banner.jpg"
            alt="Real Estate Banner"
            fill
            className="object-cover rounded-2xl"
          />
        </section>
        <section className="grid sm:grid-cols-2 gap-8 mb-12">
          <article className="bg-gradient-to-br from-blue-400 to-blue-600 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <h3 className="text-3xl font-bold mb-4 text-white">For Buyers</h3>
            <p className="mb-6 text-white text-lg leading-relaxed">
              Discover your ideal home with our smart search and virtual tours.
            </p>
            <Link
              href="/buyer/login"
              className="bg-white text-blue-600 text-lg px-8 py-3 rounded-full hover:bg-blue-100 transition duration-300 inline-block font-semibold shadow-md hover:shadow-lg"
            >
              Start Searching
            </Link>
          </article>
          <article className="bg-gradient-to-br from-purple-400 to-purple-600 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <h3 className="text-3xl font-bold mb-4 text-white">For Sellers</h3>
            <p className="mb-6 text-white text-lg leading-relaxed">
              List and showcase your property to reach potential buyers
              effortlessly.
            </p>
            <Link
              href="/seller/login"
              className="bg-white text-purple-600 text-lg px-8 py-3 rounded-full hover:bg-purple-100 transition duration-300 inline-block font-semibold shadow-md hover:shadow-lg"
            >
              List Property
            </Link>
          </article>
        </section>

        <section className="bg-gray-100 rounded-2xl shadow-xl p-8 sm:p-12">
          <h3 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-gray-800">
            Why Choose Us?
          </h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Easy to Use',
                desc: 'User-friendly platform for seamless property searches and listings',
              },
              {
                title: 'Virtual Tours',
                desc: 'Explore properties from anywhere with immersive virtual tours',
              },
              {
                title: 'Expert Support',
                desc: 'Get guidance from our team of real estate professionals',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <h4 className="text-xl font-semibold mb-3 text-gray-800">
                  {feature.title}
                </h4>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <FooterSection />
    </div>
  )
}
