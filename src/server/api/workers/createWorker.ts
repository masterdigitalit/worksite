import { prisma } from "@/server/db";

export async function createWorker(data: {
  fullName: string;
  phone: string;
  telegramUsername?: string;
}) {
  return prisma.worker.create({
    data: {
      fullName: data.fullName,
      phone: data.phone,
      telegramUsername: data.telegramUsername || null,
    },
  });
}
