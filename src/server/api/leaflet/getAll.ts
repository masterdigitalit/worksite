import { prisma } from "@/server/db";

export async function getAllLeaflet() {
	return await prisma.leaflet.findMany({ orderBy: { name: "asc" } });
}

