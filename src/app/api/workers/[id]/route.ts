import { NextResponse } from "next/server";
import { getWorkerById } from "@/server/api/workers/getWorker";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const worker = await getWorkerById(id);
  if (!worker) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(worker);
}



