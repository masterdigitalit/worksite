import { prisma } from "@/server/db";

export async function updateManager(id: number, data: any) {
  return prisma.worker.update({
    where: { id },
    data,
  });
}
