import { prisma } from "@/server/db";

export async function getAllOrders() {
  return prisma.order.findMany({
    orderBy: { dateCreated: "desc" },
  });
}
