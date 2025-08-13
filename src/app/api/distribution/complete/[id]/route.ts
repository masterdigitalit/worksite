import { NextResponse } from "next/server";
import { completeLeafletOrder } from "@/server/api/distribution/complete";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const { success, returnedLeaflets } = await req.json();

    const result = await completeLeafletOrder({
      id,
      success,
      returnedLeaflets,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Ошибка при завершении заказа:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
