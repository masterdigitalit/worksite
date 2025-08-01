import { prisma } from "@/server/db";

export async function getAvailablePeriods() {
  const rawDates = await prisma.order.findMany({
    where: {
      status: "DONE",
      dateDone: {
        not: null,
      },
    },
    select: {
      dateDone: true,
    },
  });

  const periods: Record<number, Set<number>> = {};

  rawDates.forEach(({ dateDone }) => {
    if (!dateDone) return;
    const year = dateDone.getFullYear();
    const month = dateDone.getMonth();

    if (!periods[year]) {
      periods[year] = new Set();
    }

    periods[year].add(month);
  });

  const result = Object.entries(periods)
    .map(([year, months]) => ({
      year: Number(year),
      months: Array.from(months).sort((a, b) => a - b),
    }))
    .sort((a, b) => b.year - a.year); // по убыванию года

  return result;
}
