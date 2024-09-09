import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import FooterSection from "@/app/components/Footer";
import AddNewProperty from "@/app/components/SellerPropertyInputFrom";
import SellerNavbarComp from "@/app/components/SellerNavbar";

export default async function AddPropertyPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/seller/login");
  }

  return (
    <div className="min-h-screen bg-cyan-100">
      <SellerNavbarComp />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl text-gray-600 font-bold mb-6 mt-20 text-center">
          Add New Property
        </h1>
        <AddNewProperty />
      </div>
      <FooterSection />
    </div>
  );
}
