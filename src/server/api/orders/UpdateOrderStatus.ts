import { prisma } from "@/server/db";

export async function setOrderWorker(orderId: number, status?: string, masterId?: string) {
  console.log(orderId, masterId, status)
  return prisma.order.update({
    where: { id : orderId },
    data: {
      ...(status && { status }),
      ...(masterId && { masterId }),
    },
  });
}
