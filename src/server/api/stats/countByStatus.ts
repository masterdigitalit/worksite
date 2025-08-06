import { prisma } from "@/server/db";

export async function getStatusCounts() {
  const allTimeStatuses = [
    "PENDING",
    "ON_THE_WAY",
    "IN_PROGRESS",
    "IN_PROGRESS_SD",
  ] as const;

  const monthlyStatuses = [
    "DECLINED",
    "CANCEL_CC",
    "CANCEL_BRANCH",
    "DONE",
  ] as const;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // За всё время
  const allTimeCounts = await Promise.all(
    allTimeStatuses.map((status) =>
      prisma.order.count({ where: { status } })
    )
  );

  // За текущий месяц
  const monthlyCounts = await Promise.all(
    monthlyStatuses.map((status) =>
      prisma.order.count({
        where: {
          status,
          dateCreated: {
            gte: startOfMonth,
          },
        },
      })
    )
  );

  const result: Record<
    typeof allTimeStatuses[number] | typeof monthlyStatuses[number],
    number
  > = {} as any;

  allTimeStatuses.forEach((status, index) => {
    result[status] = allTimeCounts[index];
  });

  monthlyStatuses.forEach((status, index) => {
    result[status] = monthlyCounts[index];
  });

  return result;
}
