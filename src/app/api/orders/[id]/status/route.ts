import { NextRequest, NextResponse } from "next/server";
import { setOrderWorker } from "@/server/api/orders/UpdateOrderStatus";

export async function PATCH(request: NextRequest,{ params }: { params: { id: string } }) {
  try {
    const orderId = parseInt(params.id);
    const { masterId, status } = await request.json();

    if (!masterId || !status || !orderId) {
      return new Response("masterId и status обязательны", { status: 400 });
    }
    console.log('mdsmdmsdm', masterId, status, orderId)



 

  
    const updated = await setOrderWorker(orderId,  status, masterId);
    return NextResponse.json(updated, { status: 200 });
  } 
  catch (error) {
    console.error("Ошибка при обновлении заказа:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
