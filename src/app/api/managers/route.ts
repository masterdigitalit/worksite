import { NextResponse } from "next/server";
import { getAllManagers } from "@/server/api/managers/getAllManagers";

export async function GET() {
  const managers = await getAllManagers();
  return NextResponse.json(managers);
}