import { prisma } from "@/server/db";

export async function updateWorker(id: number, data: any) {
  return prisma.worker.update({
    where: { id },
    data,
  });
}
