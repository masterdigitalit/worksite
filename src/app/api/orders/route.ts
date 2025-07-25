import { NextResponse } from "next/server";
import { getAllOrders } from "@/server/api/orders/getAllOrders";

export async function GET() {
  try {
    const orders = await getAllOrders();
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Ошибка при получении заказов:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

