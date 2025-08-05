// app/api/goal/get/route.ts
import { getGoal } from "@/server/api/target/get";
import { NextResponse } from "next/server";

export async function GET() {
  const goal = await getGoal();
  return NextResponse.json(goal ?? {});
}
