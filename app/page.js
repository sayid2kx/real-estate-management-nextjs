import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    if (session.user.role === "seller") {
      redirect("/seller/dashboard");
    } else if (session.user.role === "buyer") {
      redirect("/buyer/dashboard");
    }
  }
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-5xl font-bold text-center">Dream House</h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-16">
        <section className="bg-gradient-to-r from-blue-100 to-green-100 rounded-lg p-10 mb-16">
          <h2 className="text-6xl font-extrabold text-center mb-8 text-gray-800 leading-tight">
            Welcome to the Future of Real Estate
          </h2>
        </section>

        <section className="relative w-full p-10 h-fit md:h-96">
          <Image
            src="/images/dream-house-banner.jpg"
            alt="Real Estate Management Banner"
            layout="fill"
            objectFit="cover"
          />
        </section>

        <section className="grid md:grid-cols-2 gap-16 mb-16 py-10">
          <article className="bg-cyan-100 p-10 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-3xl font-bold mb-6 text-blue-700">
              For Buyers
            </h3>
            <p className="mb-8 text-gray-700 text-lg leading-relaxed">
              Find your dream property with our extensive listings and book your
              property
            </p>
            <Link
              href="/buyer/login"
              className="bg-blue-600 text-white text-lg px-8 py-4 rounded-full hover:bg-blue-700 transition duration-300 inline-block font-semibold"
            >
              Explore Properties
            </Link>
          </article>
          <article className="bg-cyan-100 p-10 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-3xl font-bold mb-6 text-green-700">
              For Sellers
            </h3>
            <p className="mb-8 text-gray-700 text-lg leading-relaxed">
              List your property and connect with potential buyers quickly and
              easily.
            </p>
            <Link
              href="/seller/login"
              className="bg-green-600 text-white text-lg px-8 py-4 rounded-full hover:bg-green-700 transition duration-300 inline-block font-semibold"
            >
              List Your Property
            </Link>
          </article>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-16 mt-16 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <nav className="grid md:grid-cols-3 gap-12">
            <section>
              <h4 className="text-2xl font-bold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/about"
                    className="text-lg hover:text-blue-300 transition duration-300"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-lg hover:text-blue-300 transition duration-300"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-lg hover:text-blue-300 transition duration-300"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </section>
            <section>
              <h4 className="text-2xl font-bold mb-6">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/terms"
                    className="text-lg hover:text-blue-300 transition duration-300"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-lg hover:text-blue-300 transition duration-300"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </section>
            <section>
              <h4 className="text-2xl font-bold mb-6">Connect With Us</h4>
              <p className="text-gray-300 text-lg">
                Follow us on social media for the latest updates and property
                news.
              </p>
            </section>
          </nav>
          <section className="mt-12 text-center text-gray-400">
            <p className="text-lg">
              &copy; 2024 Dream House. All rights reserved.
            </p>
          </section>
        </div>
      </footer>
    </div>
  );
}
