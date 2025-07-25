"use client";

import Link from "next/link";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow p-4 flex gap-4">
        <Link href="/" className="font-semibold hover:text-blue-600">🏠 Дашборд</Link>
        <Link href="/orders" className="hover:text-blue-600">📦 Заказы</Link>
      </header>
      <main className="p-4 max-w-4xl mx-auto">{children}</main>
    </div>
  );
}
