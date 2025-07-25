import { prisma } from "@/server/db";

export async function getWorkersToSet() {
return prisma.worker.findMany({
    select: {
      id: true,
      fullName: true,
    },
  });
}