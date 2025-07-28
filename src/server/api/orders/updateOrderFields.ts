import { prisma } from "@/server/db";

export async function updateOrderFields(orderId: number, fields: any) {
  console.log("Обновление заказа:", orderId, fields);

  // Получаем старый заказ с нужными полями для расчёта и проверки статуса
  const oldOrder = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      receivedworker: true,
      masterId: true,
      status: true,
      arriveDate: true,
      wastimechanged: true,
    },
  });

  if (!oldOrder) {
    throw new Error("Заказ не найден");
  }

  const oldReceivedWorker = oldOrder.receivedworker ?? 0;
  const oldMasterId = oldOrder.masterId;
  const oldStatus = oldOrder.status;
  const oldDateArrive = oldOrder.arriveDate;
  const oldWastimechanged = oldOrder.wastimechanged ?? 0;

  // Новый мастерId и статус после обновления (если не переданы, берём старые)
  const newMasterId = fields.masterId ?? oldMasterId;
  const newStatus = fields.status ?? oldStatus;

  // Новый receivedworker (если не передан — старый)
  const newReceivedWorker = typeof fields.receivedworker === "number" ? fields.receivedworker : oldReceivedWorker;

  // Приводим даты к строкам для корректного сравнения
  const oldDateStr = oldDateArrive instanceof Date ? oldDateArrive.toISOString() : oldDateArrive;
  const newDateStr = fields.arriveDate instanceof Date ? fields.arriveDate.toISOString() : fields.arriveDate;

  // Проверяем, изменился ли arriveDate
  const dateArriveChanged = newDateStr !== undefined && newDateStr !== oldDateStr;

  // Подготовим данные для обновления заказа — если arriveDate изменился, увеличим wastimechanged
  const dataToUpdate = {
    ...fields,
  };

  if (dateArriveChanged) {
    dataToUpdate.wastimechanged = oldWastimechanged + 1;
  }

  // Обновляем заказ
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: dataToUpdate,
  });

  // Если мастер изменился — корректируем показатели у старого и нового мастера
  if (oldMasterId !== newMasterId) {
    // У старого мастера вычитаем прибыль и, если статус был DONE, уменьшаем выполненные заказы
    if (oldMasterId) {
      const dataToDecrement: any = {
        totalEarned: { decrement: oldReceivedWorker },
      };
      if (oldStatus === "DONE") {
        dataToDecrement.ordersCompleted = { decrement: 1 };
      }

      await prisma.worker.update({
        where: { id: oldMasterId },
        data: dataToDecrement,
      });
    }

    // У нового мастера добавляем прибыль и, если статус DONE, увеличиваем выполненные заказы
    if (newMasterId) {
      const dataToIncrement: any = {
        totalEarned: { increment: newReceivedWorker },
      };
      if (newStatus === "DONE") {
        dataToIncrement.ordersCompleted = { increment: 1 };
      }

      await prisma.worker.update({
        where: { id: newMasterId },
        data: dataToIncrement,
      });
    }
  } else {
    // Если мастер не изменился, проверяем изменения в receivedworker
    if (newReceivedWorker !== oldReceivedWorker && oldMasterId) {
      const diff = newReceivedWorker - oldReceivedWorker;
      if (diff !== 0) {
        await prisma.worker.update({
          where: { id: oldMasterId },
          data: {
            totalEarned: {
              increment: diff,
            },
          },
        });
      }
    }

    // Если статус изменился с DONE на другой, уменьшаем ordersCompleted у мастера
    if (oldMasterId && oldStatus === "DONE" && newStatus !== "DONE") {
      await prisma.worker.update({
        where: { id: oldMasterId },
        data: {
          ordersCompleted: {
            decrement: 1,
          },
        },
      });
    }

    // Если статус изменился с другого на DONE, увеличиваем ordersCompleted у мастера
    if (oldMasterId && oldStatus !== "DONE" && newStatus === "DONE") {
      await prisma.worker.update({
        where: { id: oldMasterId },
        data: {
          ordersCompleted: {
            increment: 1,
          },
        },
      });
    }
  }

  return updatedOrder;
}
