import LayoutShell from "@/app/components/LayoutShell.tsx";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/api/auth/auth"; // путь может отличаться
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);
  console.log(session)

  if (session?.user.role === "admin") redirect("/admin");
  if (session?.user.role === "manager") redirect("/manager");
    if (session?.user.role === "advertising") redirect("/advertising");

  return (
    <LayoutShell>
    <div className="min-h-screen flex items-center justify-center">
      <a
        href="/login"
        className="bg-blue-600 text-white px-6 py-3 rounded text-xl"
      >
        Войти
      </a>
    </div>
    </LayoutShell>
  );
}
