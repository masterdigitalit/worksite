import { NextResponse } from "next/server";
import { addCity } from "@/server/api/city/addCity";

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    const city = await addCity(name);
    return NextResponse.json(city);
  } catch (error) {
    console.error("Ошибка при добавлении города:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
