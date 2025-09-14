import { prisma } from "@/server/db";
import { Create } from "../logs/create";

interface doneOrder {
  orderId: number;
  received: number;
  outlay: number;
  masterId: number;
  receivedworker: number;
  whoDid: string;
}

export async function setPendingToOnTheWay(orderId: number, masterId: number, whoDid: string) {
  await Create({
    whoDid,
    whatHappend: `Заказ #${orderId} назначен мастеру #${masterId}, статус изменён на ON_THE_WAY`,
    type: "orders",
  });

  return prisma.order.update({
    where: { id: orderId },
    data: {
      status: "ON_THE_WAY",
      masterId,
    },
    include:{city:true, leaflet:true}
  });
}

export async function setOnTheWayToInProgress(orderId: number, whoDid: string) {
  await Create({
    whoDid,
    whatHappend: `Заказ #${orderId} изменён со статуса ON_THE_WAY на IN_PROGRESS`,
    type: "orders",
  });

  return prisma.order.update({
    where: { id: orderId },
    data: {
      status: "IN_PROGRESS",
      dateStarted: new Date(),
    },
        include:{city:true, leaflet:true}
  });
}

export async function setProgressSD(orderId: number, whoDid: string) {
  await Create({
    whoDid,
    whatHappend: `Заказ #${orderId} изменён на IN_PROGRESS_SD`,
    type: "orders",
  });

  return prisma.order.update({
    where: { id: orderId },
    data: {
      status: "IN_PROGRESS_SD",
      dateStarted: new Date(),
    },
        include:{city:true, leaflet:true}
  });
}

export async function completeOrder({
  orderId,
  received,
  outlay,
  masterId,
  receivedworker,
  whoDid,
}: doneOrder) {
  await Create({
    whoDid,
    whatHappend: `Закрыт заказ #${orderId} | получено: ${received}, затраты: ${outlay}, работнику: ${receivedworker}`,
    type: "orders",
  });

  // Обновляем заказ
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "DONE",
      received,
      outlay,
      receivedworker,
      dateDone: new Date(),
      masterId,
    },
        include:{city:true, leaflet:true}
  });

  // Обновляем мастера
  await prisma.worker.update({
    where: { id: masterId },
    data: {
      ordersCompleted: {
        increment: 1,
      },
      totalEarned: {
        increment: receivedworker,
      },
    },
        include:{city:true, leaflet:true}
    
  });

  return updatedOrder;
}

export async function declineOrder(orderId: number, whoDid: string) {
  await Create({
    whoDid,
    whatHappend: `Заказ #${orderId} отклонён (DECLINED)`,
    type: "orders",
  });

  return prisma.order.update({
    where: { id: orderId },
    data: {
      status: "DECLINED",
      dateStarted: new Date(),
    },
        include:{city:true, leaflet:true}
  });
}
