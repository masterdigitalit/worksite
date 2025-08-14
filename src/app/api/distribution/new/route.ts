import { NextResponse } from "next/server";
import { createLeafletOrder } from "@/server/api/distribution/create";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newOrder = await createLeafletOrder(body);
    return NextResponse.json(newOrder, { status: 200 });
  } catch (error) {
    console.error("Error creating LeafletOrder:", error);
    return NextResponse.json(
      { error: "Failed to create LeafletOrder" },
      { status: 500 }
    );
  }
}
