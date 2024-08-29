import RegisterForm from "@/app/components/RegisterFormPage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function BuyerRegisterPage() {
  const session = await getServerSession(authOptions);

  if (session) redirect("/buyer/dashboard");
  return <RegisterForm role="buyer" />;
}
