import { NextResponse } from "next/server";
import { getCitiesWithOrders } from "@/server/api/city/getCitiesWithOrders";

export async function GET() {
  const cities = await getCitiesWithOrders();
  return NextResponse.json(cities);
}
