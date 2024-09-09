import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import FooterSection from "@/app/components/Footer";
import AllPropertiesShow from "@/app/components/AllProperties";
import SellerNavbarComp from "@/app/components/SellerNavbar";

export default async function AllPropertiesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/seller/login");
  }
  return (
    <div className="min-h-screen bg-cyan-100 flex flex-col">
      <SellerNavbarComp />
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-4xl mt-20">
          <h1 className="text-center text-5xl text-gray-600 font-bold mb-6">
            All Properties
          </h1>
          <AllPropertiesShow />
        </div>
      </div>
      <div className="h-20">
        <FooterSection />
      </div>
    </div>
  );
}
