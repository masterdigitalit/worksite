import { NextResponse } from "next/server";
import { getAllLogs } from "@/server/api/logs/get";

export async function GET() {
	try {
		const orders = await getAllLogs();
		return NextResponse.json(orders);
	} catch (error) {
		console.error("Ошибка при получении заказов:", error);
		return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
	}
}

