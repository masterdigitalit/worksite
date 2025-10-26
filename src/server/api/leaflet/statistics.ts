import { prisma } from "@/server/db";

export async function getLeafletStats() {
  const now = new Date();

  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // --- Заказы за месяц из leafletOrder ---
  const monthLeafletOrders = await prisma.leafletOrder.findMany({
    where: { state: "DONE", doneAt: { gte: startOfMonth, lt: startOfNextMonth } },
    include: { distributor: true },
  });

  // --- Заказы за сегодня ---
  const todayLeafletOrders = monthLeafletOrders.filter(o => o.doneAt >= startOfDay);

  // --- Кол-во заказов (Order) за месяц ---
  const monthOrdersCount = await prisma.order.count({
    where: { arriveDate: { gte: startOfMonth, lt: startOfNextMonth } },
  });

  // --- Сумма всех листовок из таблицы Leaflet ---
  const totalLeaflets = await prisma.leaflet.aggregate({
    _sum: { value: true },
  });

  const sumOrders = (orders: typeof monthLeafletOrders) => {
    const given = orders.reduce((sum, o) => sum + (o.given || 0), 0);
    const returned = orders.reduce((sum, o) => sum + (o.returned || 0), 0);
    const delivered = Math.max(given - returned, 0);
    const promoters = new Set(orders.map(o => o.distributorId)).size;

    return { given, delivered, returned, promoters };
  };

  const todayStats = sumOrders(todayLeafletOrders);
  const monthStats = sumOrders(monthLeafletOrders);

  return {
    date: now.toLocaleDateString("ru-RU"),
    today: {
      promoters: todayStats.promoters,
      flyersIssued: todayStats.given,
      flyersDelivered: todayStats.delivered,
    },
    month: {
      promoters: monthStats.promoters,
      flyersIssued: monthStats.given,
      flyersDelivered: monthStats.delivered,
      flyersReturned: monthStats.returned,
      ordersCount: monthOrdersCount,
      flyersPerOrder: monthOrdersCount ? Math.floor(monthStats.delivered / monthOrdersCount) : 0,
      totalFlyers: totalLeaflets._sum.value || 0,
    },
  };
}
