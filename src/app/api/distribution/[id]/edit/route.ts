import { NextResponse } from "next/server";
import { editLeafletOrder } from "@/server/api/distribution/edit";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/api/auth/auth";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
	 const session = await getServerSession(authOptions);
  const body = await request.json();

  const { quantity } = body;

  if (typeof quantity !== "number" || quantity < 0) {
    return NextResponse.json({ error: "Некорректное количество" }, { status: 400 });
  }

 // Проверяем существование заказа
  // const existingOrder = await getLeafletOrderById(id);
  // if (!existingOrder) {
  //   return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
  // }

  // Обновляем поле quantity
  const updatedOrder = editLeafletOrder({id: parseInt( id), quantity:quantity, whoDid: session.user.fullName })

  return NextResponse.json(updatedOrder);
}