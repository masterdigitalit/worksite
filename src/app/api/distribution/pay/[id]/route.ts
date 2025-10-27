import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/api/auth/auth";
import { uploadPaymentProof } from "@/server/api/distribution/pay"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  try {
    const id = parseInt(params.id);
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Файл не загружен" }, { status: 400 });
    }

    const result = await uploadPaymentProof({
      id,
      file,
      whoDid: session?.user?.fullName || "Неизвестный",
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Ошибка при загрузке оплаты:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
