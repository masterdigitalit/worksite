import { prisma } from "@/server/db";
import { tr } from "zod/v4/locales";

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
