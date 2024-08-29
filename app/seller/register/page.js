import RegisterForm from "@/app/components/RegisterFormPage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function SellerRegisterPage() {
  const session = await getServerSession(authOptions);

  if (session) redirect("/seller/dashboard");
  return <RegisterForm role="seller" />;
}
