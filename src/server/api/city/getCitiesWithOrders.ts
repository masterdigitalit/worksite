import { prisma } from "@/server/db";

export async function getCitiesWithOrders() {
  return prisma.city.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: { orders: true },
      },
    },
    orderBy: {
      orders: {
        _count: "desc",
      },
    },
  });
}
