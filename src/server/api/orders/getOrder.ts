import { prisma } from "@/server/db";

export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id: Number(id) },
    include: { documents: true, city: true }, 
      // или просто id, если у тебя id — строка
  });
}