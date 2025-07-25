// src/app/admin/layout.tsx

import Link from "next/link";
import { requireRole } from "../../../lib/auth/requireRole";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/api/auth/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  await requireRole("admin");

  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <header className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow">
        {/* Left side: nav links */}
        <div className="flex gap-6 items-center text-sm">
          <Link href="/admin" className="hover:text-blue-300 transition">
            🏠 Главная
          </Link>
          <Link href="/admin/orders" className="hover:text-blue-300 transition">
            📦 Заказы
          </Link>
          <Link href="/admin/workers" className="hover:text-blue-300 transition">
            👥 Работники
          </Link>
          <Link href="/admin/stats" className="hover:text-blue-300 transition">
            📊 Статистика
          </Link>
          <Link href="/admin/finance" className="hover:text-blue-300 transition">
            💰 Финансы
          </Link>
        </div>

        {/* Right side: profile */}
        <form action="/api/auth/signout" method="POST" className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs uppercase">
              {session?.user?.fullName?.[0] ?? "?"}
            </div>
            <span className="text-sm">{session?.user?.fullName ?? "?"}</span>
          </div>
          <button
            type="submit"
            className="text-sm text-red-300 hover:text-red-500 transition"
          >
            ⬅ Выйти
          </button>
        </form>
      </header>

      {/* Main content */}
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  );
}
