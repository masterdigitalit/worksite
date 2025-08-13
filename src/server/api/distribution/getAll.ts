import { prisma } from "@/server/db";


export async function getAllLeafletOrders() {
  return prisma.leafletOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      leaflet: true,
      city: true,
      distributor:true,
    }
  });
}
