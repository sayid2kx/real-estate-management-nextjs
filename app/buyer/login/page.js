import LoginForm from "@/app/components/LoginFormPage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function BuyerLoginPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/buyer/dashboard");
  return <LoginForm userType="buyer" />;
}
