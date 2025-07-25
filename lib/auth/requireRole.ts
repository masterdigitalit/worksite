// src/lib/auth/requireRole.ts

import { getServerSession } from "next-auth";
import { authOptions } from "@/server/api/auth/auth";
import { redirect } from "next/navigation";

export async function requireRole(role: "admin" | "manager") {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  if (session.user.role !== role) {
    redirect("/"); // можно заменить на другую страницу, например "/manager"
  }

  return session; // если всё ок — возвращаем сессию
}
