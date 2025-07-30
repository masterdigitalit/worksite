import { prisma } from "@/server/db";
import { startOfMonth, endOfMonth } from "date-fns";

export async function getMonthlyStatistics() {
  const result: any[] = [];
  const currentYear = new Date().getFullYear();

  for (let month = 0; month < 12; month++) {
    const from = startOfMonth(new Date(currentYear, month));
    const to = endOfMonth(from);

    const orders = await prisma.order.findMany({
      where: {
        arriveDate: {
          gte: from,
          lte: to,
        },
        status: "DONE",
      },
      select: {
        received: true,
        outlay: true,
        receivedworker: true,
        wastimechanged: true,
      },
    });

    const received = orders.reduce((sum, o) => sum + (o.received ?? 0), 0);
    const outlay = orders.reduce((sum, o) => sum + (o.outlay ?? 0), 0);
    const receivedworker = orders.reduce((sum, o) => sum + (o.receivedworker ?? 0), 0);
    const profit = received - outlay - receivedworker;
    const count = orders.length;
    const wastimechanged = orders.reduce((sum, o) => sum + (o.wastimechanged !== 0 ? 1 : 0), 0);

    if (count === 0) continue;

    result.push({
      month: from.toLocaleString("ru-RU", { month: "long" }).replace(/^./, (c) => c.toUpperCase()),
      profit,
      received,
      outlay,
      receivedworker,
      wastimechanged,
      count,
    });
  }

  // 👇 агрегируем по paymentType
  const paymentTypeSummary = await prisma.order.groupBy({
    by: ["paymentType"],
    _count: { paymentType: true },
    where: {
      status: "DONE",
      paymentType: { in: ["HIGH", "MEDIUM", "LOW"] },
    },
  });
	const visitTypeSummary = await prisma.order.groupBy({
    by: ["visitType"],
    _count: { visitType: true },
    where: {
      status: "DONE",
      visitType: { in: ["FIRST", "GARAGE","REPEAT" ] },
    },
  });

  return {
    monthlyStats: result,
    paymentTypesSummary: paymentTypeSummary.map((p) => ({
      type: p.paymentType,
      count: p._count.paymentType,
    })),
		visitTypeSummary:visitTypeSummary.map((p) => ({
      type: p.visitType,
      count: p._count.visitType,
    })),
  };
}
