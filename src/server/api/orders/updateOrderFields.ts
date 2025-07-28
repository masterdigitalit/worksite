import { prisma } from "@/server/db";

export async function updateOrderFields(orderId: number, fields: any) {
			console.log(orderId, fields)
  return prisma.order.update({
    where: { id: orderId },
    data: fields,
  });
}
