import { NextResponse } from "next/server";
import { getAllLeafletOrders } from "@/server/api/distribution/getAll";

export async function GET() {
  const orders = await getAllLeafletOrders();
  return NextResponse.json(orders);
}
