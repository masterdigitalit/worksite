import { prisma } from "@/server/db";

export async function getAllOrders() {
  return prisma.order.findMany({
    orderBy: { arriveDate: "desc" },
     include: { city: true, leaflet:true },
  });
}
