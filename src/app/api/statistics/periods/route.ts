import { NextResponse } from "next/server";
import { getAvailablePeriods } from "@/server/api/stats/page/getAvailablePeriods";

export async function GET() {
  try {
    const data = await getAvailablePeriods();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Ошибка получения периодов:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
