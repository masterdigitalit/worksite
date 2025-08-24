import { prisma } from "@/server/db";
import { Create } from "../logs/create";



interface doneOrder {
  orderId: number,
  received: number,
  outlay: number,
  masterId: number,
  receivedworker: number,
  whoDid:string
}

export async function setPendingToOnTheWay(orderId: number, masterId: number) {
  return prisma.order.update({
    where: { id: orderId },
    data: {
      status: "ON_THE_WAY",
      masterId,
    },
  });
}

export async function setOnTheWayToInProgress(orderId: number) {
  return prisma.order.update({
    where: { id: orderId },
    data: {
      status: "IN_PROGRESS",
      dateStarted: new Date(),
    },
  });
}
export async function setProgressSD(orderId: number) {
  return prisma.order.update({
    where: { id: orderId },
    data: {
      status: "IN_PROGRESS_SD",
      dateStarted: new Date(),
    },
  });
}
export async function completeOrder({
  orderId,
  received ,
  outlay ,
  masterId,
  receivedworker ,
  whoDid
}:doneOrder) {
  
    await Create({
      whoDid,
      whatHappend: `Закрыт заказ #${orderId} получено: ${received} затраты :${outlay} получил работник :${receivedworker}` ,
      type: "advertising",
    });
    
  // Обновляем заказ: ставим статус, даты и финансовые поля
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "DONE",
      received,
      outlay,
      receivedworker,
      dateDone: new Date(),
      masterId: masterId,
    },
  });
  console.log(orderId, masterId, received, outlay)

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
  });

  return updatedOrder;
}



export async function declineOrder(orderId: number) {
  return prisma.order.update({
    where: { id: orderId },
    data: {
      status: "DECLINED",
      dateStarted: new Date(),
    },
  });
}