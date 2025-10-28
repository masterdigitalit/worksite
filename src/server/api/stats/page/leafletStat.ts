import { prisma } from "@/server/db";

export async function getLeafletOrderStats() {
  const statuses = ["IN_PROCESS", "FORPAYMENT", "DONE", "CANCELLED", "DECLINED"] as const;

  // Подсчёт количества заказов по каждому статусу
  const counts = await Promise.all(
    statuses.map((state) =>
      prisma.leafletOrder.count({ where: { state } })
    )
  );

const leafletOrdersForpay = await prisma.leafletOrder.findMany({
  where: { state: "FORPAYMENT" },
  select: { distributorProfit: true },
});

const totalDistributorProfitTOpay = leafletOrdersForpay.reduce((sum, order) => {
  const value = parseFloat(order.distributorProfit || "0");
  return sum + (isNaN(value) ? 0 : value);
}, 0);




const leafletOrdersPaid = await prisma.leafletOrder.findMany({
  where: { state: "DONE" },
  select: { distributorProfit: true },
});

const totalDistributorProfitPaid = leafletOrdersPaid.reduce((sum, order) => {
  const value = parseFloat(order.distributorProfit || "0");
  return sum + (isNaN(value) ? 0 : value);
}, 0);

  // Формируем итоговый объект
  const result: Record<(typeof statuses)[number], number> & {
    totalDistributorProfitTOpay: number, totalDistributorProfitPaid: number
  } = {
    IN_PROCESS: 0,
    FORPAYMENT: 0,
    DONE: 0,
    CANCELLED: 0,
    DECLINED: 0,
    totalDistributorProfitTOpay: 0,
		totalDistributorProfitPaid:0,

  };

  statuses.forEach((status, i) => {
    result[status] = counts[i];
  });

  result.totalDistributorProfitTOpay = totalDistributorProfitTOpay || 0;
	result.totalDistributorProfitPaid = totalDistributorProfitPaid || 0;



  return result;
}
