import { NextRequest, NextResponse } from "next/server";

import { getLeafletById,  changeLeafletQuantity, updateLeafletQuantity } from "@/server/api/leaflet/change";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "Неверный id" }, { status: 400 });

    const item = await getLeafletById(id);
    if (!item) return NextResponse.json({ error: "Не найдено" }, { status: 404 });

    return NextResponse.json(item);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "Неверный id" }, { status: 400 });

    const body = await req.json();

    // Прямое обновление
    if (typeof body.quantity === "number") {
      const updated = await updateLeafletQuantity(id, body.quantity);
      return NextResponse.json(updated);
    }

    // Инкремент/декремент
    if (typeof body.diff === "number") {
      const updated = await changeLeafletQuantity(id, body.diff);
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Нужно передать quantity или diff" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
