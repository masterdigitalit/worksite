import { NextRequest, NextResponse } from "next/server";
import {
  setPendingToOnTheWay,
  setOnTheWayToInProgress,
  completeOrder,
  declineOrder,
  setProgressSD,
} from "@/server/api/orders/UpdateOrderStatus";

import { getServerSession } from "next-auth";
import { authOptions } from "@/server/api/auth/auth";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  try {
    const { id } = await context.params;
    const orderId = parseInt(id);

    if (!orderId) {
      return new Response("orderId обязателен", { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return new Response("status обязателен", { status: 400 });
    }

    const whoDid = session?.user?.fullName || "Неизвестный";

    switch (status) {
      case "ON_THE_WAY": {
        const { masterId } = body;
        if (!masterId) {
          return new Response("masterId обязателен", { status: 400 });
        }
        const updated = await setPendingToOnTheWay(orderId, masterId, whoDid);
        return NextResponse.json(updated);
      }
      case "IN_PROGRESS": {
        const updated = await setOnTheWayToInProgress(orderId, whoDid);
        return NextResponse.json(updated);
      }
      case "IN_PROGRESS_SD": {
        const updated = await setProgressSD(orderId, whoDid);
        return NextResponse.json(updated);
      }
      case "DONE": {
        const { received, outlay, masterId, receivedworker } = body;
        if (
          received === undefined ||
          outlay === undefined ||
          masterId === undefined ||
          receivedworker === undefined
        ) {
          return new Response("received, outlay, masterId и receivedworker обязательны", {
            status: 400,
          });
        }

        const updatedOrder = await completeOrder({
          masterId,
          orderId,
          outlay,
          received,
          receivedworker,
          whoDid,
        });
        return NextResponse.json(updatedOrder);
      }
      case "DECLINED": {
        const updatedOrder = await declineOrder(orderId, whoDid);
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
