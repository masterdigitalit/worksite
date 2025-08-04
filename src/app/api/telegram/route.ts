

import { getUpcomingOrders, markOrderAsNotificated } from "@/server/api/telegram/notify";

import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const orders = await getUpcomingOrders()
 
  return NextResponse.json(orders);
}


// /pages/api/orders/notify.ts  или /app/api/orders/notify/route.ts (в зависимости от структуры)


export async function PATCH(req: Request) {
  const { id } = await req.json();

  if (!id) return new Response("Missing ID", { status: 400 });

  const updated = await markOrderAsNotificated(id);
  return Response.json(updated);
}
