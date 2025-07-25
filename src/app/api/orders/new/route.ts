// app/api/orders/new/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createNewOrder } from "@/server/api/orders/addOrder";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const newOrder = await createNewOrder(body);

    return NextResponse.json(newOrder);
  } catch (error) {
    console.error("Ошибка при создании заказа:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
