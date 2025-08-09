import { NextResponse } from "next/server";
import { getLeafletWithOrders } from "@/server/api/leaflet/getLeafletWithOrders";

export async function GET() {
  const cities = await getLeafletWithOrders();
  return NextResponse.json(cities);
}
