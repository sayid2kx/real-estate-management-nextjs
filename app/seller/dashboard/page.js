import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import LogoutButton from "@/app/components/LogoutButton";

export default async function SellerDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/seller/login");

  return (
    <div>
      <p>Hello Seller Dashboard</p>
      <LogoutButton />
    </div>
  );
}
