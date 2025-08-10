// /server/api/leafletOrders/getOne.ts
import { prisma } from "@/server/db";

export async function getLeafletOrderById(id: number) {
  return prisma.leafletOrder.findUnique({
    where: { id: parseInt(id) },
    include: {
      leaflet: true,
      city: true,
      distributor: true,
    },
  });
}
