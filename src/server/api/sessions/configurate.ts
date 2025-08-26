import { prisma } from "@/server/db";

export async function getUserSessions(userId: string) {
  return prisma.session.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function disableSession(token: string) {
  return prisma.session.updateMany({
    where: { token },
    data: { valid: false },
  });
}
