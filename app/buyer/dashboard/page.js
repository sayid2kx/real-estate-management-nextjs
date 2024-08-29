import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import LogoutButton from "@/app/components/LogoutButton";

export default async function BuyerDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "buyer") {
    redirect("/buyer/login");
  }

  return (
    <div>
      <p>Hello Buyer Dashboard</p>;
      <LogoutButton />
    </div>
  );
}
