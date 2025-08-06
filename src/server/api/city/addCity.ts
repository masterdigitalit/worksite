import { prisma } from "@/server/db";

export async function addCity(name: string) {
  if (!name || typeof name !== "string") {
    throw new Error("Неверное название города");
  }

  return prisma.city.create({
    data: { name: name.trim() },
  });
}
