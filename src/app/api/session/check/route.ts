// src/app/api/session/check/route.ts
import { NextRequest, NextResponse } from "next/server";
import { checkSession } from "@/server/api/sessions/chech";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  console.log(token)

  const result = await checkSession(token || "");

  return NextResponse.json(result);
}
