import { prisma } from "@/server/db";

export async function serverGetDistributorDocuments(distributorId: number) {
  return prisma.distributorDocument.findMany({
    where: { distributorId },
    orderBy: { id: "desc" },
  });
}
