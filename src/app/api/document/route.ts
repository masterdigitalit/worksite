import { NextResponse } from "next/server";
import { uploadDocumentToOrder } from "@/server/api/document/upload";

export async function POST(req: Request) {
  const formData = await req.formData();
  const orderId = formData.get("orderId");
  const file = formData.get("file");

  if (!orderId || typeof orderId !== "string") {
    return NextResponse.json({ error: "orderId обязателен" }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Файл не найден" }, { status: 400 });
  }

  try {
    const document = await uploadDocumentToOrder(Number(orderId), file);
    return NextResponse.json({ success: true, document });
  } catch (error) {
    console.error("Ошибка при загрузке документа:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}


