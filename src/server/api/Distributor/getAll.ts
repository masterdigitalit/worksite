import { prisma } from "@/server/db";

export async function getAllDistributors() {
  return prisma.distributor.findMany({
    orderBy: { createdAt: "desc" },
    include: {documents:true}
  });
}
