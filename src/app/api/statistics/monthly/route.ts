// /app/api/statistics/monthly/route.ts
import { NextResponse } from "next/server";
import { getMonthlyStatistics } from "@/server/api/stats/page/month";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get("year") || "");
  const month = parseInt(searchParams.get("month") || "");

  try {
    const stats = await getMonthlyStatistics({ year: isNaN(year) ? undefined : year, month: isNaN(month) ? undefined : month });
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Ошибка получения статистики:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
