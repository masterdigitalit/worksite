import { NextResponse } from "next/server";
import { getAllCities } from "@/server/api/city/getAll";

export async function GET() {
  const cities = await getAllCities()
  return NextResponse.json(cities);
}
