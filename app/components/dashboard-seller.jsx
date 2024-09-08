"use client";

import { useState } from "react";
import Link from "next/link";
import FooterSection from "./Footer";
import LogoutButton from "./LogoutButton";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-gray-800 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold mx-auto md:mx-0 md:ml-4">
          PrimerPlaces
        </h1>

        <div className="md:hidden flex items-center">
          <button
            onClick={toggleMenu}
            className="text-white focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        <div className="hidden md:flex flex-1 justify-center gap-6">
          <Link
            href="/all-properties"
            className="text-white text-xl hover:text-green-400 transition-colors duration-300"
          >
            All Properties
          </Link>
          <Link
            href="/my-properties"
            className="text-white text-xl hover:text-green-400 transition-colors duration-300"
          >
            My Properties
          </Link>
          <Link
            href="/profile"
            className="text-white text-xl hover:text-green-400 transition-colors duration-300"
          >
            Profile
          </Link>
        </div>

        <div className="hidden md:block">
          <LogoutButton />
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-4 items-center text-center">
          <Link
            href="/all-properties"
            className="text-white text-lg py-2 hover:text-green-400 transition-colors duration-300"
          >
            All Properties
          </Link>
          <Link
            href="/my-properties"
            className="text-white text-lg py-2 hover:text-green-400 transition-colors duration-300"
          >
            My Properties
          </Link>
          <Link
            href="/profile"
            className="text-white text-lg py-2 hover:text-green-400 transition-colors duration-300"
          >
            Profile
          </Link>
          <div className="py-2">
            <LogoutButton />
          </div>
        </div>
      )}
    </nav>
  );
};

const MainContent = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
      <div className="bg-cyan-100 shadow-lg rounded-lg p-8 w-full max-w-[1000px] h-auto md:h-[500px] flex flex-col justify-center items-center">
        <h2 className="mb-8 text-2xl md:text-3xl font-semibold text-gray-800">
          Add Your Property
        </h2>
        <div className="flex justify-center w-full">
          <Link
            href={"dashboard/add-property"}
            className="bg-green-500 text-white text-lg md:text-xl px-6 py-3 md:px-8 md:py-4 rounded-lg shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-transform transform hover:scale-105"
          >
            Add Property
          </Link>
        </div>
      </div>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="bg-gray-800 p-6 text-center text-white">
      Footer Section
    </footer>
  );
};

const SellerDashboardPage = () => {
  return (
    <div>
      <Navbar />
      <MainContent />
      <FooterSection />
    </div>
  );
};

export default SellerDashboardPage;
