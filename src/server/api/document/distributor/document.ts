import { prisma } from "@/server/db";
import { v4 as uuidv4 } from "uuid";
import { writeFile } from "fs/promises";
import path from "path";

export async function serverUploadDistributorDocument(distributorId: number, file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const extension = file.name.split(".").pop() || "png";
  const filename = `${uuidv4()}.${extension}`;
  const relativePath = `distributor/${filename}`; // сохраняем в public/distributor
  const absolutePath = path.join(process.cwd(), "public", relativePath);

  await writeFile(absolutePath, buffer);

  const document = await prisma.distributorDocument.create({
    data: {
      distributorId,
      type: extension.toUpperCase(),
      url: `/${relativePath}`,
    },
  });

  return document;
}
