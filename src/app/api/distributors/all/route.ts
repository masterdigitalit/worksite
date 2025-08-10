import { NextResponse } from "next/server";
import { getAllDistributors } from "@/server/api/Distributor/getAll";

export async function GET() {
  const distributors = await getAllDistributors();
  return NextResponse.json(distributors);
}
