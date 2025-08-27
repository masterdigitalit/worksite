import { NextRequest, NextResponse } from "next/server";
import { deleteManager } from "@/server/api/managers/deleteManagers";


export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "token required" }, { status: 400 });
    }

    const updated = await deleteManager(id);
    return NextResponse.json({ success: true, updated }, { status: 200 });
  } catch (error: any) {
    console.error("PATCH /sessions error:", error);
    return NextResponse.json({ error: error.message || "Ошибка сервера" }, { status: 500 });
  }
}
