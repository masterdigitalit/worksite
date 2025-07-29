import { prisma } from "@/server/db";

export async function getProfitStats() {
  const data = await prisma.order.aggregate({
    _sum: {
      received: true,
      outlay: true,
      receivedworker: true,
    },
      _count: {
      id: true,
    },
    where: {
      status: "DONE",
    },
  });

  const received = data._sum.received || 0;
  const outlay = data._sum.outlay || 0;
  const receivedworker = data._sum.receivedworker || 0;

  return {
    count: data._count.id,
    received,
    outlay,
    receivedworker,
    totalProfit: received - outlay - receivedworker,
  };
}
