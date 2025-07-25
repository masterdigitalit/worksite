import { prisma } from "@/server/db";

export async function getStatusCounts() {
  const statuses = [
    "PENDING",
    "ON_THE_WAY",
    "IN_PROGRESS",
    "IN_PROGRESS_SD",
    "DECLINED",
    "CANCEL_CC",
    "CANCEL_BRANCH",
    "DONE",
  ] as const;

  const counts = await Promise.all(
    statuses.map((status) =>
      prisma.order.count({ where: { status } })
    )
  );

  const result: Record<typeof statuses[number], number> = statuses.reduce(
    (acc, status, index) => {
      acc[status] = counts[index];
      return acc;
    },
    {} as Record<typeof statuses[number], number>
  );

  return result;
}
