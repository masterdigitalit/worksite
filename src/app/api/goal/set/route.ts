
import { setGoal } from "@/server/api/target/set";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  

  const body = await req.json();

  try {
    const goal = await setGoal(body);
    return NextResponse.json(goal);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
