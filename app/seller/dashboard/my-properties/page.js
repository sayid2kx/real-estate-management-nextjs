import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import FooterSection from "@/app/components/Footer";
import SellerNavbarComp from "@/app/components/SellerNavbar";
import SellerPropertyShow from "@/app/components/SellerPropertyShow";

export default async function PropertyShowPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/seller/login");
  }

  return (
    <div className="min-h-screen bg-cyan-100 flex flex-col">
      <SellerNavbarComp />
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-4xl mt-20">
          <h1 className="text-5xl font-bold text-gray-600 text-center mb-12">
            My Properties
          </h1>
          <SellerPropertyShow />
        </div>
      </div>
      <div className="h-20">
        <FooterSection />
      </div>
    </div>
  );
}
