"use client";

import Link from "next/link";

export default function NavbarSection() {
  return (
    <header className="bg-gray-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Link href={"/"} className="text-4xl font-bold">
          PremierPlaces
        </Link>
      </div>
    </header>
  );
}
