import { prisma } from "@/server/db";

export async function getLeafletById(id: number) {
  const item = await prisma.leaflet.findUnique({
    where: { id },
  });
  return item;
}

export async function updateLeafletQuantity(id: number, quantity: number) {
  const updated = await prisma.leaflet.update({
    where: { id },
    data: {value: quantity },
  });
  return updated;
}

// Можно добавить increment/decrement
export async function changeLeafletQuantity(id: number, diff: number) {
  const updated = await prisma.leaflet.update({
    where: { id },
    data: { value: { increment: diff } },
  });
  return updated;
}
