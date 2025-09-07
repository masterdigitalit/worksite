import { NextRequest, NextResponse } from "next/server";
import { disableSession, getUserSessions } from "@/server/api/sessions/configurate";

export async function GET(req: NextRequest) {
	try {
		const userId = req.nextUrl.searchParams.get("userId");
		if (!userId) {
			return NextResponse.json({ error: "userId required" }, { status: 400 });
		}

		const sessions = await getUserSessions(userId);
		
		return NextResponse.json(sessions, { status: 200 });
	} catch (error: any) {
		console.error("GET /sessions error:", error);
		return NextResponse.json({ error: error.message || "Ошибка сервера" }, { status: 500 });
	}
}

export async function PATCH(req: NextRequest) {
	try {
		const { token } = await req.json();
		if (!token) {
			return NextResponse.json({ error: "token required" }, { status: 400 });
		}

		const updated = await disableSession(token);
		return NextResponse.json({ success: true, updated }, { status: 200 });
	} catch (error: any) {
		console.error("PATCH /sessions error:", error);
		return NextResponse.json({ error: error.message || "Ошибка сервера" }, { status: 500 });
	}
}
