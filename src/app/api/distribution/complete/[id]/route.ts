import { NextResponse } from "next/server";
import { completeLeafletOrder } from "@/server/api/distribution/complete";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/api/auth/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    console.log(session)

    
  try {
    const id = parseInt(params.id);
    const { success, returnedLeaflets, distributed, returned } = await req.json();
 console.log(success, returnedLeaflets, distributed, returned)
    const result = await completeLeafletOrder({
      id,
      success,
      returnedLeaflets,
      distributed,
      returned,
      whoDid: session.user.fullName,
    });
   

    return NextResponse.json(result);
  } catch (error) {
    console.error("Ошибка при завершении заказа:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}







