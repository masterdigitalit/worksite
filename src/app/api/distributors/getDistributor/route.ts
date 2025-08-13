import { NextResponse } from "next/server";
import { getDistributorById } from "@/server/api/Distributor/getDistributor";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));

    if (!id || isNaN(id)) {
      return NextResponse.json({ error: "Неверный ID" }, { status: 400 });
    }

    const distributor = await getDistributorById(id);
    return NextResponse.json(distributor);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Ошибка получения разносчика" },
      { status: 500 }
    );
  }
}
