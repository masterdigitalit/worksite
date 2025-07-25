import { prisma } from "@/server/db";

export async function deleteWorker(id: number) {
  return prisma.worker.delete({
    where: { id },
  });
}
