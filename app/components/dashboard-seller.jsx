"use client";
import Link from "next/link";
import FooterSection from "./Footer";
import SellerNavbarComp from "./SellerNavbar";

const MainContent = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="bg-gradient-to-r from-cyan-200 to-blue-100 shadow-lg rounded-lg p-12 w-full max-w-4xl mx-auto flex flex-col justify-center items-center h-[400px] md:h-[500px]">
        <h2 className="mb-8 text-3xl font-semibold text-gray-800">
          Add Your Property
        </h2>
        <div className="flex justify-center w-full">
          <Link
            href={"/dashboard/add-property"}
            className="bg-green-500 text-white text-lg px-6 py-3 rounded-lg shadow-lg hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-300 transition-transform transform hover:scale-105"
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
