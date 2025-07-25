import { prisma } from "@/server/db";

export async function getAllWorkers() {
  return prisma.worker.findMany({
    orderBy: { createdAt: "desc" },
  });
}