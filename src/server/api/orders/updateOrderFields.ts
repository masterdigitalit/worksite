import { prisma } from "@/server/db";
import { Create } from "../logs/create";

export async function updateOrderFields(orderId: number, fields: any, whoDid: string) {
 

  // Получаем старый заказ
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

  const newMasterId = fields.masterId ?? oldMasterId;
  const newStatus = fields.status ?? oldStatus;
  const newReceivedWorker =
    typeof fields.receivedworker === "number" ? fields.receivedworker : oldReceivedWorker;

  const oldDateStr = oldDateArrive instanceof Date ? oldDateArrive.toISOString() : oldDateArrive;
  const newDateStr =
    fields.arriveDate instanceof Date ? fields.arriveDate.toISOString() : fields.arriveDate;

  const dateArriveChanged = newDateStr !== undefined && newDateStr !== oldDateStr;

  // Формируем объект для обновления
  const dataToUpdate: any = {
    ...fields,
  };

  // Обработка city (как при создании заказа)
  if (fields.city) {
    dataToUpdate.city = {
      connect: {
        id: parseInt(fields.city),
      },
    };
  }

  if (dateArriveChanged) {
    dataToUpdate.wastimechanged = oldWastimechanged + 1;
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: dataToUpdate,
  });

  // --- логирование изменений ---
  const changes: string[] = [];
  if (oldMasterId !== newMasterId) {
    changes.push(`мастер: ${oldMasterId ?? "—"} → ${newMasterId ?? "—"}`);
  }
  if (oldStatus !== newStatus) {
    changes.push(`статус: ${oldStatus} → ${newStatus}`);
  }
  if (oldReceivedWorker !== newReceivedWorker) {
    changes.push(`получил работник: ${oldReceivedWorker} → ${newReceivedWorker}`);
  }
  if (dateArriveChanged) {
    changes.push(`дата приезда изменена: ${oldDateStr} → ${newDateStr}`);
  }

  if (changes.length > 0) {
    await Create({
      whoDid,
      whatHappend: `Обновлён заказ #${orderId}: ${changes.join(", ")}`,
      type: "orders",
    });
  }

  // Логика изменения мастера
  if (oldMasterId !== newMasterId) {
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
    if (newReceivedWorker !== oldReceivedWorker && oldMasterId) {
      const diff = newReceivedWorker - oldReceivedWorker;
      if (diff !== 0) {
        await prisma.worker.update({
          where: { id: oldMasterId },
          data: { totalEarned: { increment: diff } },
        });
      }
    }

    if (oldMasterId && oldStatus === "DONE" && newStatus !== "DONE") {
      await prisma.worker.update({
        where: { id: oldMasterId },
        data: { ordersCompleted: { decrement: 1 } },
      });
    }

    if (oldMasterId && oldStatus !== "DONE" && newStatus === "DONE") {
      await prisma.worker.update({
        where: { id: oldMasterId },
        data: { ordersCompleted: { increment: 1 } },
      });
    }
  }

  return updatedOrder;
}
