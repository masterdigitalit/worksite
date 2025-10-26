import { prisma } from "@/server/db";
import { Create } from "../logs/create";

interface CompleteLeafletOrderInput {
  id: number;
  state: string;

  distributed?: number;
  returned?: number;
  whoDid: string;
}

export async function completeLeafletOrder({
  id,
  state,
  distributed,
  returned,
  whoDid,
}: CompleteLeafletOrderInput) {
  console.log(
    id,
  state,
  distributed,
  returned,)
  const order = await prisma.leafletOrder.findUnique({
    where: { id },
    include: { leaflet: true },
  });

  if (!order) throw new Error("Заказ не найден");

  // Определяем коэффициент прибыли
  let multiplier = 1;
  if (order.profitType === "MKD") multiplier = 0.5;
  else if (order.profitType === "CHS") multiplier = 1.5;

  const doneAt = new Date();
    // --- Успешное выполнение (раздали всё) ---
  if (state ==="success" ) {
    await Create({
      whoDid,
      whatHappend: `Закрыт заказ ${id}: все ${order.quantity} разданы`,
      type: "advertising",
    });

    return prisma.leafletOrder.update({
      where: { id },
      data: {
        state: "FORPAYMENT",
        distributorProfit: (multiplier * order.quantity).toString(),
        given: order.quantity,
        returned: 0,
        doneAt,
      },
      include: { distributor: true, leaflet: true, city: true },
    });
  }

    // --- Полный возврат ---
if (state === 'cancelled') {
    await prisma.leaflet.update({
      where: { id: order.leaflet.id },
      data: { value: order.leaflet.value + order.quantity },
    });

    await Create({
      whoDid,
      whatHappend: `Отменён заказ ${id}: вернули все ${order.quantity}`,
      type: "advertising",
    });

    return prisma.leafletOrder.update({
      where: { id },
      data: {
        state: "CANCELLED",
        given: 0,
        returned: order.quantity,
        doneAt,
      },
      include: { distributor: true, leaflet: true, city: true },
    });
  }

  
  // --- Частичное выполнение ---
  if (typeof distributed === "number" && typeof returned === "number" && distributed > 0 && returned > 0) {
    // Вернули часть
    if (returned > 0 && order.leaflet) {
      await prisma.leaflet.update({
        where: { id: order.leaflet.id },
        data: { value: order.leaflet.value + returned },
      });
    }

    await Create({
      whoDid,
      whatHappend: `Частично закрыт заказ ${id}: раздали ${distributed}, вернули ${returned}`,
      type: "advertising",
    });

    return prisma.leafletOrder.update({
      where: { id },
      data: {
        state: "FORPAYMENT",
        given: distributed,
        returned,
        distributorProfit: (multiplier * distributed).toString(),
        doneAt,
      },
      include: { distributor: true, leaflet: true, city: true },
    });
  }





  // --- Провал (не раздали и не вернули) ---
  await Create({
    whoDid,
    whatHappend: `Провален заказ ${id}: не раздали и не вернули`,
    type: "advertising",
  });

  return prisma.leafletOrder.update({
    where: { id },
    data: {
      state: "DECLINED",
      given: 0,
      returned: 0,
      doneAt,
    },
    include: { distributor: true, leaflet: true, city: true },
  });
}
