import { prisma } from "@/server/db";
import { startOfMonth, endOfMonth } from "date-fns";

export async function getMonthStats() {
  const start = startOfMonth(new Date());
  const end = endOfMonth(new Date());

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
      dateDone: {
        gte: start,
        lte: end,
      },
    },
  });

  const totalReceived = data._sum.received || 0;
  const totalOutlay = data._sum.outlay || 0;
  const totalWorker = data._sum.receivedworker || 0;

  return {
    count: data._count.id,
    received: totalReceived,
    outlay: totalOutlay,
    receivedworker: totalWorker,
    profit: totalReceived - totalOutlay - totalWorker,
  };
}
