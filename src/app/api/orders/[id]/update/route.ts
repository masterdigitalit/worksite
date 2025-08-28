import { NextRequest, NextResponse } from "next/server";
import { updateOrderFields } from "@/server/api/orders/updateOrderFields";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/api/auth/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const whoDid = session?.user?.fullName || "Неизвестный";

    const orderId = parseInt(params.id);
    if (!orderId) {
      return new Response("Неверный ID заказа", { status: 400 });
    }

    const body = await request.json();
    if (!body || typeof body !== "object") {
      return new Response("Тело запроса должно быть объектом", { status: 400 });
    }

    const updated = await updateOrderFields(orderId, body, whoDid);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Ошибка при обновлении полей заказа:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
