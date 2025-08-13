import { NextResponse } from "next/server";
import { serverGetDistributorDocuments } from "@/server/api/document/distributor/getDocuments";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const distributorId = Number(searchParams.get("distributorId"));

    if (!distributorId) {
      return NextResponse.json({ error: "Не указан distributorId" }, { status: 400 });
    }

    const documents = await serverGetDistributorDocuments(distributorId);

    return NextResponse.json(documents);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ошибка получения документов" }, { status: 500 });
  }
}
