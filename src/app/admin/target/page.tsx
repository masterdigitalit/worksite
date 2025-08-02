import { getServerSession } from "next-auth";
import { authOptions } from "@/server/api/auth/auth";
import { redirect } from "next/navigation";

export default async function Target() {
  const session = await getServerSession(authOptions);

  // Если нет прав — редирект назад
  if (session?.user?.visibility !== "FULL") {
    redirect("/");
    // или redirect("/dashboard"), или redirect(request.headers.get("referer") ?? "/")
  }

  return (
    <div>
      {/* Контент только для FULL */}
      <h1>Добро пожаловать в закрытую зону</h1>
    </div>
  );
}
