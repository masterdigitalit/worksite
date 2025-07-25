import { NextResponse } from "next/server";

import { getOrderById } from '@/server/api/orders/getOrder';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  const order = await getOrderById(id)

  if (!order) {
    return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
  }

  return NextResponse.json(order);
}

