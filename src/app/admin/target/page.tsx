import { getServerSession } from "next-auth";
import { authOptions } from "@/server/api/auth/auth";
import { redirect } from "next/navigation";
import TargetForm from "./components/form";

export default async function Target() {
  const session = await getServerSession(authOptions);

  if (session?.user?.visibility !== "FULL") {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <TargetForm />
    </div>
  );
}
