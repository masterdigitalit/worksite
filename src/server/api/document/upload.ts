import { prisma } from "@/server/db";
import { v4 as uuidv4 } from "uuid";
import { writeFile } from "fs/promises";
import path from "path";

export async function uploadDocumentToOrder(orderId: number, file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const extension = file.name.split(".").pop() || "png";
  const filename = `${uuidv4()}.${extension}`;
  const relativePath = `uploads/${filename}`;
  const absolutePath = path.join(process.cwd(), "public", relativePath);

  await writeFile(absolutePath, buffer);

  const document = await prisma.orderDocument.create({
    data: {
      orderId,
      type: extension.toUpperCase(), // можно улучшить, добавив проверку на допустимые типы
      url: `/${relativePath}`,
    },
  });

  return document;
}
