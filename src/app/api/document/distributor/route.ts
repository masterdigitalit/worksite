// app/api/document/distributor/route.ts
import { NextResponse } from "next/server";
import { serverUploadDistributorDocument } from "@/server/api/document/distributor/document";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const distributorId = Number(formData.get("distributorId"));
    const file = formData.get("file") as File | null;

    if (!distributorId || !file) {
      return NextResponse.json({ error: "Нет данных" }, { status: 400 });
    }

    const document = await serverUploadDistributorDocument(distributorId, file);

    return NextResponse.json(document);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ошибка загрузки" }, { status: 500 });
  }
}
