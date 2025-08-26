// src/server/api/session/check.ts
import { prisma } from "@/server/db";

export async function checkSession(token: string) {
  console.log(token)
  if (!token) return { valid: false };

  const session = await prisma.session.findUnique({
    where: { token },
  });
  console.log(session)

  if (!session) return { valid: false };
  if (!session.valid) return { valid: false };
  if (session.expiresAt < new Date()) return { valid: false };

  return {
    valid: true,
    userId: session.userId,
  };
}
