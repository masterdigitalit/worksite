import { prisma } from "@/server/db";
import { Create } from "../logs/create";
interface CompleteLeafletOrderInput {
  id: number;
  success: boolean;
  returnedLeaflets?: boolean;
  distributed?: number;
  returned?: number;
  whoDid : string
}

export async function completeLeafletOrder({
  id,
  success,
  returnedLeaflets,
  distributed,
  returned,
  whoDid
}: CompleteLeafletOrderInput) {
    console.log(whoDid)
  
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
  if (returned > 0 && order.leaflet) {
    await prisma.leaflet.update({
      where: { id: order.leaflet.id },
      data: {
        value: order.leaflet.value + returned,
      },
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
      state: "DONE", // или PARTIAL, если хочешь различать
      given: distributed,
      returned,
      distributorProfit: (multiplier * distributed).toString(),
      doneAt,
    },
  });
}

// ✅ Успешное выполнение (раздали всё)
if (success) {
  await Create({
    whoDid,
    whatHappend: `Закрыт заказ ${id}: все ${order.quantity} разданы`,
    type: "advertising",
  });

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

// ❌ Полный провал (всё вернули)
if (returnedLeaflets && order.leaflet) {
  await prisma.leaflet.update({
    where: { id: order.leaflet.id },
    data: {
      value: order.leaflet.value + order.quantity,
    },
  });

  await Create({
    whoDid,
    whatHappend: `Отменён заказ ${id}: вернули все ${order.quantity}`,
    type: "advertising",
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

// ❌ Не вернули листовки (провал)
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
})}
