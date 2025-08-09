import { NextResponse } from "next/server";
import { addLeaflet } from "@/server/api/leaflet/addLeaflet";

export async function POST(req: Request) {
  try {
    const { name, value } = await req.json();
    const city = await addLeaflet(name, value);
    return NextResponse.json(city);
  } catch (error) {
    console.error("Ошибка при добавлении города:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
