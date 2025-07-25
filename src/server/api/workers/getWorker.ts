import { prisma } from "@/server/db";

export async function getWorkerById(id: number) {
  return prisma.worker.findUnique({
    where: { id },
  });
}
