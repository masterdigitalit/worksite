import { prisma } from "@/server/db";
import { Create } from "../logs/create";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import { sendPhotoToAdmin } from "bot/bot";
interface UploadPaymentProofInput {
  id: number;
  file: File;
  whoDid: string;
}

export async function uploadPaymentProof({ id, file, whoDid }: UploadPaymentProofInput) {
  const order = await prisma.leafletOrder.findUnique({ where: { id } });
  if (!order) throw new Error("Заказ не найден");

  // --- Сохраняем файл в /public/uploads/payments ---
  const uploadDir = path.join(process.cwd(), "public/distribution");
  await mkdir(uploadDir, { recursive: true });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileName = `${id}_${Date.now()}_${file.name}`;
  const filePath = path.join(uploadDir, fileName);

  await writeFile(filePath, buffer);

  // --- Обновляем заказ ---
  const updated = await prisma.leafletOrder.update({
    where: { id },
    data: {
      state: "DONE",
      paymentPhoto: `${fileName}`,
    },
    include: { distributor: true, leaflet: true, city: true },
  });
  await sendPhotoToAdmin(fileName, `Фото оплаты для заказа #${id}`);
  

  // --- Лог ---
  await Create({
    whoDid,
    whatHappend: `Прикреплено фото оплаты для заказа ${id} , заказ оплачен`,
    type: "advertising",
  });

  return updated;
}
