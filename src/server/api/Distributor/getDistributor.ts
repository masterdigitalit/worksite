import { prisma } from "@/server/db";

export async function getDistributorById(id: number) {
  const distributor = await prisma.distributor.findUnique({
    where: { id },
    include: {
      documents: true, // если нужно тянуть документы
    },
  });

  if (!distributor) {
    throw new Error("Разносчик не найден");
  }

  return distributor;
}
