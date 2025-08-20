import { NextResponse } from "next/server";
import { createDistributor } from "@/server/api/Distributor/new";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/api/auth/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    

    const body = await req.json();

    // передаём user.id и fullName из сессии
    const distributor = await createDistributor({
      ...body,
      invitedBy: session.user.fullName,
   
    });

    return NextResponse.json(distributor);
  } catch (error) {
    console.error("Error creating distributor:", error);
    return NextResponse.json(
      { error: "Failed to create distributor" },
      { status: 500 }
    );
  }
}
