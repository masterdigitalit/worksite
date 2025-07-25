import { NextResponse } from "next/server";
import { getAllWorkers } from "@/server/api/workers/getAllWorkers";
import { createWorker } from "@/server/api/workers/createWorker";

export async function GET() {
  const workers = await getAllWorkers();
  return NextResponse.json(workers);
}

export async function POST(req: Request) {
  const data = await req.json();
  const worker = await createWorker(data);
  return NextResponse.json(worker);
}