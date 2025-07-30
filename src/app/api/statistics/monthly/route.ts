import { NextResponse } from "next/server";
import { getMonthlyStatistics } from "@/server/api/stats/page/month";

export async function GET() {
  try {
    const stats = await getMonthlyStatistics();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("❌ Ошибка при получении статистики по месяцам:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
