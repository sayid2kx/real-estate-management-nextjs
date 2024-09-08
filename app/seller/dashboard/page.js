import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import SellerDashboardPage from "@/app/components/dashboard-seller";

export default async function SellerDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/seller/login");

  return (
    <div>
      <SellerDashboardPage />
    </div>
  );
}
