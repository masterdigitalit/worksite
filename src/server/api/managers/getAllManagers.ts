import { prisma } from "@/server/db";

export async function getAllManagers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc", role:"manager" },
  });
}