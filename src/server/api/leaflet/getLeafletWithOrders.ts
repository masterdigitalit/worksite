import { prisma } from "@/server/db";

export async function getLeafletWithOrders() {
  return prisma.leaflet.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: { orders: true },
        
      },
      value :true,
    },
    orderBy: {
      orders: {
        _count: "desc",
      },
    },
  });
}
