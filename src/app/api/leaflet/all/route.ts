import { NextResponse } from "next/server";
import { getAllLeaflet } from "@/server/api/leaflet/getAll";

export async function GET() {
  const cities = await getAllLeaflet()
  return NextResponse.json(cities);
}
