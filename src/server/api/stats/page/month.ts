import { prisma } from "@/server/db";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  startOfDay,
  endOfDay,
} from "date-fns";

type Options = {
  year?: number;
  month?: number; // 0-11
};

export async function getMonthlyStatistics({ year, month }: Options) {
  const result: any[] = [];
  const currentYear = year || new Date().getFullYear();

  const paymentTypeSummary = await prisma.order.groupBy({
    by: ["paymentType"],
    _count: { paymentType: true },
    where: {
      status: "DONE",
      ...(typeof month === "number"
        ? {
            dateDone: {
              gte: startOfMonth(new Date(currentYear, month)),
              lte: endOfMonth(new Date(currentYear, month)),
            },
          }
        : {
            dateDone: {
              gte: new Date(currentYear, 0, 1),
              lte: new Date(currentYear, 11, 31, 23, 59, 59),
            },
          }),
    },
  });

  const visitTypeSummary = await prisma.order.groupBy({
    by: ["visitType"],
    _count: { visitType: true },
    where: {
      status: "DONE",
      ...(typeof month === "number"
        ? {
            dateDone: {
              gte: startOfMonth(new Date(currentYear, month)),
              lte: endOfMonth(new Date(currentYear, month)),
            },
          }
        : {
            dateDone: {
              gte: new Date(currentYear, 0, 1),
              lte: new Date(currentYear, 11, 31, 23, 59, 59),
            },
          }),
    },
  });

  // === 👉 Если указан конкретный месяц — возвращаем статистику по дням
  if (typeof month === "number") {
    const from = startOfMonth(new Date(currentYear, month));
    const to = endOfMonth(from);

    const days = eachDayOfInterval({ start: from, end: to });

    for (const day of days) {
      const orders = await prisma.order.findMany({
        where: {
          dateDone: {
            gte: startOfDay(day),
            lte: endOfDay(day),
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

      if (orders.length === 0) continue;

      const received = orders.reduce((sum, o) => sum + (o.received ?? 0), 0);
      const outlay = orders.reduce((sum, o) => sum + (o.outlay ?? 0), 0);
      const receivedworker = orders.reduce((sum, o) => sum + (o.receivedworker ?? 0), 0);
      const profit = received - outlay - receivedworker;
      const count = orders.length;
      const wastimechanged = orders.reduce(
        (sum, o) => sum + (o.wastimechanged !== 0 ? 1 : 0),
        0,
      );

      result.push({
        month: format(day, "d MMM", { locale: undefined }), // e.g., "5 авг"
        profit,
        received,
        outlay,
        receivedworker,
        wastimechanged,
        count,
      });
    }
  } else {
    // === 👉 Иначе — статистика по месяцам
    for (let m = 0; m < 12; m++) {
      const from = startOfMonth(new Date(currentYear, m));
      const to = endOfMonth(from);

      const orders = await prisma.order.findMany({
        where: {
          dateDone: {
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

      const count = orders.length;
      if (count === 0) continue;

      const received = orders.reduce((sum, o) => sum + (o.received ?? 0), 0);
      const outlay = orders.reduce((sum, o) => sum + (o.outlay ?? 0), 0);
      const receivedworker = orders.reduce((sum, o) => sum + (o.receivedworker ?? 0), 0);
      const profit = received - outlay - receivedworker;
      const wastimechanged = orders.reduce(
        (sum, o) => sum + (o.wastimechanged !== 0 ? 1 : 0),
        0,
      );

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
  }

  return {
    monthlyStats: result,
    paymentTypesSummary: paymentTypeSummary.map((p) => ({
      type: p.paymentType,
      count: p._count.paymentType,
    })),
    visitTypeSummary: visitTypeSummary.map((p) => ({
      type: p.visitType,
      count: p._count.visitType,
    })),
  };
}
