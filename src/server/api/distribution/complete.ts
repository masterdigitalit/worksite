import { prisma } from "@/server/db";

interface CompleteLeafletOrderInput {
  id: number;
  success: boolean;
  returnedLeaflets?: boolean;
}

export async function completeLeafletOrder({
  id,
  success,
  returnedLeaflets,
}: CompleteLeafletOrderInput) {
  const order = await prisma.leafletOrder.findUnique({
    where: { id },
    include: { leaflet: true },
  });

  if (!order) {
    throw new Error("Заказ не найден");
  }

  // Определяем коэффициент прибыли в зависимости от profitType
  let multiplier = 1; // по умолчанию
  if (order.profitType === "MKD") multiplier = 0.5;
  else if (order.profitType === "CHS") multiplier = 1.5;

  if (success) {
    // ✅ Успешное выполнение
    return prisma.leafletOrder.update({
      where: { id },
      data: {
        state: "DONE",
        distributorProfit: multiplier * order.quantity,
      },
    });
  } else {
    // ❌ Неуспешное выполнение
    if (returnedLeaflets && order.leaflet) {
      await prisma.leaflet.update({
        where: { id: order.leaflet.id },
        data: {
          value: order.leaflet.value + order.quantity,
          wasBack: true
        },
      });
    }

    return prisma.leafletOrder.update({
      where: { id },
      data: {
        state: "DECLINED",
         wasBack: false
      },
    });
  }
}
