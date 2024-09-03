"use client";
import Link from "next/link";

export default function FooterSection() {
  return (
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
            &copy; 2024 PremierPlaces. All rights reserved.
          </p>
        </section>
      </div>
    </footer>
  );
}
