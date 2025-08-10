import { NextResponse } from "next/server";

import { getLeafletOrderById } from "@/server/api/distribution/getLeafletOrderById";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  const order = await getLeafletOrderById(id)

  if (!order) {
    return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
  }

  return NextResponse.json(order);
}

