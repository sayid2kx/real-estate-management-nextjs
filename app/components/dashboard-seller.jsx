"use client";
import Link from "next/link";
import FooterSection from "./Footer";
import SellerNavbarComp from "./SellerNavbar";

const MainContent = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-100 via-blue-50 to-white p-6">
      <div className="bg-gradient-to-r from-blue-300 to-sky-200 shadow-xl rounded-xl p-12 w-full max-w-4xl mx-auto flex flex-col justify-center items-center h-[400px] md:h-[500px] transition-transform transform hover:scale-105 hover:shadow-2xl">
        <h2 className="mb-8 text-3xl font-bold text-gray-900 tracking-wide">
          Add Your Property
        </h2>
        <div className="flex justify-center w-full">
          <Link
            href={"/seller/dashboard/add-property"}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg px-8 py-4 rounded-full shadow-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300 transform hover:scale-110"
          >
            Add Property
          </Link>
        </div>
      </div>
    </div>
  );
};

const SellerDashboardPage = () => {
  return (
    <div>
      <SellerNavbarComp />
      <MainContent />
      <FooterSection />
    </div>
  );
};

export default SellerDashboardPage;
