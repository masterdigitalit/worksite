import { NextResponse } from "next/server";
import { createWorker } from "@/server/api/workers/createWorker";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { fullName, phone, telegramUsername } = body;

    if (!fullName || !phone) {
      return NextResponse.json({ error: "Обязательные поля не заполнены" }, { status: 400 });
    }

    const worker = await createWorker({ fullName, phone, telegramUsername });
    return NextResponse.json(worker);
  } catch (err) {
    console.error("Ошибка при создании работника:", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
