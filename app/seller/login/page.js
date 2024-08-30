import LoginForm from "@/app/components/LoginFormPage";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function SellerLoginPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/seller/dashboard");
  return <LoginForm userType="seller" />;
}
