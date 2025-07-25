import { prisma } from "@/server/db";

type CreateWorkerInput = {
  fullName: string;
  phone: string;
  telegramUsername?: string;
};

export async function createWorker(data: CreateWorkerInput) {
  if (!data.fullName || !data.phone) throw new Error("Missing required fields");

  return prisma.worker.create({ data });
}
