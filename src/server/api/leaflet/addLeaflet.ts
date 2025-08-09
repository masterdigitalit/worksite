import { prisma } from "@/server/db";

export async function addLeaflet(name: string, value:string) {
  if (!name || typeof name !== "string") {
    throw new Error("Неверное название города");
  }

  return prisma.leaflet.create({
    data: { name: name.trim() ,
      value:parseInt(value)
    },
  });
}
