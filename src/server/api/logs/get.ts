import { prisma } from "@/server/db";

export async function getAllLogs() {
	return prisma.logs.findMany(
	
	);
}
