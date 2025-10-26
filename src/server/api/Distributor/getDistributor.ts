import { prisma } from "@/server/db";

export async function getDistributorById(id: number) {
  const distributor = await prisma.distributor.findUnique({
    where: { id },
    include: {
      documents: true,
      leafletOrders: {include:{
        city: true,
        distributor: true,
        leaflet:true,
      }},

    },
  });

  if (!distributor) {
    throw new Error("Разносчик не найден");
  }

  // === фильтруем только актуальные заказы ===
  const leafletOrders = (distributor.leafletOrders ?? []).filter(
    (order) => order.state?.toLowerCase() !== "cancelled"
  );

  // === вычисляем агрегаты ===
  const totals = leafletOrders.reduce(
    (acc, order) => {
      const profit = parseFloat(order.distributorProfit || "0");
      const given = order.given || 0;
      const returned = order.returned || 0;
      const stolen = Math.max((order.quantity || 0) - given - returned, 0);

      acc.totalProfit += profit;
      acc.totalGiven += given;
      acc.totalReturned += returned;
      acc.totalStolen += stolen;

      return acc;
    },
    {
      totalProfit: 0,
      totalGiven: 0,
      totalReturned: 0,
      totalStolen: 0,
    }
  );

  const denominator = totals.totalGiven + totals.totalReturned + totals.totalStolen;
  const deliveryPercent = denominator > 0 ? (totals.totalGiven / denominator) * 100 : 0;

  return {
    ...distributor,
    stats: {
      totalProfit: parseFloat(totals.totalProfit.toFixed(2)),
      totalGiven: totals.totalGiven,
      totalReturned: totals.totalReturned,
      totalStolen: totals.totalStolen,
      deliveryPercent: parseFloat(deliveryPercent.toFixed(1)),
    },
  };
}
