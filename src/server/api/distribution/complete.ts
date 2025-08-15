import { prisma } from "@/server/db";

interface CompleteLeafletOrderInput {
  id: number;
  success: boolean;
  returnedLeaflets?: boolean;
  distributed?: number;
  returned?: number;
}

export async function completeLeafletOrder({
  id,
  success,
  returnedLeaflets,
  distributed,
  returned,
}: CompleteLeafletOrderInput) {
  const order = await prisma.leafletOrder.findUnique({
    where: { id },
    include: { leaflet: true },
  });

  if (!order) {
    throw new Error("Заказ не найден");
  }

  // Определяем коэффициент прибыли
  let multiplier = 1;
  if (order.profitType === "MKD") multiplier = 0.5;
  else if (order.profitType === "CHS") multiplier = 1.5;

  const doneAt = new Date();

  // 📦 Частичное выполнение
  if (typeof distributed === "number" && typeof returned === "number") {
    // Если вернули что-то — кладём на склад
    if (returned > 0 && order.leaflet) {
      await prisma.leaflet.update({
        where: { id: order.leaflet.id },
        data: {
          value: order.leaflet.value + returned,
        },
      });
    }

    return prisma.leafletOrder.update({
      where: { id },
      data: {
        state: "DONE", // или PARTIAL
        given: distributed,
        returned,
        distributorProfit: (multiplier * distributed).toString(),
        doneAt,
      },
    });
  }

  // ✅ Успешное выполнение (не возвращаем листовки)
  if (success) {
    return prisma.leafletOrder.update({
      where: { id },
      data: {
        state: "DONE",
        distributorProfit: (multiplier * order.quantity).toString(),
        given: order.quantity,
        returned: 0,
        doneAt,
      },
    });
  }

  // ❌ Полный провал
  if (returnedLeaflets && order.leaflet) {
    // Вернули всё на склад
    await prisma.leaflet.update({
      where: { id: order.leaflet.id },
      data: {
        value: order.leaflet.value + order.quantity,
      },
    });

    return prisma.leafletOrder.update({
      where: { id },
      data: {
        state: "DONE",
        given: 0,
        returned: order.quantity,
        doneAt,
      },
    });
  }

  // ❌ Не вернули листовки
  return prisma.leafletOrder.update({
    where: { id },
    data: {
      state: "DECLINED",
      given: 0,
      returned: 0,
      doneAt,
    },
  });
}
