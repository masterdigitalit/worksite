import { NextResponse } from "next/server";
import { getLeafletStats } from "@/server/api/leaflet/statistics";

export async function GET() {
  try {
    const stats = await getLeafletStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Ошибка получения статистики по листовкам:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
