import { prisma } from "@/server/db";

export async function getAllCities() {
	return await prisma.city.findMany({ orderBy: { name: "asc" } });
}

