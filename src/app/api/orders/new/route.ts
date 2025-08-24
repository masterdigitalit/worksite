// app/api/orders/new/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createNewOrder } from "@/server/api/orders/addOrder";

import { getServerSession } from "next-auth";
import { authOptions } from "@/server/api/auth/auth";

export async function POST(req: NextRequest) {
   const session = await getServerSession(authOptions);
  try {
    const body = await req.json();

    const newOrder = await createNewOrder({...body, whoDid:session.user.fullName});

    return NextResponse.json(newOrder);
  } catch (error) {
    console.error("Ошибка при создании заказа:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
