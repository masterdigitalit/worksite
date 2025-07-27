import { NextRequest, NextResponse } from "next/server";
import {
  setPendingToOnTheWay,
  setOnTheWayToInProgress,
  completeOrder,
  declineOrder, 
  // Добавим функцию для отмены
} from "@/server/api/orders/UpdateOrderStatus";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = parseInt(params.id);
    if (!orderId) {
      return new Response("orderId обязателен", { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return new Response("status обязателен", { status: 400 });
    }

    switch (status) {
      case "ON_THE_WAY": {
        const { masterId } = body;
        if (!masterId) {
          return new Response("masterId обязателен", { status: 400 });
        }
        const updated = await setPendingToOnTheWay(orderId, masterId);
        return NextResponse.json(updated);
      }
      case "IN_PROGRESS": {
        const updated = await setOnTheWayToInProgress(orderId);
        return NextResponse.json(updated);
      }
      case "DONE": {
        const { received, outlay, masterId, receivedworker } = body;
        if (received === undefined || outlay === undefined || !masterId || !receivedworker) {
          return new Response("received, outlay и masterId обязательны", {
            status: 400,
          });
        }
        const updatedOrder = await completeOrder(orderId, received, outlay, masterId, receivedworker);
        return NextResponse.json(updatedOrder);
      }
      case "DECLINED": {
        // Вызов функции для отмены заказа
        const updatedOrder = await declineOrder(orderId);
        return NextResponse.json(updatedOrder);
      }
      default:
        return new Response(`Обработка статуса ${status} не реализована`, {
          status: 400,
        });
    }
  } catch (error) {
    console.error("Ошибка при обновлении заказа:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
