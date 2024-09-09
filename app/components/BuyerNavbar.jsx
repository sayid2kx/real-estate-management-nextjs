"use client";

import { useState } from "react";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

const BuyerNavbarComp = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-gray-800 p-6">
      <div className="flex justify-between items-center">
        <Link
          href={"/buyer/dashboard"}
          className="text-white text-2xl font-bold"
        >
          PremierPlaces
        </Link>

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

        <div className="hidden md:flex flex-1 justify-center items-center space-x-6">
          <Link
            href="/buyer/dashboard/profile"
            className="text-white text-xl hover:text-green-400 transition-colors duration-300"
          >
            Profile
          </Link>
          <Link
            href="/buyer/dashboard/order"
            className="text-white text-xl hover:text-green-400 transition-colors duration-300"
          >
            Order
          </Link>
        </div>

        <div className="hidden md:block">
          <LogoutButton />
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-4 items-center text-center">
          <Link
            href="/buyer/dashboard/profile"
            className="text-white text-lg py-2 hover:text-green-400 transition-colors duration-300"
          >
            Profile
          </Link>
          <Link
            href="/buyer/dashboard/order"
            className="text-white text-lg py-2 hover:text-green-400 transition-colors duration-300"
          >
            Order
          </Link>
          <div className="py-2">
            <LogoutButton />
          </div>
        </div>
      )}
    </nav>
  );
};

export default BuyerNavbarComp;
