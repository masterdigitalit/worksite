import { getWorkersToSet } from "@/server/api/workers/getWorkersToSet";
import { NextResponse } from "next/server";

export async function GET() {
	const workers = await getWorkersToSet();
	
	return NextResponse.json(workers);
}