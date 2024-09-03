import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import NavbarSection from "./components/Navbar";
import FooterSection from "./components/Footer";

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
      <NavbarSection />

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

      <FooterSection />
    </div>
  );
}
