import { prisma } from "@/server/db";

export async function getLeafletStats() {
  const now = new Date();

  // Начало дня и начала месяца
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // --- Заказы за месяц ---
  const monthOrders = await prisma.leafletOrder.findMany({
    where: {
      state: "DONE",
      doneAt: {
        gte: startOfMonth,
        lt: startOfNextMonth,
      },
    },
    include: { distributor: true },
  });

  // --- Заказы за сегодня ---
  const todayOrders = monthOrders.filter(o => o.doneAt >= startOfDay);

  // --- Подсчёты ---
  const sumOrders = (orders: typeof monthOrders) => {
    const given = orders.reduce((sum, o) => sum + (o.given || 0), 0);
    const returned = orders.reduce((sum, o) => sum + (o.returned || 0), 0);
    const delivered = Math.max(given - returned, 0);
    const total = orders.reduce((sum, o) => sum + (o.quantity || 0), 0);
    const promoters = new Set(orders.map(o => o.distributorId)).size;
    const notReturned = given - delivered;
    return { given, delivered, total, returned, promoters, notReturned };
  };

  const todayStats = sumOrders(todayOrders);
  const monthStats = sumOrders(monthOrders);
  const totalStats = await prisma.leafletOrder.aggregate({
    _sum: { quantity: true },
  });

  return {
    date: now.toLocaleDateString("ru-RU"),
    // Сегодня
    today: {
      promoters: todayStats.promoters,
      flyersIssued: todayStats.given,
      flyersDelivered: todayStats.delivered,
    },
    // За месяц
    month: {
      promoters: monthStats.promoters,
      flyersIssued: monthStats.given,
      flyersDelivered: monthStats.delivered,
      flyersReturned: monthStats.returned,
      flyersNotReturned: monthStats.notReturned,
      ordersCount: monthOrders.length,
    },
    // Всего
    totalFlyers: totalStats._sum.quantity || 0,
  };
}
