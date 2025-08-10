import { NextResponse } from "next/server";
import { createDistributor } from "@/server/api/Distributor/new";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const distributor = await createDistributor(body);
    return NextResponse.json(distributor);
  } catch (error) {
    console.error("Error creating distributor:", error);
    return NextResponse.json(
      { error: "Failed to create distributor" },
      { status: 500 }
    );
  }
}
